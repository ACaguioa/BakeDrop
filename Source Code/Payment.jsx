import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";

function Payment() {
  const navigate = useNavigate();

  const {
    selectedCartItems,
    selectedTotalPrice,
    selectedTotalItems,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
  } = useCart();

  // =====================================================
  // RESERVATION
  // =====================================================

  const [reservation, setReservation] =
    useState(null);

  // =====================================================
  // USER
  // =====================================================

  const [user, setUser] =
    useState(null);

  // =====================================================
  // DELIVERY FEE
  // =====================================================

  const [deliveryDistance, setDeliveryDistance] =
    useState(0);

  const [deliveryFee, setDeliveryFee] =
    useState(0);

  // =====================================================
  // ORDER PLACING
  // =====================================================

  const [placingOrder, setPlacingOrder] =
    useState(false);

  // =====================================================
  // PAYMENT METHOD
  // =====================================================

  const [paymentMethod, setPaymentMethod] =
    useState("online");

  // =====================================================
  // SCHEDULE PRODUCT CAPACITY
  // =====================================================

  const [scheduleProducts, setScheduleProducts] =
    useState([]);

  const [scheduleLoading, setScheduleLoading] =
    useState(false);

  // =====================================================
  // CUSTOM CAKE DETECTION
  // =====================================================

  const hasCustomCake =
    selectedCartItems.some(
      (item) => {

        const productId =
          item.product_id !== undefined &&
          item.product_id !== null
            ? Number(item.product_id)
            : Number(item.id);

        return productId === 5;

      }
    );

  // =====================================================
  // BAKEDROP LOCATION
  // Villa Luisa, San Agustin 2
  // Dasmariñas, Cavite
  // =====================================================

  const BAKE_DROP_LAT =
    14.3294;

  const BAKE_DROP_LNG =
    120.9367;

  // =====================================================
  // DELIVERY PRICING
  // =====================================================

  const BASE_FEE =
    50;

  const INCLUDED_KM =
    5;

  const ADDITIONAL_FEE_PER_KM =
    10;

  // =====================================================
  // HAVERSINE DISTANCE
  // =====================================================

  function calculateDistanceKm(
    lat1,
    lon1,
    lat2,
    lon2
  ) {

    const earthRadiusKm =
      6371;

    const toRadians =
      (degrees) =>
        (degrees * Math.PI) / 180;

    const dLat =
      toRadians(
        lat2 - lat1
      );

    const dLon =
      toRadians(
        lon2 - lon1
      );

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(
        toRadians(lat1)
      ) *
        Math.cos(
          toRadians(lat2)
        ) *
        Math.sin(dLon / 2) ** 2;

    const c =
      2 *
      Math.atan2(
        Math.sqrt(a),
        Math.sqrt(1 - a)
      );

    return (
      earthRadiusKm * c
    );

  }

  // =====================================================
  // CALCULATE DELIVERY FEE
  // =====================================================

  function calculateDeliveryFee(
    distanceKm
  ) {

    if (
      !Number.isFinite(
        distanceKm
      )
    ) {
      return 0;
    }

    if (
      distanceKm <=
      INCLUDED_KM
    ) {
      return BASE_FEE;
    }

    const extraKm =
      distanceKm -
      INCLUDED_KM;

    return (
      BASE_FEE +
      extraKm *
        ADDITIONAL_FEE_PER_KM
    );

  }

  // =====================================================
  // LOAD CHECKOUT DATA
  // =====================================================

  useEffect(() => {

    const savedReservation =
      sessionStorage.getItem(
        "bakedropReservation"
      );

    if (savedReservation) {

      try {

        setReservation(
          JSON.parse(
            savedReservation
          )
        );

      } catch (error) {

        console.error(
          "Invalid reservation data:",
          error
        );

        sessionStorage.removeItem(
          "bakedropReservation"
        );

      }

    }

    const savedUser =
      localStorage.getItem(
        "bakedrop-user"
      );

    if (savedUser) {

      try {

        setUser(
          JSON.parse(
            savedUser
          )
        );

      } catch (error) {

        console.error(
          "Invalid user data:",
          error
        );

      }

    }

  }, []);

  // =====================================================
  // FORCE ONLINE FOR CUSTOM CAKE
  // =====================================================

  useEffect(() => {

    if (
      hasCustomCake
    ) {

      setPaymentMethod(
        "online"
      );

    }

  }, [hasCustomCake]);

  // =====================================================
  // CALCULATE DELIVERY WHEN RESERVATION LOADS
  // =====================================================

  useEffect(() => {

    if (!reservation) {
      return;
    }

    // Pickup = no delivery fee
    if (
      reservation.orderType !==
      "delivery"
    ) {

      setDeliveryDistance(0);
      setDeliveryFee(0);

      return;
    }

    const address =
      reservation.deliveryAddress;

    if (!address) {

      setDeliveryDistance(0);
      setDeliveryFee(0);

      return;
    }

    const latitude =
      Number(
        address.latitude
      );

    const longitude =
      Number(
        address.longitude
      );

    if (
      !Number.isFinite(
        latitude
      ) ||
      !Number.isFinite(
        longitude
      )
    ) {

      setDeliveryDistance(0);
      setDeliveryFee(0);

      return;
    }

    const distance =
      calculateDistanceKm(
        BAKE_DROP_LAT,
        BAKE_DROP_LNG,
        latitude,
        longitude
      );

    const roundedDistance =
      Number(
        distance.toFixed(2)
      );

    const calculatedFee =
      calculateDeliveryFee(
        roundedDistance
      );

    setDeliveryDistance(
      roundedDistance
    );

    setDeliveryFee(
      Number(
        calculatedFee.toFixed(2)
      )
    );

  }, [reservation]);

  // =====================================================
  // LOAD PRODUCT CAPACITY FOR SELECTED SCHEDULE DATE
  // =====================================================

  useEffect(() => {

    if (
      !reservation?.date
    ) {
      return;
    }

    const fetchScheduleProducts =
      async () => {

        try {

          setScheduleLoading(
            true
          );

          const response =
            await fetch(
              `http://localhost:5000/api/products?date=${encodeURIComponent(
                reservation.date
              )}`
            );

          const data =
            await response.json();

          if (!response.ok) {

            throw new Error(
              data.message ||
                "Failed to check product availability."
            );

          }

          setScheduleProducts(
            Array.isArray(
              data.products
            )
              ? data.products
              : []
          );

        } catch (error) {

          console.error(
            "Schedule product availability error:",
            error
          );

          setScheduleProducts(
            []
          );

        } finally {

          setScheduleLoading(
            false
          );

        }

      };

    fetchScheduleProducts();

  }, [reservation]);

  // =====================================================
  // EMPTY CART
  // =====================================================

  if (
    selectedCartItems.length ===
    0
  ) {

    return (
      <section className="empty-page">

        <span className="eyebrow">
          CHECKOUT
        </span>

        <h1>
          Your bag is empty.
        </h1>

        <p>
          Add something freshly baked
          before continuing.
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

  // =====================================================
  // NO RESERVATION
  // =====================================================

  if (!reservation) {

    return (
      <section className="empty-page">

        <span className="eyebrow">
          CHECKOUT
        </span>

        <h1>
          Order details missing.
        </h1>

        <p>
          Please complete your pickup or
          delivery information first.
        </p>

        <Link
          to="/reservation"
          className="btn btn-gold"
        >
          Back to Reservation
        </Link>

      </section>
    );

  }

  // =====================================================
  // DELIVERY ADDRESS
  // =====================================================

  const deliveryAddress =
    reservation.deliveryAddress;

  // =====================================================
  // CUSTOMER NAME
  // =====================================================

  const customerName =
    user
      ? `${user.first_name || ""} ${
          user.last_name || ""
        }`.trim()
      : "BakeDrop Customer";

  // =====================================================
  // FINAL TOTAL
  // =====================================================

  const orderTotal =
    Number(
      selectedTotalPrice
    ) +
    Number(
      deliveryFee
    );

  // =====================================================
  // HANDLE ORDER
  // =====================================================

  async function handlePayment() {

    try {

      setPlacingOrder(
        true
      );

      // -------------------------------------------------
      // AUTHENTICATION TOKEN
      // -------------------------------------------------

      const token =
        localStorage.getItem(
          "bakedrop-token"
        );

      if (!token) {

        navigate(
          "/login"
        );

        return;
      }

      // -------------------------------------------------
      // USER CHECK
      // -------------------------------------------------

      if (!user) {

        alert(
          "Please log in before placing your order."
        );

        navigate(
          "/login"
        );

        return;
      }

      // -------------------------------------------------
      // RESERVATION CHECK
      // -------------------------------------------------

      if (!reservation) {

        alert(
          "Order information is missing."
        );

        return;
      }

      // -------------------------------------------------
      // CUSTOM CAKE PAYMENT RULE
      // -------------------------------------------------

      if (
        hasCustomCake &&
        paymentMethod !== "online"
      ) {

        alert(
          "Customized cakes require online payment through PayMongo."
        );

        setPaymentMethod(
          "online"
        );

        return;
      }

      // -------------------------------------------------
      // CHECK SCHEDULED-DATE PRODUCT CAPACITY
      // -------------------------------------------------

      if (scheduleLoading) {

        alert(
          "Please wait while we check product availability."
        );

        return;
      }

      if (
        !Array.isArray(
          scheduleProducts
        ) ||
        scheduleProducts.length ===
          0
      ) {

        alert(
          "Unable to check product availability for your selected date. Please try again."
        );

        return;
      }

      for (
        const cartItem of
        selectedCartItems
      ) {

        // =================================================
        // FLASH DEALS
        // =================================================
        // Flash Deals have their own inventory and should
        // not be blocked by the regular scheduled-product
        // capacity.
        // =================================================

        if (
          cartItem.flash_deal_id
        ) {

          continue;

        }

        const productId =
          cartItem.product_id !==
            undefined &&
          cartItem.product_id !==
            null
            ? Number(
                cartItem.product_id
              )
            : Number(
                cartItem.id
              );

        const product =
          scheduleProducts.find(
            (item) =>
              Number(
                item.id
              ) ===
              productId
          );

        if (!product) {

          alert(
            `${cartItem.name} is not available for ${reservation.date}.`
          );

          return;
        }

        if (
          product.can_order ===
          false
        ) {

          if (
            product.schedule_disabled
          ) {

            alert(
              `Ordering for ${reservation.date} is currently unavailable.`
            );

            return;
          }

          if (
            product.product_date_disabled
          ) {

            alert(
              `${product.name} is unavailable for ${reservation.date}.`
            );

            return;
          }

          if (
            product.product_limit_reached
          ) {

            alert(
              `${product.name} is fully booked for ${reservation.date}.`
            );

            return;
          }

          if (
            product.overall_capacity_reached
          ) {

            alert(
              `All order slots for ${reservation.date} are already reserved.`
            );

            return;
          }

          alert(
            `${product.name} cannot be ordered for ${reservation.date}.`
          );

          return;
        }

        const remaining =
          product.remaining_quantity;

        if (
          remaining !== null &&
          Number(
            cartItem.quantity
          ) >
            Number(
              remaining
            )
        ) {

          alert(
            `${product.name} only has ${remaining} remaining for ${reservation.date}.`
          );

          return;
        }

      }

      // -------------------------------------------------
      // ORDER TYPE
      // -------------------------------------------------

      const orderType =
        reservation.orderType ===
        "delivery"
          ? "delivery"
          : "pickup";

      // -------------------------------------------------
      // VERIFY PAYMENT METHOD
      // -------------------------------------------------

      let finalPaymentMethod =
        paymentMethod;

      if (
        orderType ===
        "pickup"
      ) {

        if (
          paymentMethod !==
            "online" &&
          paymentMethod !==
            "cash_on_pickup"
        ) {

          finalPaymentMethod =
            "online";

        }

      }

      if (
        orderType ===
        "delivery"
      ) {

        if (
          paymentMethod !==
            "online" &&
          paymentMethod !==
            "cash_on_delivery"
        ) {

          finalPaymentMethod =
            "online";

        }

      }

      // -------------------------------------------------
      // DELIVERY ADDRESS
      // -------------------------------------------------

      let formattedDeliveryAddress =
        null;

      if (
        orderType ===
          "delivery" &&
        deliveryAddress
      ) {

        formattedDeliveryAddress =
          [
            deliveryAddress.recipient_name,
            deliveryAddress.phone,
            deliveryAddress.address_line,
            [
              deliveryAddress.city,
              deliveryAddress.province,
            ]
              .filter(
                Boolean
              )
              .join(", "),
          ]
            .filter(
              Boolean
            )
            .join(" | ");

      }

      // -------------------------------------------------
      // COORDINATES
      // -------------------------------------------------

      const latitude =
        orderType ===
        "delivery"
          ? Number(
              deliveryAddress?.latitude
            )
          : null;

      const longitude =
        orderType ===
        "delivery"
          ? Number(
              deliveryAddress?.longitude
            )
          : null;

      // -------------------------------------------------
      // CART ITEMS
      // -------------------------------------------------

      const items =
        selectedCartItems.map(
          (item) => {

            const productId =
              item.product_id !==
                undefined &&
              item.product_id !==
                null
                ? Number(
                    item.product_id
                  )
                : Number(
                    item.id
                  );

            if (
              !Number.isInteger(
                productId
              ) ||
              productId <= 0
            ) {

              console.error(
                "INVALID CART ITEM:",
                item
              );

              throw new Error(
                `Invalid product ID for ${item.name}.`
              );

            }

            const quantity =
              Number(
                item.quantity
              );

            const price =
              Number(
                item.price
              );

            if (
              !Number.isInteger(
                quantity
              ) ||
              quantity <= 0
            ) {

              throw new Error(
                `Invalid quantity for ${item.name}.`
              );

            }

            if (
              !Number.isFinite(
                price
              ) ||
              price < 0
            ) {

              throw new Error(
                `Invalid price for ${item.name}.`
              );

            }

            return {

              product_id:
                productId,

              name:
                item.name,

              quantity:
                quantity,

              price:
                price,

              // =================================================
              // FLASH DEAL ID
              // =================================================

              flash_deal_id:
                item.flash_deal_id
                  ? Number(
                      item.flash_deal_id
                    )
                  : null,

              customization:
                item.customization ||
                null,

            };

          }
        );

      console.log(
        "CHECKOUT ITEMS:",
        items
      );

      // =================================================
      // CASH ORDER
      // =================================================

      if (
        finalPaymentMethod ===
          "cash_on_pickup" ||
        finalPaymentMethod ===
          "cash_on_delivery"
      ) {

        const cashResponse =
          await fetch(
            "http://localhost:5000/api/orders/create-cash",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body:
                JSON.stringify({

                  paymentMethod:
                    finalPaymentMethod,

                  orderType,

                  orderDate:
                    reservation.date,

                  orderTime:
                    reservation.time,

                  deliveryAddress:
                    orderType ===
                    "delivery"
                      ? formattedDeliveryAddress
                      : null,

                  deliveryLatitude:
                    orderType ===
                    "delivery"
                      ? latitude
                      : null,

                  deliveryLongitude:
                    orderType ===
                    "delivery"
                      ? longitude
                      : null,

                  deliveryDistanceKm:
                    orderType ===
                    "delivery"
                      ? deliveryDistance
                      : null,

                  deliveryFee:
                    orderType ===
                    "delivery"
                      ? deliveryFee
                      : 0,

                  notes:
                    reservation.notes ||
                    null,

                  items,

                }),
            }
          );

        const cashData =
          await cashResponse.json();

        console.log(
          "CASH ORDER RESPONSE:",
          cashData
        );

        if (
          !cashResponse.ok
        ) {

          throw new Error(
            cashData.message ||
              "Failed to create cash order."
          );

        }

        sessionStorage.removeItem(
          "bakedropReservation"
        );

        alert(
          `Order ${
            cashData.order
              ?.order_number ||
            ""
          } has been placed successfully. Please prepare ${
            finalPaymentMethod ===
            "cash_on_pickup"
              ? "cash when you pick up your order."
              : "cash when your order is delivered."
          }`
        );

        navigate(
          "/my-orders"
        );

        return;
      }

      // =================================================
      // PAYMONGO ONLINE PAYMENT
      // =================================================

      const response =
        await fetch(
          "http://127.0.0.1:5000/api/paymongo/create-checkout",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body:
              JSON.stringify({

                orderType,

                orderDate:
                  reservation.date,

                orderTime:
                  reservation.time,

                deliveryAddress:
                  orderType ===
                  "delivery"
                    ? formattedDeliveryAddress
                    : null,

                deliveryLatitude:
                  orderType ===
                  "delivery"
                    ? latitude
                    : null,

                deliveryLongitude:
                  orderType ===
                  "delivery"
                    ? longitude
                    : null,

                deliveryDistanceKm:
                  orderType ===
                  "delivery"
                    ? deliveryDistance
                    : null,

                deliveryFee:
                  orderType ===
                  "delivery"
                    ? deliveryFee
                    : 0,

                items,

              }),
          }
        );

      // -------------------------------------------------
      // READ SERVER RESPONSE
      // -------------------------------------------------

      const data =
        await response.json();

      console.log(
        "PAYMONGO RESPONSE:",
        data
      );

      if (!response.ok) {

        throw new Error(
          data.message ||
            "Failed to create PayMongo checkout."
        );

      }

      // -------------------------------------------------
      // CHECK CHECKOUT URL
      // -------------------------------------------------

      if (
        !data.checkout_url
      ) {

        throw new Error(
          "PayMongo checkout URL was not returned."
        );

      }

      // -------------------------------------------------
      // SAVE PENDING ORDER
      // -------------------------------------------------

      sessionStorage.setItem(
        "bakedropPendingOrder",
        JSON.stringify({

          orderId:
            data.order?.id,

          orderNumber:
            data.order
              ?.order_number,

          checkoutSessionId:
            data.checkout_session_id,

        })
      );

      // -------------------------------------------------
      // REDIRECT TO PAYMONGO
      // -------------------------------------------------

      window.location.href =
        data.checkout_url;

    } catch (error) {

      console.error(
        "CHECKOUT ERROR:",
        error
      );

      alert(
        error.message ||
          "Something went wrong while processing your order."
      );

      setPlacingOrder(
        false
      );

    }

  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <section className="cart-page section">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="page-header-small">

        <span className="eyebrow">
          BAKEDROP CHECKOUT
        </span>

        <h1>
          Review your <em>order.</em>
        </h1>

        <p>
          Check your order and delivery
          information before placing your order.
        </p>

      </div>


      {/* =================================================
          ORDER INFORMATION
      ================================================= */}

      <div className="checkout-information">

        <div className="checkout-section-title">

          <span>
            ORDER INFORMATION
          </span>

        </div>

        <div className="checkout-order-info">

          <div>

            <span>
              ORDER TYPE
            </span>

            <strong>
              {reservation.orderType ===
              "delivery"
                ? "Delivery"
                : "Pickup"}
            </strong>

          </div>

          <div>

            <span>
              CUSTOMER
            </span>

            <strong>
              {customerName}
            </strong>

          </div>

          <div>

            <span>
              SCHEDULE
            </span>

            <strong>
              {reservation.date}
              {" • "}
              {reservation.time}
            </strong>

          </div>

          <div>

            <span>
              ITEMS
            </span>

            <strong>
              {selectedTotalItems}
            </strong>

          </div>

        </div>

      </div>


      {/* =================================================
          DELIVERY / PICKUP INFORMATION
      ================================================= */}

      <div className="checkout-information">

        <div className="checkout-section-title">

          <span>
            {reservation.orderType ===
            "delivery"
              ? "DELIVERY INFORMATION"
              : "PICKUP INFORMATION"}
          </span>

        </div>


        {reservation.orderType ===
        "delivery" ? (

          deliveryAddress ? (

            <div className="saved-address-card selected">

              <div className="saved-address-top">

                <strong>
                  {deliveryAddress.label ||
                    "Delivery Address"}
                </strong>

                <span>
                  Selected
                </span>

              </div>

              <p>
                {deliveryAddress.recipient_name}
              </p>

              <p>
                {deliveryAddress.phone}
              </p>

              <p>
                {deliveryAddress.address_line}
              </p>

              <p>
                {deliveryAddress.city},{" "}
                {deliveryAddress.province}
              </p>


              {deliveryAddress.latitude !==
                null &&
                deliveryAddress.longitude !==
                  null && (

                  <div className="location-selected">

                    <span>
                      PINNED LOCATION
                    </span>

                    <p>
                      Latitude:{" "}
                      {Number(
                        deliveryAddress.latitude
                      ).toFixed(6)}
                    </p>

                    <p>
                      Longitude:{" "}
                      {Number(
                        deliveryAddress.longitude
                      ).toFixed(6)}
                    </p>

                  </div>

                )}

            </div>

          ) : (

            <div className="checkout-empty-address">

              <p>
                No delivery address selected.
              </p>

              <Link to="/reservation">
                Return to reservation
              </Link>

            </div>

          )

        ) : (

          <div className="pickup-location">

            <span>
              BAKE DROP PICKUP LOCATION
            </span>

            <strong>
              BakeDrop Bakery
            </strong>

            <p>
              Villa Luisa, San Agustin 2
              <br />
              Dasmariñas, Cavite
            </p>

          </div>

        )}

      </div>


      {/* =================================================
          ORDER NOTES
      ================================================= */}

      {reservation.notes && (

        <div className="checkout-information">

          <div className="checkout-section-title">

            <span>
              ORDER NOTES
            </span>

          </div>

          <p>
            {reservation.notes}
          </p>

        </div>

      )}


      {/* =================================================
          CART + SUMMARY
      ================================================= */}

      <div className="cart-layout">

        {/* =================================================
            ORDER ITEMS
        ================================================= */}

        <div className="cart-items">

          <div className="checkout-section-title">

            <span>
              YOUR ORDER
            </span>

            <p>
              {selectedCartItems.length}{" "}
              {selectedCartItems.length === 1
                ? "item"
                : "items"}
            </p>

          </div>


          {selectedCartItems.map(
            (item) => (

              <div
                className="cart-item checkout-cart-item"
                key={item.id}
              >

                <img
                  src={item.image}
                  alt={item.name}
                />

                <div className="cart-item-info">

                  <span>
                    {item.flash_deal_id
                      ? "FLASH DEAL"
                      : item.category}
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
                        minimumFractionDigits:
                          2,
                      }
                    )}
                  </strong>

                  {item.flash_deal_id &&
                    item.original_price !=
                      null && (

                      <small
                        style={{
                          textDecoration:
                            "line-through",
                          opacity: 0.5,
                          display:
                            "block",
                        }}
                      >
                        ₱
                        {Number(
                          item.original_price
                        ).toLocaleString(
                          "en-PH",
                          {
                            minimumFractionDigits:
                              2,
                          }
                        )}
                      </small>

                    )}

                </div>


                <div className="quantity">

                  <button
                    type="button"
                    onClick={() =>
                      decreaseQuantity(
                        item.id
                      )
                    }
                    disabled={placingOrder}
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
                    disabled={placingOrder}
                  >
                    +
                  </button>

                </div>


                <button
                  type="button"
                  className="remove-item"
                  onClick={() =>
                    removeFromCart(
                      item.id
                    )
                  }
                  disabled={placingOrder}
                >
                  Remove
                </button>

              </div>

            )
          )}

        </div>


        {/* =================================================
            PAYMENT SUMMARY
        ================================================= */}

        <aside className="cart-summary">

          <span>
            PAYMENT SUMMARY
          </span>


          {/* SUBTOTAL */}

          <div>

            <p>
              Subtotal
            </p>

            <strong>
              ₱
              {Number(
                selectedTotalPrice
              ).toLocaleString(
                "en-PH",
                {
                  minimumFractionDigits:
                    2,
                }
              )}
            </strong>

          </div>


          {/* DELIVERY */}

          <div>

            <p>
              Delivery
            </p>

            {reservation.orderType ===
            "delivery" ? (

              <strong>
                ₱
                {Number(
                  deliveryFee
                ).toLocaleString(
                  "en-PH",
                  {
                    minimumFractionDigits:
                      2,
                  }
                )}
              </strong>

            ) : (

              <span>
                Free
              </span>

            )}

          </div>


          {/* DELIVERY DISTANCE */}

          {reservation.orderType ===
            "delivery" && (

            <div>

              <p>
                Distance
              </p>

              <span>
                {deliveryDistance.toFixed(
                  2
                )} km
              </span>

            </div>

          )}


          {/* PRICING INFO */}

          {reservation.orderType ===
            "delivery" && (

            <div>

              <p>
                Rate
              </p>

              <span>
                ₱50 base / first 5 km
                <br />
                + ₱10 per additional km
              </span>

            </div>

          )}


          {/* TOTAL */}

          <div className="checkout-total">

            <p>
              Order Total
            </p>

            <strong>
              ₱
              {Number(
                orderTotal
              ).toLocaleString(
                "en-PH",
                {
                  minimumFractionDigits:
                    2,
                }
              )}
            </strong>

          </div>


          {/* =================================================
              PAYMENT METHOD
          ================================================= */}

          <div className="checkout-information">

            <div className="checkout-section-title">

              <span>
                PAYMENT METHOD
              </span>

            </div>


            {hasCustomCake ? (

              <div className="payment-method-required">

                <strong>
                  Pay Online
                </strong>

                <p>
                  Customized cakes require
                  online payment through PayMongo.
                </p>

              </div>

            ) : (

              <div className="payment-method-options">

                {/* ONLINE */}

                <button
                  type="button"
                  className={
                    paymentMethod ===
                    "online"
                      ? "payment-method-option selected"
                      : "payment-method-option"
                  }
                  onClick={() =>
                    setPaymentMethod(
                      "online"
                    )
                  }
                  disabled={
                    placingOrder
                  }
                >

                  <strong>
                    Pay Online
                  </strong>

                  <span>
                    Secure payment through PayMongo
                  </span>

                </button>


                {/* CASH ON PICKUP */}

                {reservation.orderType ===
                  "pickup" && (

                  <button
                    type="button"
                    className={
                      paymentMethod ===
                      "cash_on_pickup"
                        ? "payment-method-option selected"
                        : "payment-method-option"
                    }
                    onClick={() =>
                      setPaymentMethod(
                        "cash_on_pickup"
                      )
                    }
                    disabled={
                      placingOrder
                    }
                  >

                    <strong>
                      Cash on Pickup
                    </strong>

                    <span>
                      Pay when you collect your order
                    </span>

                  </button>

                )}


                {/* CASH ON DELIVERY */}

                {reservation.orderType ===
                  "delivery" && (

                  <button
                    type="button"
                    className={
                      paymentMethod ===
                      "cash_on_delivery"
                        ? "payment-method-option selected"
                        : "payment-method-option"
                    }
                    onClick={() =>
                      setPaymentMethod(
                        "cash_on_delivery"
                      )
                    }
                    disabled={
                      placingOrder
                    }
                  >

                    <strong>
                      Cash on Delivery
                    </strong>

                    <span>
                      Pay when your order arrives
                    </span>

                  </button>

                )}

              </div>

            )}

          </div>


          {/* =================================================
              CHECKOUT BUTTON
          ================================================= */}

          <button
            type="button"
            className="btn btn-gold full-width"
            onClick={
              handlePayment
            }
            disabled={
              placingOrder
            }
          >

            {placingOrder
              ? paymentMethod ===
                  "online"
                ? "Opening Payment..."
                : "Placing Order..."
              : paymentMethod ===
                  "online"
                ? "Proceed to Online Payment"
                : "Place Cash Order"}

          </button>


          {/* =================================================
              BACK
          ================================================= */}

          <button
            type="button"
            className="checkout-back"
            onClick={() =>
              navigate(
                "/reservation"
              )
            }
            disabled={
              placingOrder
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