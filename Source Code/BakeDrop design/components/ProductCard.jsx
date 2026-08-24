import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

function ProductCard({ product }) {
  const { addToCart } = useCart();

  // Check if this product requires customization
  const isCustomizable = product.customizable === true;

  function handleAddToCart() {
    // Customizable products cannot be added directly
    if (isCustomizable) {
      return;
    }

    // Normal products go directly to the cart
    addToCart(product);
  }

  return (
    <article className="product-card">

      {/* =========================
          PRODUCT IMAGE
      ========================= */}

      <div className="product-image">

        <img
          src={product.image}
          alt={product.name}
        />

        {isCustomizable ? (
          <Link
            to="/custom-cake"
            className="product-add"
            aria-label={`Customize ${product.name}`}
          >
            +
          </Link>
        ) : (
          <button
            className="product-add"
            onClick={handleAddToCart}
            aria-label={`Add ${product.name} to cart`}
          >
            +
          </button>
        )}

      </div>


      {/* =========================
          PRODUCT INFORMATION
      ========================= */}

      <div className="product-info">

        <span className="product-category">
          {product.category}
        </span>

        <h3>
          {product.name}
        </h3>

        <p>
          {product.description}
        </p>


        {/* =========================
            PRICE + ACTION
        ========================= */}

        <div className="product-bottom">

          <span className="product-price">
            ₱{product.price.toLocaleString()}
          </span>


          {isCustomizable ? (
            <Link
              to="/custom-cake"
              className="add-text"
            >
              Customize
            </Link>
          ) : (
            <button
              className="add-text"
              onClick={handleAddToCart}
            >
              Add to bag
            </button>
          )}

        </div>

      </div>

    </article>
  );
}

export default ProductCard;