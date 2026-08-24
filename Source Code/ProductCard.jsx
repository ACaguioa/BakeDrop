// ProductCard.jsx
import React from 'react';
import './ProductCard.css';

function ProductCard({ name, price, image, category, addToCart, product }) {
  return (
    <div className="product-card">
      <div className="product-image-wrapper">
        <img src={image} alt={name} className="product-card-img" />
      </div>
      <div className="product-card-info">
        <span className="product-category">{category}</span>
        <h3 className="product-card-name">{name}</h3>
        <p className="product-card-price">{price}</p>
        <button 
          className="add-to-cart-btn"
          onClick={() => addToCart(product)}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}

export default ProductCard;