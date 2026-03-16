export const saveToken = (token) => {
  localStorage.setItem('access_token', token.access);
  localStorage.setItem('refresh_token', token.refresh);
  localStorage.setItem('token_expiry', Date.now() + 15 * 60 * 1000);
  window.dispatchEvent(new CustomEvent('auth-change'));
};

export const removeToken = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('token_expiry');
  window.dispatchEvent(new CustomEvent('auth-change'));
};

export const getAccessToken = () => {
  return localStorage.getItem('access_token');
};

export const getRefreshToken = () => {
  return localStorage.getItem('refresh_token');
};

export const isTokenValid = (token) => {
  if (!token) return false;
  
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return false;
    
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    const { exp } = JSON.parse(jsonPayload);
    const currentTime = Date.now() / 1000;
    
    return exp > currentTime;
  } catch (error) {
    console.error('Error validating token:', error);
    return false;
  }
};

// Check token validity and refresh if needed
export const checkAndRefreshToken = async () => {
  const accessToken = getAccessToken();
  const refreshToken = getRefreshToken();

  if (!accessToken || !refreshToken) {
    return false;
  }

  // If token is still valid for at least 5 minutes, do nothing
  if (isTokenValid(accessToken)) {
    return true;
  }

  // Try to refresh
  try {
    const response = await fetch(`${import.meta.env.VITE_DJANGO_BASE_URL}/api/token/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('access_token', data.access);
      window.dispatchEvent(new CustomEvent('auth-change'));
      return true;
    } else {
      removeToken();
      return false;
    }
  } catch (error) {
    console.error('Error refreshing token:', error);
    removeToken();
    return false;
  }
};

export const isAuthenticated = () => {
  return !!getAccessToken() && !!getRefreshToken();
};

// Track if we're already refreshing to prevent multiple refresh requests
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Refresh token function
export const refreshAccessToken = async () => {
  const refreshToken = getRefreshToken();
  
  if (!refreshToken) {
    return null;
  }

  try {
    const response = await fetch(`${import.meta.env.VITE_DJANGO_BASE_URL}/api/token/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('access_token', data.access);
      // Note: If your backend returns a new refresh token, save it too
      // if (data.refresh) {
      //   localStorage.setItem('refresh_token', data.refresh);
      // }
      return data.access;
    } else {
      // Refresh failed - clear tokens
      removeToken();
      return null;
    }
  } catch (error) {
    console.error('Error refreshing token:', error);
    removeToken();
    return null;
  }
};

export const authFetch = async (url, options = {}) => {
  let token = getAccessToken();
  
  // First attempt with current token
  let response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
  });

  // If unauthorized, try to refresh the token
  if (response.status === 401) {
    // Check if we have a refresh token
    const refreshToken = getRefreshToken();
    
    if (!refreshToken) {
      // No refresh token, user needs to login
      removeToken();
      window.dispatchEvent(new CustomEvent('unauthorized'));
      return response;
    }

    // If we're already refreshing, wait for it to complete
    if (isRefreshing) {
      try {
        const newToken = await new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        });
        
        // Retry the original request with new token
        const retryResponse = await fetch(url, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${newToken}`,
            ...options.headers,
          },
        });
        return retryResponse;
      } catch (error) {
        console.error('Error in queue retry:', error);
        return response;
      }
    }

    isRefreshing = true;

    try {
      // Attempt to refresh the token
      const refreshResponse = await fetch(`${import.meta.env.VITE_DJANGO_BASE_URL}/api/token/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        // Save the new access token
        localStorage.setItem('access_token', data.access);
        
        // If your backend returns a new refresh token (when ROTATE_REFRESH_TOKENS=True)
        if (data.refresh) {
          localStorage.setItem('refresh_token', data.refresh);
        }

        // Process the queue with the new token
        processQueue(null, data.access);

        // Retry the original request with the new token
        const retryResponse = await fetch(url, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${data.access}`,
            ...options.headers,
          },
        });

        // Dispatch auth change event to update UI
        window.dispatchEvent(new CustomEvent('auth-change'));
        
        return retryResponse;
      } else {
        // Refresh failed - clear tokens and reject queue
        removeToken();
        processQueue(new Error('Failed to refresh token'), null);
        window.dispatchEvent(new CustomEvent('unauthorized'));
        return response;
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      removeToken();
      processQueue(error, null);
      window.dispatchEvent(new CustomEvent('unauthorized'));
      return response;
    } finally {
      isRefreshing = false;
    }
  }
  
  return response;
};