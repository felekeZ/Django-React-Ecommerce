// pages/ProductDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import ProductCard from '../components/ProductCard';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  const BACKEND_URL = import.meta.env.VITE_DJANGO_BASE_URL;

  const handleAddToCart = () => {
    if(!localStorage.getItem("access_token")) {
      toast.error("Please log in to add items to your cart.");
      return;
    }
    addToCart(product.id);
    toast.success(`${product.name} added to cart!`);
  }

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`${BACKEND_URL}/api/products/${id}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch product: ${response.status}`);
      }

      const data = await response.json();
      setProduct(data);

      // Fetch related products from same category only
      if (data.category) {
        const relatedResponse = await fetch(
          `${BACKEND_URL}/api/products/?category=${data.category.id}`
        );
        if (relatedResponse.ok) {
          const relatedData = await relatedResponse.json();
          // Filter out current product and limit to 4
          const filtered = (relatedData.results || relatedData)
            .filter(p => p.category?.id === data.category.id && p.id !== data.id)
            .slice(0, 4);
          setRelatedProducts(filtered);
        }
      }

      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching product:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 bg-indigo-600 rounded-full animate-pulse"></div>
            </div>
          </div>
          <p className="text-gray-600 font-medium mt-4">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-12 max-w-md text-center">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-6">{error || "The product you're looking for doesn't exist."}</p>
          <button
            onClick={() => navigate('/products')}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 px-8 rounded-xl transition-all transform hover:scale-105 shadow-lg"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Hero Section with Gradient */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Product Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-16 transform hover:shadow-3xl transition-shadow duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 mt-15">
            {/* Image Section */}
            <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 p-8 flex items-center justify-center">
              <div className="relative group">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full max-w-lg h-auto object-contain rounded-2xl transform group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/600x600?text=Product+Image';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600/10 to-purple-600/10 rounded-2xl pointer-events-none"></div>
              </div>
              
              {/* Floating Badge */}
              <div className="absolute top-4 right-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                 {product.category?.name}
              </div>
            </div>

            {/* Details Section */}
            <div className="p-8 lg:p-12">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">{product.name}</h2>
                <div className="flex items-center space-x-4 mb-6">
                  <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    {formatPrice(product.price)}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Description
                </h3>
                <p className="text-gray-600 leading-relaxed">{product.description}</p>
              </div>
              {/* Action Buttons */}
              <div className="space-y-4">
                <button
                  onClick={handleAddToCart}
                  className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white font-semibold py-4 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg flex items-center justify-center space-x-3 group"
                >
                  <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <span>Add to Cart</span>
                </button>
                
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

        {/* Related Products Section - Only from same category */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">More in {product.category?.name}</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-indigo-600 to-purple-600 mx-auto rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;