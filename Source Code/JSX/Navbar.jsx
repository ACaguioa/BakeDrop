// Navbar.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import "./Nav.css";

function Navbar({ setCurrentPage }) {
  const [activeTab, setActiveTab] = useState('Home');

  const handleClick = (page, tabName) => {
    setCurrentPage(page);
    setActiveTab(tabName);
  };

  return (
    <div className="mac-nav-container">
      <nav className="mac-nav">
        <div className="mac-nav-links">
          <button 
            onClick={() => handleClick('menu', 'Home')}
            className={`mac-link ${activeTab === 'Home' ? 'mac-active' : ''}`}
          >
            Home
          </button>
          <button 
            onClick={() => handleClick('menu', 'Menu')}
            className={`mac-link ${activeTab === 'Menu' ? 'mac-active' : ''}`}
          >
            Menu
          </button>
          <button 
            onClick={() => handleClick('about', 'About Us')}
            className={`mac-link ${activeTab === 'About Us' ? 'mac-active' : ''}`}
          >
            About Us
          </button>
        </div>

        <div className="mac-logo">B</div>

        <div className="mac-nav-actions">
          <button 
            onClick={() => handleClick('reservation', 'Reservation')}
            className={`mac-link ${activeTab === 'Reservation' ? 'mac-active' : ''}`}
          >
            Reservation
          </button>

          <button 
            onClick={() => handleClick('signup', 'Sign Up')}
            className="mac-signup-btn" 
            title="Sign Up"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mac-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span className="desktop-text">Sign Up</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

export default Navbar;
