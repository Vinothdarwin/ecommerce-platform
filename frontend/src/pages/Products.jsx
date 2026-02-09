import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productAPI } from '../services/api';
import './Products.css';

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    inStock: false,
  });
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [filters]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.category) params.category = filters.category;
      if (filters.inStock) params.inStock = true;

      const response = await productAPI.getAll(params);
      setProducts(response.data.products);
      setError('');
    } catch (err) {
      setError('Failed to fetch products');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await productAPI.getCategories();
      setCategories(response.data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters({
      ...filters,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  if (loading && products.length === 0) {
    return <div className="loading">Loading products...</div>;
  }

  return (
    <div className="products-page container">
      <h1>Products</h1>
      
      <div className="filters">
        <input
          type="text"
          name="search"
          placeholder="Search products..."
          value={filters.search}
          onChange={handleFilterChange}
          className="search-input"
        />
        
        <select
          name="category"
          value={filters.category}
          onChange={handleFilterChange}
          className="category-select"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        
        <label className="checkbox-label">
          <input
            type="checkbox"
            name="inStock"
            checked={filters.inStock}
            onChange={handleFilterChange}
          />
          In Stock Only
        </label>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="products-grid">
        {products.map((product) => (
          <Link key={product._id} to={`/products/${product._id}`} className="product-card card">
            <img src={product.thumbnail} alt={product.name} />
            <div className="product-info">
              <h3>{product.name}</h3>
              <p className="product-category">{product.category}</p>
              <p className="product-price">${product.price.toFixed(2)}</p>
              <p className="product-stock">
                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {products.length === 0 && !loading && (
        <p className="no-products">No products found</p>
      )}
    </div>
  );
}

export default Products;
