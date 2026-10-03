import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

function ProductCard({ product }) {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  // MySQL may return true, 1, or "1"
  const isCustomizable =
    product.customizable === true ||
    product.customizable === 1 ||
    product.customizable === "1";

  function handleAction() {
    console.log("PRODUCT CLICKED:", product);
    console.log("CUSTOMIZABLE:", product.customizable);
    console.log("IS CUSTOMIZABLE:", isCustomizable);

    // ============================================
    // CUSTOMIZABLE PRODUCT
    // ============================================
    if (isCustomizable) {
      navigate("/custom-cake", {
        state: {
          product: product,
        },
      });

      return;
    }

    // ============================================
    // NORMAL PRODUCT
    // ============================================
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

        <button
          type="button"
          className="product-add"
          onClick={handleAction}
          aria-label={
            isCustomizable
              ? `Customize ${product.name}`
              : `Add ${product.name} to cart`
          }
        >
          +
        </button>

      </div>

      {/* =========================
          PRODUCT INFORMATION
      ========================= */}
      <div className="product-info">

        <span className="product-category">
          {product.category_name || product.category}
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
            ₱{Number(product.price).toLocaleString()}
          </span>

          <button
            type="button"
            className="add-text"
            onClick={handleAction}
          >
            {isCustomizable ? "Customize" : "Add to bag"}
          </button>

        </div>

      </div>

    </article>
  );
}

export default ProductCard;
