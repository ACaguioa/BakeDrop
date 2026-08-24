import { Link } from "react-router-dom";

import hero from "../assets/hero.jpg";
import customize from "../assets/products/customize.jpg";

import SectionTitle from "../components/SectionTitle";
import ProductCard from "../components/ProductCard";

import products from "../data/products";

function Home() {
  const featuredProducts = products.slice(0, 6);

  return (
    <div className="home">

      {/* HERO */}

      <section
        className="hero"
        style={{
          backgroundImage: `url(${hero})`,
        }}
      >
        <div className="hero-overlay"></div>

        <div className="hero-content">
          <span className="eyebrow">
            PALDO BAKERY · EST. 2026
          </span>

          <h1>
            Baked with
            <br />
            <em>intention.</em>
          </h1>

          <p>
            A collection of freshly baked Filipino
            favorites, artisan breads, and handcrafted
            cakes made for life's sweetest moments.
          </p>

          <div className="hero-buttons">
            <Link to="/menu" className="btn btn-gold">
              Explore the Menu
            </Link>

            <Link
              to="/reservation"
              className="btn btn-outline"
            >
              Reserve a Pickup
            </Link>
          </div>
        </div>

        <div className="hero-bottom">
          <span>Freshly baked daily</span>
          <span>•</span>
          <span>Made to order</span>
          <span>•</span>
          <span>Made with love</span>
        </div>
      </section>


      {/* INTRODUCTION */}

      <section className="intro section">
        <SectionTitle
          eyebrow="THE BAKEDROP EXPERIENCE"
          title="Simple ingredients. Exceptional baking."
          description="We believe the finest pastries don't need to be complicated. Every BakeDrop creation is prepared with carefully selected ingredients, traditional techniques, and a little patience."
          center
        />
      </section>


      {/* CATEGORIES */}

      <section className="category-section section">
        <SectionTitle
          eyebrow="EXPLORE"
          title="Something for every craving"
        />

        <div className="category-grid">

          <Link to="/menu?category=Filipino Favorites">
            <span>01</span>
            <h3>Filipino Favorites</h3>
            <p>
              Classics that feel like home.
            </p>
          </Link>

          <Link to="/menu?category=Breads">
            <span>02</span>
            <h3>Artisan Breads</h3>
            <p>
              Soft, fragrant, and freshly baked.
            </p>
          </Link>

          <Link to="/menu?category=Cakes">
            <span>03</span>
            <h3>Celebration Cakes</h3>
            <p>
              Made for moments worth remembering.
            </p>
          </Link>

          <Link to="/menu?category=Pastries">
            <span>04</span>
            <h3>Pastries</h3>
            <p>
              Little indulgences for your day.
            </p>
          </Link>

        </div>
      </section>


      {/* FEATURED */}

      <section className="featured section">

        <div className="featured-heading">
          <SectionTitle
            eyebrow="FROM OUR OVEN"
            title="Our most loved creations"
            description="Discover the pastries our customers keep coming back for."
          />

          <Link
            to="/menu"
            className="view-all"
          >
            View Full Menu →
          </Link>
        </div>

        <div className="product-grid">
          {featuredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>

      </section>


      {/* CUSTOM CAKE */}

      <section className="custom-section">

        <div className="custom-image">
          <img
            src={customize}
            alt="Customizable BakeDrop cake"
          />
        </div>

        <div className="custom-content">

          <span className="eyebrow">
            MADE FOR YOUR MOMENT
          </span>

          <h2>
            Your celebration.
            <br />
            <em>Your cake.</em>
          </h2>

          <p>
            From flavor and design to toppings,
            decorations, and personal messages,
            create a cake that is uniquely yours.
          </p>

        <Link
          to="/custom-cake"
          className="btn btn-gold"
        >
          Create Your Cake
        </Link>

        </div>

      </section>


      {/* QUOTE */}

      <section className="quote-section">

        <span>BAKEDROP</span>

        <blockquote>
          "The best memories are often
          <br />
          shared over something freshly baked."
        </blockquote>

      </section>

    </div>
  );
}

export default Home;