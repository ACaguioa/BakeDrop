// Menu.jsx
import React from 'react';
import './Menu.css'; 
import Navbar from './Navbar';
import ProductCard from './ProductCard';

import sourdoughImg from "../assets/hero-bread.jpg";
import croissantImg from "../assets/hero-bread.jpg";
import cakeImg from "../assets/hero-bread.jpg";
import donutImg from "../assets/hero-bread.jpg"; // <-- CHANGED TO ../

const products = [
  { id: 1, name: "Signature Country Sourdough", price: "₱ 350", category: "Bread", image: sourdoughImg },
  { id: 2, name: "Isigny Butter Almond Croissant", price: "₱ 180", category: "Pastry", image: croissantImg },
  { id: 3, name: "Classic Chocolate Cake", price: "₱ 1,200", category: "Cake", image: cakeImg },
  { id: 4, name: "Cinnamon Donut", price: "₱ 85", category: "Donut", image: donutImg },
];

function Menu({ addToCart }) {
  return (
    <div className="menu-page">
      <header className="top-header">
        <div className="header-left">
          <span className="logo-text">BD | BAKEDROP</span>
        </div>
        <div className="header-right">
            <div className="search-wrapper">
                <span className="material-icons search-icon">search</span>
                <input type="text" className="search-input" placeholder="What are you craving?" />
            </div>
            <button className="hamburger-menu">
              <span className="material-icons">menu</span>
            </button>
        </div>
      </header>

      <section className="featured-section">
        <div className="section-title-wrapper">
          <span className="line"></span>
          <h2 className="section-title">OUR MOST LOVED CREATIONS</h2>
          <span className="line"></span>
        </div>
      </section>

      <div className="product-grid-container">
        {products.map((product) => (
          <ProductCard 
            key={product.id}
            product={product}
            name={product.name}
            price={product.price}
            category={product.category}
            image={product.image}
            addToCart={addToCart}
          />
        ))}
      </div>

      <Navbar />
    </div>
  );
}

export default Menu;
