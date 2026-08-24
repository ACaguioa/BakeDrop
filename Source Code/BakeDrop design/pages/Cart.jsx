import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

function Cart() {
  const {
    cart,
    totalPrice,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
  } = useCart();

  if (cart.length === 0) {
    return (
      <section className="empty-page">
        <span className="eyebrow">
          YOUR BAG
        </span>

        <h1>Your bag is empty.</h1>

        <p>
          Discover something freshly baked.
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

      <div className="page-header-small">
        <span className="eyebrow">YOUR BAG</span>
        <h1>Order Summary</h1>
      </div>

      <div className="cart-layout">

        <div className="cart-items">

          {cart.map((item) => (
            <div
              className="cart-item"
              key={item.id}
            >

              <img
                src={item.image}
                alt={item.name}
              />

              <div className="cart-item-info">

                <span>
                  {item.category}
                </span>

                <h3>{item.name}</h3>

                <strong>
                  ₱{item.price.toLocaleString()}
                </strong>

              </div>

              <div className="quantity">

                <button
                  onClick={() =>
                    decreaseQuantity(item.id)
                  }
                >
                  −
                </button>

                <span>{item.quantity}</span>

                <button
                  onClick={() =>
                    increaseQuantity(item.id)
                  }
                >
                  +
                </button>

              </div>

              <button
                className="remove-item"
                onClick={() =>
                  removeFromCart(item.id)
                }
              >
                Remove
              </button>

            </div>
          ))}

        </div>

        <aside className="cart-summary">

          <span>SUMMARY</span>

          <div>
            <p>Subtotal</p>
            <strong>
              ₱{totalPrice.toLocaleString()}
            </strong>
          </div>

          <div>
            <p>Pickup</p>
            <span>Choose at checkout</span>
          </div>

          <Link
            to="/reservation"
            className="btn btn-gold full-width"
          >
            Continue
          </Link>

        </aside>

      </div>

    </section>
  );
}

export default Cart;