import { createContext, useContext, useState, useEffect } from "react";
import { authFetch } from "../utils/auth";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const BACKEND_URL = import.meta.env.VITE_DJANGO_BASE_URL;
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);

const fetchCart = async () => {
  try {
    const response = await authFetch(`${BACKEND_URL}/api/cart/`);
    const data = await response.json();
    const cartData = data.cart || data;
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
    setTotal(parseFloat(cartData.total || data.total || 0));
  } catch (err) {
    console.error("Error fetching cart:", err);
    setCartItems([]);
    setTotal(0);
  }
};

  useEffect(() => {
    fetchCart();
  }, [BACKEND_URL]);

  // Add product to cart
const addToCart = async (product) => {
  try {
    // Handle both product object and product ID
    const productId = typeof product === 'object' ? product.id : product;
    
    const response = await authFetch(`${BACKEND_URL}/api/cart/add/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ product_id: productId }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to add to cart');
    }
    
    // Refresh the cart after adding
    await fetchCart();
  } catch (err) {
    console.error("Error adding to cart:", err);
  }
};

  // Remove product from cart
const removeFromCart = async (itemId) => {
  try {
    const response = await authFetch(`${BACKEND_URL}/api/cart/remove/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ item_id: itemId }), // Changed from product_id to item_id
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to remove from cart');
    }
    
    fetchCart();
  } catch (err) {
    console.error("Error removing from cart:", err);
  }
};

//update quantity of a product in cart
const updateQuantity = async (itemId, quantity) => {
  if (quantity <= 0) {
    removeFromCart(itemId);
    return;
  }
  try {
    const response = await authFetch(`${BACKEND_URL}/api/cart/update-quantity/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        item_id: itemId,
        quantity: quantity 
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update cart');
    }
    
    fetchCart();
  } catch (err) {
    console.error("Error updating cart:", err);
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
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
