import { getRefreshToken, saveToken, removeToken } from './auth';

let refreshPromise = null;

export const refreshToken = async () => {
  // If already refreshing, return the existing promise
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = new (async (resolve, reject) => {
    try {
      const refreshToken = getRefreshToken();
      
      if (!refreshToken) {
        throw new Error('No refresh token');
      }

      const response = await fetch(`${import.meta.env.VITE_DJANGO_BASE_URL}/api/token/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        saveToken(data);
        resolve(data.access);
      } else {
        removeToken();
        reject(new Error('Refresh failed'));
      }
    } catch (error) {
      removeToken();
      reject(error);
    } finally {
      refreshPromise = null;
    }
  });

  return refreshPromise;
};