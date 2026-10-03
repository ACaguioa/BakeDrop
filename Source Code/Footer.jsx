import { Link } from "react-router-dom";
import logo from "../assets/bdlogo.png";

function Footer() {
  return (
    <footer className="footer">

      <div className="footer-main">

        <div className="footer-brand">

          <img
            src={logo}
            alt="BakeDrop"
          />

          <p>
            Freshly baked.
            <br />
            Thoughtfully made.
          </p>

        </div>

        <div className="footer-column">
          <span>EXPLORE</span>

          <Link to="/">Home</Link>
          <Link to="/menu">Menu</Link>
          <Link to="/about">About Us</Link>
        </div>

        <div className="footer-column">
          <span>ORDER</span>

          <Link to="/reservation">
            Reservation
          </Link>

          <Link to="/cart">
            Your Bag
          </Link>

          <Link to="/signup">
            Sign Up
          </Link>
        </div>

        <div className="footer-column">
          <span>CONTACT</span>

          <p>Dasmariñas, Cavite</p>
          <p>Philippines</p>
          <p>hello@bakedrop.com</p>
        </div>

      </div>

      <div className="footer-bottom">
        <span>
          © 2026 BakeDrop
        </span>

        <span>
          Freshly baked. Carefully crafted.
        </span>
      </div>

    </footer>
  );
}

export default Footer;