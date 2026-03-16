import React, { useState, useEffect } from 'react';

const ProductFilter = ({ products, onFilterChange }) => {
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState('default');

  // Extract unique categories from products
  useEffect(() => {
    if (products && products.length > 0) {
      const uniqueCategories = products.reduce((acc, product) => {
        if (!acc.find(cat => cat.id === product.category.id)) {
          acc.push({
            id: product.category.id,
            name: product.category.name,
            slug: product.category.slug
          });
        }
        return acc;
      }, []);
      setCategories(uniqueCategories);
    }
  }, [products]);

  // Handle category selection
  const handleCategoryChange = (categoryId) => {
    setSelectedCategories(prev => {
      const newSelection = prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId];
      
      // Apply filters after state update
      setTimeout(() => applyFilters(newSelection, priceRange, sortBy), 0);
      return newSelection;
    });
  };

  // Handle price range change
  const handlePriceChange = (type, value) => {
    const newPriceRange = {
      ...priceRange,
      [type]: value ? parseFloat(value) : ''
    };
    setPriceRange(newPriceRange);
    applyFilters(selectedCategories, newPriceRange, sortBy);
  };

  // Handle sort change
  const handleSortChange = (e) => {
    const newSort = e.target.value;
    setSortBy(newSort);
    applyFilters(selectedCategories, priceRange, newSort);
  };

  // Apply all filters
  const applyFilters = (categories, price, sort) => {
    let filteredProducts = [...products];

    // Filter by categories
    if (categories.length > 0) {
      filteredProducts = filteredProducts.filter(product => 
        categories.includes(product.category.id)
      );
    }

    // Filter by price range
    if (price.min !== '') {
      filteredProducts = filteredProducts.filter(product => 
        parseFloat(product.price) >= price.min
      );
    }
    if (price.max !== '') {
      filteredProducts = filteredProducts.filter(product => 
        parseFloat(product.price) <= price.max
      );
    }

    // Apply sorting
    switch (sort) {
      case 'newest':
        filteredProducts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case 'price-asc':
        filteredProducts.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        break;
      case 'price-desc':
        filteredProducts.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        break;
      case 'name-asc':
        filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        // Default sorting (by id or keep original order)
        filteredProducts.sort((a, b) => a.id - b.id);
    }

    onFilterChange(filteredProducts);
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedCategories([]);
    setPriceRange({ min: '', max: '' });
    setSortBy('default');
    onFilterChange(products);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Filters</h2>
        <button
          onClick={clearFilters}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          Clear All
        </button>
      </div>

      {/* Categories Filter */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-700 mb-3">Categories</h3>
        <div className="space-y-2">
          {categories.map(category => (
            <label key={category.id} className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedCategories.includes(category.id)}
                onChange={() => handleCategoryChange(category.id)}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <span className="text-gray-700">{category.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-700 mb-3">Price Range</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Min Price</label>
            <input
              type="number"
              value={priceRange.min}
              onChange={(e) => handlePriceChange('min', e.target.value)}
              placeholder="0"
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Max Price</label>
            <input
              type="number"
              value={priceRange.max}
              onChange={(e) => handlePriceChange('max', e.target.value)}
              placeholder="No limit"
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Sort Options */}
      <div>
        <h3 className="text-lg font-medium text-gray-700 mb-3">Sort By</h3>
        <select
          value={sortBy}
          onChange={handleSortChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="default">Default</option>
          <option value="newest">Newest First</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="name-asc">Name: A to Z</option>
          <option value="name-desc">Name: Z to A</option>
        </select>
      </div>

      {/* Active Filters Summary */}
      {(selectedCategories.length > 0 || priceRange.min || priceRange.max || sortBy !== 'default') && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Active Filters:</h4>
          <div className="flex flex-wrap gap-2">
            {selectedCategories.map(catId => {
              const category = categories.find(c => c.id === catId);
              return category ? (
                <span
                  key={catId}
                  className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                >
                  {category.name}
                  <button
                    onClick={() => handleCategoryChange(catId)}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ) : null;
            })}
            {priceRange.min && (
              <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                Min: ${priceRange.min}
                <button
                  onClick={() => handlePriceChange('min', '')}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            )}
            {priceRange.max && (
              <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                Max: ${priceRange.max}
                <button
                  onClick={() => handlePriceChange('max', '')}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            )}
            {sortBy !== 'default' && (
              <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                Sort: {sortBy === 'newest' ? 'Newest' : 
                       sortBy === 'price-asc' ? 'Price: Low to High' :
                       sortBy === 'price-desc' ? 'Price: High to Low' :
                       sortBy === 'name-asc' ? 'Name: A to Z' : 'Name: Z to A'}
                <button
                  onClick={() => {
                    setSortBy('default');
                    applyFilters(selectedCategories, priceRange, 'default');
                  }}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductFilter;