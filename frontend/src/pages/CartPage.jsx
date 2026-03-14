// import React, { useState } from 'react';
import { useCart } from "../context/CartContext";
import { Link, useNavigate } from 'react-router-dom';

function CartPage() {
  const { cartItems, removeFromCart, updateQuantity } = useCart();
  const navigate = useNavigate();
  // const [couponCode, setCouponCode] = useState('');
  // const [discount, setDiscount] = useState(0);
  // const [couponApplied, setCouponApplied] = useState(false);

  const BACKEND_URL = import.meta.env.VITE_DJANGO_BASE_URL;
  const CURRENCY = import.meta.env.VITE_CURRENCY
  // const [couponError, setCouponError] = useState('');

  // Safe number parsing function
  const parseNumber = (value, defaultValue = 0) => {
    if (value === null || value === undefined) return defaultValue;
    const num = parseFloat(value);
    return isNaN(num) ? defaultValue : num;
  };

  // Calculate subtotal safely
  const subtotal = cartItems.reduce((sum, item) => {
    const price = parseNumber(item.price) || parseNumber(item.product_price) || 0;
    const quantity = parseNumber(item.quantity, 1);
    return sum + (price * quantity);
  }, 0);
  
  const shipping = subtotal > 100 ? 0 : 10;
  const tax = subtotal * 0.1; // 10% tax
  const finalTotal = subtotal + shipping + tax;

  const handleQuantityChange = (id, newQuantity) => {
    const quantity = parseInt(newQuantity);
    if (!isNaN(quantity) && quantity >= 1) {
      updateQuantity(id, quantity);
    }
  };

  // const handleApplyCoupon = () => {
  //   // Simulate coupon validation
  //   const validCoupons = {
  //     'SAVE50': 50,
  //     'SAVE20': 20,
  //     'FREESHIP': 0
  //   };

  //   if (validCoupons[couponCode.toUpperCase()]) {
  //     setDiscount(validCoupons[couponCode.toUpperCase()]);
  //     setCouponApplied(true);
  //     setCouponError('');
  //   } else {
  //     setCouponError('Invalid coupon code');
  //     setDiscount(0);
  //     setCouponApplied(false);
  //   }
  // };

  const handleContinueShopping = () => {
    navigate('/');
  };

  // Helper function to get item price
  const getItemPrice = (item) => {
    return parseNumber(item.price) || parseNumber(item.product_price) || 0;
  };

  // Helper function to get item name
  const getItemName = (item) => {
    return item.name || item.product_name || 'Product';
  };

  // Helper function to get item image
  const getItemImage = (item) => {
    const image = item.image || item.product_image;
    if (!image) return 'https://via.placeholder.com/80x80?text=No+Image';
    if (image.startsWith('http')) return image;
    return `${BACKEND_URL}${image}`;
  };

  // Helper function to get item quantity
  const getItemQuantity = (item) => {
    return parseNumber(item.quantity, 1);
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
            {/* Empty Cart Illustration */}
            <div className="flex justify-center mb-6">
              <div className="bg-gray-100 p-6 rounded-full">
                <svg 
                  className="w-24 h-24 text-gray-400" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={1.5} 
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" 
                  />
                </svg>
              </div>
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Your cart is empty
            </h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Looks like you haven't added any items to your cart yet. 
              Start shopping to fill it up!
            </p>
            <button
              onClick={handleContinueShopping}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg inline-flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span>Continue Shopping</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Cart Summary */}
                {/* Main Content - Responsive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-20">
          {/* Cart Items - Left Column */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {/* Desktop Table Header - Hidden on mobile */}
              <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b font-medium text-gray-700">
                <div className="col-span-6">Product</div>
                <div className="col-span-2 text-center">Price</div>
                <div className="col-span-2 text-center">Quantity</div>
                <div className="col-span-1 text-center">Total</div>
                <div className="col-span-1"></div>
              </div>

              {/* Cart Items */}
              <div className="divide-y divide-gray-200">
                {cartItems.map(item => {
                  const itemPrice = getItemPrice(item);
                  const itemQuantity = getItemQuantity(item);
                  const itemTotal = itemPrice * itemQuantity;
                  
                  return (
                    <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors">
                      {/* Mobile Layout */}
                      <div className="md:hidden">
                        <div className="flex items-start space-x-4 mb-3">
                          {/* Product Image */}
                          <img 
                            src={getItemImage(item)} 
                            alt={getItemName(item)}
                            className="w-20 h-20 object-cover rounded-lg shadow-sm"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/80x80?text=No+Image';
                            }}
                          />
                          
                          {/* Product Info */}
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-800 mb-1 line-clamp-2">
                              {getItemName(item)}
                            </h3>
                            <p className="text-sm text-gray-500 mb-2">
                              {CURRENCY} {!isNaN(itemPrice) ? itemPrice.toFixed(2) : '0.00'}
                            </p>
                            
                            {/* Quantity and Total */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center border border-gray-300 rounded-lg">
                                <button
                                  onClick={() => handleQuantityChange(item.id, itemQuantity - 1)}
                                  className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-l-lg"
                                  disabled={itemQuantity <= 1}
                                >
                                  -
                                </button>
                                <span className="px-3 py-1 border-x border-gray-300 min-w-[40px] text-center">
                                  {itemQuantity}
                                </span>
                                <button
                                  onClick={() => handleQuantityChange(item.id, itemQuantity + 1)}
                                  className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-r-lg"
                                >
                                  +
                                </button>
                              </div>
                              
                              <span className="font-semibold text-gray-900">
                                {CURRENCY} {!isNaN(itemTotal) ? itemTotal.toFixed(2) : '0.00'}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Remove Button */}
                        <div className="flex justify-end">
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-600 hover:text-red-800 text-sm font-semibold flex items-center space-x-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>

                      {/* Desktop Layout */}
                      <div className="hidden md:grid grid-cols-12 gap-4 items-center">
                        {/* Product */}
                        <div className="col-span-6 flex items-center space-x-4">
                          <img 
                            src={getItemImage(item)}
                            alt={getItemName(item)}
                            className="w-16 h-16 object-cover rounded-lg shadow-sm"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/64x64?text=No+Image';
                            }}
                          />
                          <span className="font-medium text-gray-800 line-clamp-2">
                            {getItemName(item)}
                          </span>
                        </div>
                        
                        {/* Price */}
                        <div className="col-span-2 text-center text-gray-600">
                          {CURRENCY} {!isNaN(itemPrice) ? itemPrice.toFixed(2) : '0.00'}
                        </div>
                        
                        {/* Quantity */}
                        <div className="col-span-2">
                          <input
                            type="number"
                            value={itemQuantity}
                            min="1"
                            onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                            className="w-20 mx-auto block border border-gray-300 rounded-lg text-center py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                        
                        {/* Total */}
                        <div className="col-span-1 text-center font-semibold text-gray-900">
                          {CURRENCY} {!isNaN(itemTotal) ? itemTotal.toFixed(2) : '0.00'}
                        </div>
                        
                        {/* Actions */}
                        <div className="col-span-1 text-right">
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-600 hover:text-red-800 font-semibold transition-colors"
                            title="Remove item"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Order Summary - Right Column */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
              
              {/* Coupon Code */}
              {/* <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Have a coupon?
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter code"
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    disabled={couponApplied}
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={couponApplied || !couponCode}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                      couponApplied || !couponCode
                        ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                        : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white'
                    }`}
                  >
                    Apply
                  </button>
                </div>
                {couponError && (
                  <p className="text-red-500 text-sm mt-1">{couponError}</p>
                )}
                {couponApplied && (
                  <p className="text-green-500 text-sm mt-1">
                    Coupon applied! {CURRENCY} {!isNaN(discount) ? discount.toFixed(2) : '0.00'} discount
                  </p>
                )}
              </div> */}

              {/* Price Breakdown */}
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{CURRENCY} {!isNaN(subtotal) ? subtotal.toFixed(2) : '0.00'}</span>
                </div>
                
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'Free' : `${CURRENCY} {!isNaN(shipping) ? shipping.toFixed(2) : '0.00'}`}</span>
                </div>
                
                <div className="flex justify-between text-gray-600">
                  <span>Tax (10%)</span>
                  <span>{CURRENCY} {!isNaN(tax) ? tax.toFixed(2) : '0.00'}</span>
                </div>
                
                {/* {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-{CURRENCY} {!isNaN(discount) ? discount.toFixed(2) : '0.00'}</span>
                  </div>
                )} */}
                
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-indigo-600">
                      {CURRENCY} {!isNaN(finalTotal) ? finalTotal.toFixed(2) : '0.00'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Free Shipping Progress */}
              {subtotal < 100 && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Free Shipping</span>
                    <span>{CURRENCY} {!isNaN(100 - subtotal) ? (100 - subtotal).toFixed(2) : '100.00'} more</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(((subtotal || 0) / 100) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Checkout Button */}
              <Link to="/checkout">
                <button
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg"
                >
                  Proceed to Checkout
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CartPage;