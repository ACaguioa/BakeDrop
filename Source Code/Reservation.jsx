// Reservation.jsx
import React from 'react';
import './Reservation.css';
import Navbar from './Navbar';

function Reservation() {
  return (
    <div className="reservation-page">
      
      {/* --- TOP HEADER --- */}
      <header className="top-header">
        <div className="header-left">
          <span className="logo-text">BD | BAKEDROP</span>
        </div>
        <div className="header-right">
            <div className="search-wrapper">
                <span className="material-icons search-icon">search</span>
                <input 
                  type="text" 
                  className="search-input" 
                  placeholder="What are you craving?" 
                />
            </div>
            <button className="hamburger-menu">
              <span className="material-icons">menu</span>
            </button>
        </div>
      </header>

      {/* --- RESERVATION SECTION --- */}
      <section className="reservation-section">
        <h1 className="reservation-title">Reserve Your Order</h1>
        <p className="reservation-subtitle">Pick your favorites and choose a pickup time.</p>

        <div className="reservation-form-container">
          <form className="reservation-form">
            
            <div className="form-group">
              <label>Your Name</label>
              <input type="text" placeholder="Enter your full name" className="form-input" />
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input type="email" placeholder="Enter your email" className="form-input" />
            </div>

            <div className="form-group">
              <label>Pickup Date</label>
              <input type="date" className="form-input" />
            </div>

            <div className="form-group">
              <label>Pickup Time</label>
              <input type="time" className="form-input" />
            </div>

            <div className="form-group">
              <label>Special Requests</label>
              <textarea 
                placeholder="Any custom cake designs, messages, or notes?" 
                className="form-textarea"
                rows="4"
              ></textarea>
            </div>

            <button type="submit" className="reserve-submit-btn">Reserve Now</button>
          </form>
        </div>
      </section>

      {/* --- BOTTOM NAVBAR --- */}
      <Navbar />
    </div>
  );
}

export default Reservation;