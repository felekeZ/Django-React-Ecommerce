import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

const ProductCard = ({ product, baseImageUrl = import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT }) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { addToCart } = useCart();
  const CURRENCY = import.meta.env.VITE_CURRENCY || 'USD';

  // Construct full image URL
  // const getImageUrl = () => {
  //   if (product.image?.startsWith('http')) {
  //     return product.image;
  //   }
    
  //   const imagePath = product.image?.startsWith('/') ? product.image.slice(1) : product.image;
  //   return `${baseImageUrl}/${imagePath}`;
  // };
  
  // const baseImageUrlImageKit = import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT;
  
  const getImageUrl = () => {
    // if (!product.image) return '/placeholder-image.jpg'; // Fallback for no image
    
    // If it's already a full URL, return as is
    if (product.image.startsWith('http')) {
      return product.image;
    }
    
    // Clean the image path (remove leading slash if present)
    const cleanPath = product.image.startsWith('/') ? product.image.slice(1) : product.image;
    
    // Build the ImageKit URL
    return `${baseImageUrl}/products/${cleanPath}`;
  };

  const imageUrl = getImageUrl();

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if(!localStorage.getItem("access_token")) {
      toast.error("Please log in to add items to your cart.");
      return;
    }
    addToCart(product.id);
    toast.success(`${product.name} added to cart!`);
  };

  // Format price
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: CURRENCY,
    minimumFractionDigits: 2
  }).format(product.price);

  // Get first word of category
  const categoryName = product.category?.name?.split(' ')[0] || 'Product';

  return (
    <div className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
      {/* Product Image - Smaller */}
      <Link to={`/product/${product.id}`} className="block relative overflow-hidden">
        <div className="relative aspect-square bg-gray-100">
          {/* Loading Spinner */}
          {!isImageLoaded && !imageError && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          
          {/* Product Image */}
          <img
            // src={getImageUrl()}
            src={imageUrl}
            alt={product.name}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              isImageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setIsImageLoaded(true)}
            onError={() => {
              setImageError(true);
              setIsImageLoaded(true);
            }}
          />

          {/* Category Badge - Smaller */}
          {product.category && (
            <div className="absolute top-2 left-2">
              <span className="px-2 py-0.5 text-[10px] font-medium bg-indigo-600 text-white rounded-full shadow-sm">
                {categoryName}
              </span>
            </div>
          )}

          {/* Sale Badge - Smaller */}
          {product.salePrice && (
            <div className="absolute top-2 right-2">
              <span className="px-2 py-0.5 text-[10px] font-bold bg-red-500 text-white rounded-full animate-pulse shadow-sm">
                SALE
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Product Info - Compact */}
      <div className="p-3">
        {/* Product Name */}
        <Link to={`/product/${product.id}`} className="block">
          <h3 className="text-sm font-semibold text-gray-800 mb-1 line-clamp-1 hover:text-indigo-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Description - One line with ellipsis */}
        <p className="text-xs text-gray-500 mb-2 line-clamp-1">
          {product.description || "No description available"}
        </p>

        {/* Price and Add to Cart - Compact row */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400 block">Price</span>
            <span className="text-base font-bold text-indigo-600">
              {formattedPrice}
            </span>
          </div>
          
          {/* Rating - Small */}
          {product.rating && (
            <div className="flex items-center bg-yellow-50 px-1.5 py-0.5 rounded">
              <svg className="w-3 h-3 text-yellow-400 mr-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-xs font-medium text-gray-700">{product.rating}</span>
            </div>
          )}
        </div>

        {/* Add to Cart Button - Compact */}
        <button
          onClick={handleAddToCart}
          className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium py-2 px-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-1 hover:shadow-md active:scale-95 cursor-pointer"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Add
        </button>
      </div>
    </div>
  );
};

export default ProductCard;