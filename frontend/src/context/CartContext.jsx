/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from "react";
import { isAuthenticated } from "../utils/auth";
import axiosInstance from "../utils/axiosConfig";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    // Don't fetch if user is not logged in
    if (!isAuthenticated()) {
      setCartItems([]);
      setTotal(0);
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.get('/api/cart/');
      
      // Axios automatically parses JSON, so response.data is the data
      const cartData = response.data.cart || response.data;
      const items = cartData.items || [];
      
      // Transform the data to ensure consistent property names
      const transformedItems = items.map(item => ({
        id: item.id,
        product_id: item.product_id || item.id,
        name: item.product_name || item.name,
        product_name: item.product_name || item.name,
        price: parseFloat(item.product_price || item.price || 0),
        product_price: parseFloat(item.product_price || item.price || 0),
        quantity: item.quantity || 1,
        image: item.product_image || item.image,
        product_image: item.product_image || item.image
      }));
      
      setCartItems(transformedItems);
      setTotal(parseFloat(cartData.total || response.data.total || 0));
    } catch (err) {
      if (err.response) {
        if (err.response.status === 401) {
          setCartItems([]);
          setTotal(0);
        }
      } else if (err.request) {
        // The request was made but no response was received
        console.error("No response received:", err.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Error setting up request:", err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch cart when component mounts and when auth state changes
  useEffect(() => {
    fetchCart();
  }, []);

  // Listen for auth changes
  useEffect(() => {
    const handleAuthChange = () => {
      fetchCart();
    };

    const handleUnauthorized = () => {
      setCartItems([]);
      setTotal(0);
    };

    window.addEventListener('auth-change', handleAuthChange);
    window.addEventListener('unauthorized', handleUnauthorized);
    window.addEventListener('storage', handleAuthChange);

    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
      window.removeEventListener('unauthorized', handleUnauthorized);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  const addToCart = async (product) => {
    if (!isAuthenticated()) {
      console.warn("Please login to add items to cart");
      return;
    }

    setLoading(true);
    try {
      const productId = typeof product === 'object' ? product.id : product;
      
      await axiosInstance.post('/api/cart/add/', {
        product_id: productId
      });
      
      await fetchCart();
    } catch (err) {
      if (err.response?.status === 401) {
        setCartItems([]);
        setTotal(0);
      } else {
        console.error("Error adding to cart:", err.response?.data || err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId) => {
    if (!isAuthenticated()) return;

    setLoading(true);
    try {
      await axiosInstance.post('/api/cart/remove/', {
        item_id: itemId
      });
      
      await fetchCart();
    } catch (err) {
      if (err.response?.status === 401) {
        setCartItems([]);
        setTotal(0);
      } else {
        console.error("Error removing from cart:", err.response?.data || err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    if (!isAuthenticated()) return;

    if (quantity <= 0) {
      await removeFromCart(itemId);
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.post('/api/cart/update-quantity/', {
        item_id: itemId,
        quantity: quantity
      });
      
      await fetchCart();
    } catch (err) {
      if (err.response?.status === 401) {
        setCartItems([]);
        setTotal(0);
      } else {
        console.error("Error updating cart:", err.response?.data || err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const clearCart = () => {
    setCartItems([]);
    setTotal(0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        total,
        loading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);