// pages/ProductDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';


const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const { addToCart } = useCart();

const handleAddToCart = () => {
  if(!localStorage.getItem("access_token")) {
    toast.error("Please log in to add items to your cart.");
    return;
  }
  addToCart(product.id);
}
  // Your backend URL
  const BACKEND_URL = import.meta.env.VITE_DJANGO_BASE_URL;
  const BACKEND_URLImageKit = import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT;


  // Fetch product details
  useEffect(() => {
    fetchProductDetails();
  }, [id, BACKEND_URL]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch main product
      const response = await fetch(`${BACKEND_URL}/api/products/${id}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch product: ${response.status}`);
      }

      const data = await response.json();
      console.log('Product details:', data);
      setProduct(data);

      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching product:', err);
    } finally {
      setLoading(false);
    }
  };

  // Format price
  const formatPrice = (price) => {
    return parseFloat(price).toFixed(2);
  };

  // Get full image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://via.placeholder.com/600x600?text=No+Image';
    if (imagePath.startsWith('http')) return imagePath;
    const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
    return `${BACKEND_URLImageKit}/products/${cleanPath}`;
  };

  // Mock additional images (since your backend only has one)
  const getProductImages = () => {
    if (!product) return [];
    return [
      product.image,
      // Add some variations or thumbnails if available
    ].filter(Boolean);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The product you\'re looking for doesn\'t exist.'}</p>
          <button
            onClick={() => navigate('/products')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  const productImages = getProductImages();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex mb-8 text-sm">
          <button 
            onClick={() => navigate('/')}
            className="text-gray-500 hover:text-gray-700"
          >
            Home
          </button>
          <span className="mx-2 text-gray-500">/</span>
          <button 
            onClick={() => navigate('/products')}
            className="text-gray-500 hover:text-gray-700"
          >
            Products
          </button>
          <span className="mx-2 text-gray-500">/</span>
          {product.category && (
            <>
              <button 
                onClick={() => navigate(`/products?category=${product.category.id}`)}
                className="text-gray-500 hover:text-gray-700"
              >
                {product.category.name}
              </button>
              <span className="mx-2 text-gray-500">/</span>
            </>
          )}
          <span className="text-gray-900 font-medium truncate">
            {product.name}
          </span>
        </nav>

        {/* Main Product Section */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
            {/* Image Gallery */}
            <div>
              <div className="mb-4">
                <img
                  src={getImageUrl(product.image)}
                  alt={product.name}
                  className="w-full h-96 object-cover rounded-lg"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/600x600?text=Image+Not+Found';
                  }}
                />
              </div>
              
              {/* Thumbnail Images - if you have multiple images */}
              {productImages.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {productImages.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveImage(index)}
                      className={`border-2 rounded-lg overflow-hidden ${
                        activeImage === index ? 'border-blue-500' : 'border-transparent'
                      }`}
                    >
                      <img
                        src={getImageUrl(img)}
                        alt={`${product.name} - View ${index + 1}`}
                        className="w-full h-20 object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div>
              {/* Category */}
              {product.category && (
                <div className="mb-4">
                  <span className="inline-block bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded">
                    {product.category.name}
                  </span>
                </div>
              )}

              {/* Title */}
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {product.name}
              </h1>

              {/* Price */}
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">
                  ${formatPrice(product.price)}
                </span>
              </div>

              {/* Description */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  Description
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={handleAddToCart}
                  className="py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <span>Add to Cart</span>
                </button>
                </div>
                {/* Home button */}
                <button
                  onClick={() => navigate('/')}
                  className="text-blue-600 hover:underline font-semibold mt-6 cursor-pointer"
                >
                 &larr; Back to Home
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;