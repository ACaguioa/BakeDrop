// AboutUs.jsx
import facebookIcon from './assets/facebook.svg';
import instagramIcon from './assets/instagram.svg';
import gmailIcon from './assets/google-gmail.svg';
import React from 'react';
import './AboutUs.css'; // You will add this CSS file later (or I will help you integrate it)
import Navbar from './Navbar';

// Import the dough/flour image (you'll add this image to your assets folder)
import heroBreadImage from './assets/hero-bread.jpg'; 

function AboutUs() {
  return (
    <div className="about-page">
      
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

      {/* --- ABOUT US SECTION --- */}
      <section className="about-section">
        
        {/* Title */}
        <h1 className="about-title">ABOUT US</h1>

        <div className="about-container">
          
          {/* LEFT: Image */}
          <div className="about-image-wrapper">
            <img 
              src={heroBreadImage} 
              alt="Baker working with dough" 
              className="about-image" 
            />
          </div>

          {/* RIGHT: Text Box */}
          <div className="about-text-wrapper">
            
            <div className="about-text-box">
              <h3 className="about-heading">Our Craft</h3>
              
              {/* Wheat/Leaf Icon Placeholder */}
              <div className="about-icon">🌾</div>

              <p className="about-paragraph">
                "At Bakedrop, we believe that great bread cannot be rushed. Founded on a deep respect for traditional baking, every loaf we create begins with pure, stone-milled grains, wild fermentation, and a whole lot of patience. From our morning hearth to your table, we are dedicated to bringing the warmth of authentic artisanal craftsmanship into everyday life."
              </p>
            </div>

            {/* Socials Section (Under the text box) */}
            <div className="about-socials">
              <span className="social-label">Socials:</span>
              <div className="social-icons">
                <div className="social-icons">
  {/* Facebook Link */}
  <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-link">
    <img src={facebookIcon} alt="Facebook" className="social-icon" />
  </a>

  {/* Instagram Link */}
  <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-link">
    <img src={instagramIcon} alt="Instagram" className="social-icon" />
  </a>

  {/* Gmail Link */}
  <a href="mailto:your.email@example.com" target="_blank" rel="noopener noreferrer" className="social-link">
    <img src={gmailIcon} alt="Gmail" className="social-icon" />
  </a>
</div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* --- BOTTOM NAVBAR --- */}
      <Navbar />

    </div>
  );
}

export default AboutUs;
