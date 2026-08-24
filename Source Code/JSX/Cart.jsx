// Cart.jsx
import React from 'react';
import './Cart.css';
import Navbar from './Navbar';

function Cart({ cart, removeFromCart, clearCart }) {
  // Calculate total price
  const total = cart.reduce((acc, item) => {
    const priceNum = parseInt(item.price.replace(/[₱,]/g, ''));
    return acc + priceNum * item.quantity;
  }, 0);

  return (
    <div className="cart-page">
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

      <section className="cart-section">
        <h1 className="cart-title">Your Cart</h1>
        
        {cart.length === 0 ? (
          <p className="cart-empty">Your cart is empty. Start adding some treats!</p>
        ) : (
          <div className="cart-items">
            {cart.map((item) => (
              <div key={item.id} className="cart-item">
                <img src={item.image} alt={item.name} className="cart-item-img" />
                <div className="cart-item-info">
                  <h3>{item.name}</h3>
                  <p>{item.price} x {item.quantity}</p>
                </div>
                <button 
                  className="remove-btn"
                  onClick={() => removeFromCart(item.id)}
                >
                  ✕
                </button>
              </div>
            ))}
            
            <div className="cart-total">
              <h3>Total: ₱ {total.toLocaleString()}</h3>
              <button className="checkout-btn">Proceed to Checkout</button>
            </div>
          </div>
        )}
      </section>

      {/* --- BOTTOM NAVBAR ADDED BACK --- */}
      <Navbar />
    </div>
  );
}

export default Cart;
