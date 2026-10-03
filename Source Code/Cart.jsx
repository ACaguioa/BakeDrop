import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

function Cart() {
  const {
    cart,

    // Selection
    selectedCartItems,
    selectedTotalPrice,
    selectedTotalItems,
    isAllSelected,
    isItemSelected,
    toggleItemSelection,
    toggleSelectAll,

    // Cart actions
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
  } = useCart();

  // =====================================================
  // EMPTY CART
  // =====================================================

  if (cart.length === 0) {
    return (
      <section className="empty-page">

        <span className="eyebrow">
          YOUR BAG
        </span>

        <h1>
          Your bag is empty.
        </h1>

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

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="page-header-small">

        <span className="eyebrow">
          YOUR BAG
        </span>

        <h1>
          Order Summary
        </h1>

      </div>

      <div className="cart-layout">

        {/* =================================================
            CART ITEMS
        ================================================= */}

        <div className="cart-items">

          {/* =================================================
              SELECT ALL
          ================================================= */}

          <div className="cart-select-all">

            <label>
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={toggleSelectAll}
              />

              <span>
                Select All
              </span>
            </label>

            <span>
              {selectedTotalItems} selected
            </span>

          </div>

          {/* =================================================
              ITEMS
          ================================================= */}

          {cart.map((item) => (

            <div
              className={`cart-item ${
                isItemSelected(item.id)
                  ? "cart-item-selected"
                  : ""
              }`}
              key={item.id}
            >

              {/* =================================================
                  CHECKBOX
              ================================================= */}

              <div className="cart-item-check">

                <input
                  type="checkbox"
                  checked={isItemSelected(
                    item.id
                  )}
                  onChange={() =>
                    toggleItemSelection(
                      item.id
                    )
                  }
                  aria-label={`Select ${item.name} for checkout`}
                />

              </div>

              {/* =================================================
                  PRODUCT IMAGE
              ================================================= */}

              <img
                src={item.image}
                alt={item.name}
              />

              {/* =================================================
                  PRODUCT INFO
              ================================================= */}

              <div className="cart-item-info">

                <span>
                  {item.category}
                </span>

                <h3>
                  {item.name}
                </h3>

                <strong>
                  ₱
                  {Number(
                    item.price
                  ).toLocaleString(
                    "en-PH",
                    {
                      minimumFractionDigits: 2,
                    }
                  )}
                </strong>

                {/* =================================================
                    CUSTOMIZATION
                ================================================= */}

                {item.customizable &&
                  item.customization && (

                    <div className="cart-customization">

                      <span className="cart-customization-label">
                        CUSTOMIZATION
                      </span>

                      <p>
                        <strong>
                          Size:
                        </strong>{" "}
                        {item.customization.size}
                      </p>

                      <p>
                        <strong>
                          Flavor:
                        </strong>{" "}
                        {item.customization.flavor}
                      </p>

                      <p>
                        <strong>
                          Frosting:
                        </strong>{" "}
                        {item.customization.frosting}
                      </p>

                      {item.customization.toppings?.length >
                        0 && (
                        <p>
                          <strong>
                            Toppings:
                          </strong>{" "}
                          {item.customization.toppings.join(
                            ", "
                          )}
                        </p>
                      )}

                      <p>
                        <strong>
                          Decoration:
                        </strong>{" "}
                        {
                          item.customization
                            .decoration
                        }
                      </p>

                      {item.customization.message && (
                        <p>
                          <strong>
                            Message:
                          </strong>{" "}
                          {
                            item.customization
                              .message
                          }
                        </p>
                      )}

                    </div>

                  )}

              </div>

              {/* =================================================
                  QUANTITY
              ================================================= */}

              <div className="quantity">

                <button
                  type="button"
                  onClick={() =>
                    decreaseQuantity(
                      item.id
                    )
                  }
                >
                  −
                </button>

                <span>
                  {item.quantity}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    increaseQuantity(
                      item.id
                    )
                  }
                >
                  +
                </button>

              </div>

              {/* =================================================
                  REMOVE
              ================================================= */}

              <button
                type="button"
                className="remove-item"
                onClick={() =>
                  removeFromCart(
                    item.id
                  )
                }
              >
                Remove
              </button>

            </div>

          ))}

        </div>

        {/* =================================================
            SUMMARY
        ================================================= */}

        <aside className="cart-summary">

          <span>
            SUMMARY
          </span>

          {/* SELECTED ITEMS */}

          <div>
            <p>
              Selected Items
            </p>

            <strong>
              {selectedTotalItems}
            </strong>
          </div>

          {/* SUBTOTAL */}

          <div>
            <p>
              Subtotal
            </p>

            <strong>
              ₱
              {selectedTotalPrice.toLocaleString(
                "en-PH",
                {
                  minimumFractionDigits: 2,
                }
              )}
            </strong>
          </div>

          {/* PICKUP */}

          <div>
            <p>
              Pickup
            </p>

            <span>
              Choose at checkout
            </span>
          </div>

          {/* CHECKOUT */}

          {selectedCartItems.length > 0 ? (
            <Link
              to="/reservation"
              className="btn btn-gold full-width"
            >
              Checkout
            </Link>
          ) : (
            <button
              type="button"
              className="btn btn-gold full-width"
              disabled
            >
              Select an Item
            </button>
          )}

        </aside>

      </div>

    </section>
  );
}

export default Cart;

