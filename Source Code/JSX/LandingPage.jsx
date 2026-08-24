// LandingPage.jsx
import React from 'react';
import './LandingPage.css'; 
import heroBreadImage from './assets/hero-bread.jpg'; // Import the image
import Navbar from './Navbar'; // <--- ADDED THIS IMPORT

function LandingPage() {
  return (
    <div className="landing-page">
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


      {/* 2. HERO SECTION */}
      <section className="hero-section">
        <div className="hero-background">
          
          {/* --- NEW WRAPPER ADDED HERE --- */}
          <div className="hero-image-wrapper">
            <img 
              src={heroBreadImage} 
              alt="Fresh baked bread" 
              className="hero-bg-img" 
            />
          </div>
          {/* ----------------------------- */}

          <div className="hero-overlay"></div>
        </div>
        
        <div className="hero-content">
          <p className="hero-tagline">
            Pure ingredients. Expert craftsmanship.<br />
            Premium artisanal breads and pastries<br />
            baked fresh every morning.
          </p>
          <button className="hero-btn">
            Reserve Now!
          </button>
        </div>
      </section>
      
      {/* 3. OUR MOST LOVED CREATIONS (Title only) */}
      <section className="featured-section" style={{ marginTop: '-30px' }}>
        <div className="section-title-wrapper">
          <span className="line"></span>
          <h2 className="section-title">OUR MOST LOVED CREATIONS</h2>
          <span className="line"></span>
        </div>
      </section>

      {/* 4. BOTTOM NAVBAR */}
      <Navbar /> {/* <--- ADDED THIS AT THE BOTTOM */}

    </div>
  );
}

export default LandingPage;
