import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

function Payment() {
  const {
    cart,
    totalPrice,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
  } = useCart();

  const navigate = useNavigate();

  // =========================
  // EMPTY CART
  // =========================

  if (cart.length === 0) {
    return (
      <section className="empty-page">

        <span className="eyebrow">
          CHECKOUT
        </span>

        <h1>
          Your bag is empty.
        </h1>

        <p>
          Add something freshly baked before
          continuing to payment.
        </p>

        <Link
          to="/menu"
          className="btn btn-gold"
        >
          Explore Menu
        </Link>

      </section>
    );
  }

  return (
    <section className="cart-page section">

      {/* =========================
          HEADER
      ========================= */}

      <div className="page-header-small">

        <span className="eyebrow">
          BAKEDROP CHECKOUT
        </span>

        <h1>
          Complete your <em>payment.</em>
        </h1>

        <p>
          Review your order before proceeding
          with payment.
        </p>

      </div>


      {/* =========================
          CHECKOUT LAYOUT
      ========================= */}

      <div className="cart-layout">


        {/* =========================
            CART ITEMS
        ========================= */}

        <div className="cart-items">

          <div className="checkout-section-title">

            <span>
              YOUR ORDER
            </span>

            <p>
              {cart.length}{" "}
              {cart.length === 1
                ? "item"
                : "items"}
            </p>

          </div>


          {cart.map((item) => (

            <div
              className="cart-item"
              key={item.id}
            >

              {/* PRODUCT IMAGE */}

              <img
                src={item.image}
                alt={item.name}
              />


              {/* PRODUCT INFORMATION */}

              <div className="cart-item-info">

                <span>
                  {item.category}
                </span>

                <h3>
                  {item.name}
                </h3>

                <strong>
                  ₱{item.price.toLocaleString()}
                </strong>

              </div>


              {/* QUANTITY */}

              <div className="quantity">

                <button
                  type="button"
                  onClick={() =>
                    decreaseQuantity(item.id)
                  }
                  aria-label={`Decrease ${item.name}`}
                >
                  −
                </button>

                <span>
                  {item.quantity}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    increaseQuantity(item.id)
                  }
                  aria-label={`Increase ${item.name}`}
                >
                  +
                </button>

              </div>


              {/* REMOVE */}

              <button
                type="button"
                className="remove-item"
                onClick={() =>
                  removeFromCart(item.id)
                }
              >
                Remove
              </button>

            </div>

          ))}


          {/* ADD MORE PRODUCTS */}

          <Link
            to="/menu"
            className="btn btn-outline checkout-add-more"
          >
            + Add More Products
          </Link>

        </div>


        {/* =========================
            PAYMENT SUMMARY
        ========================= */}

        <aside className="cart-summary">

          <span>
            PAYMENT SUMMARY
          </span>


          <div>
            <p>
              Subtotal
            </p>

            <strong>
              ₱{totalPrice.toLocaleString()}
            </strong>
          </div>


          <div>
            <p>
              Delivery
            </p>

            <span>
              Choose at checkout
            </span>
          </div>


          <div className="checkout-total">

            <p>
              Total
            </p>

            <strong>
              ₱{totalPrice.toLocaleString()}
            </strong>

          </div>


          {/* PAYMENT BUTTON */}

          <button
            type="button"
            className="btn btn-gold full-width"
            onClick={() => {
              // Payment gateway will be connected here
              console.log(
                "Proceeding to payment:",
                cart
              );
            }}
          >
            Pay ₱{totalPrice.toLocaleString()}
          </button>


          {/* BACK */}

          <button
            type="button"
            className="checkout-back"
            onClick={() =>
              navigate("/reservation")
            }
          >
            ← Back to Reservation
          </button>

        </aside>

      </div>

    </section>
  );
}

export default Payment;