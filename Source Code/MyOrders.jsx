import { Link } from "react-router-dom";
import { useEffect, useState } from "react";


// =====================================================
// API
// =====================================================

const API_BASE =
  "http://127.0.0.1:5000";


// =====================================================
// MY ORDERS
// =====================================================

function MyOrders() {

  const [orders, setOrders] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  // ===================================================
  // FETCH ORDERS
  // ===================================================

  async function fetchOrders(
    showLoading = false
  ) {

    try {

      if (showLoading) {
        setLoading(true);
      }

      setError("");


      const token =
        localStorage.getItem(
          "bakedrop-token"
        );


      if (!token) {

        setError(
          "Please log in to view your orders."
        );

        setLoading(false);

        return;

      }


      const response =
        await fetch(
          `${API_BASE}/api/orders/my-orders`,
          {
            method: "GET",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data.message ||
            "Failed to load your orders."
        );

      }


      setOrders(
        data.orders || []
      );


    } catch (error) {

      console.error(
        "My orders error:",
        error
      );


      setError(
        error.message ||
          "Unable to load your orders."
      );


    } finally {

      if (showLoading) {
        setLoading(false);
      }

    }

  }


  // ===================================================
  // CANCEL CUSTOMER ORDER
  // ===================================================

  async function handleCancelOrder(order) {

    const confirmed =
      window.confirm(
        `Cancel order ${order.order_number}?`
      );


    if (!confirmed) {
      return;
    }


    try {

      const token =
        localStorage.getItem(
          "bakedrop-token"
        );


      if (!token) {

        alert(
          "Please log in to cancel your order."
        );

        return;

      }


      const response =
        await fetch(
          `${API_BASE}/api/orders/${order.id}/cancel`,
          {
            method: "POST",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        alert(
          data.message ||
            "Unable to cancel this order."
        );

        return;

      }


      alert(
        "Your order has been cancelled successfully."
      );


      await fetchOrders(false);


    } catch (error) {

      console.error(
        "CANCEL ORDER ERROR:",
        error
      );


      alert(
        "Something went wrong while cancelling your order."
      );

    }

  }


  // ===================================================
  // CHECK IF CUSTOMER CAN CANCEL
  //
  // Customer can cancel only when the scheduled date
  // is MORE THAN 1 DAY away.
  //
  // Example:
  // Today       = cannot cancel
  // Tomorrow    = cannot cancel
  // 2+ days     = can cancel
  // ===================================================

  function canCustomerCancelOrder(order) {

    if (
      order.status !== "pending" &&
      order.status !== "confirmed"
    ) {
      return false;
    }


    if (!order.order_date) {
      return false;
    }


    const today =
      new Date();

    today.setHours(
      0,
      0,
      0,
      0
    );


    const scheduledDate =
      new Date(
        `${String(
          order.order_date
        ).slice(0, 10)}T00:00:00`
      );


    if (
      Number.isNaN(
        scheduledDate.getTime()
      )
    ) {
      return false;
    }


    const difference =
      Math.round(
        (
          scheduledDate.getTime() -
          today.getTime()
        ) /
          (
            1000 *
            60 *
            60 *
            24
          )
      );


    return difference > 1;

  }


  // ===================================================
  // VERIFY SUCCESSFUL PAYMONGO PAYMENT
  // ===================================================

  async function verifySuccessfulPayment() {

    try {

      const params =
        new URLSearchParams(
          window.location.search
        );


      const payment =
        params.get("payment");


      const orderNumber =
        params.get("order");


      // -------------------------------------------------
      // Only verify when PayMongo redirected successfully
      // -------------------------------------------------

      if (
        payment !== "success" ||
        !orderNumber
      ) {

        return false;

      }


      const token =
        localStorage.getItem(
          "bakedrop-token"
        );


      if (!token) {

        console.warn(
          "Payment cannot be verified because no login token was found."
        );

        return false;

      }


      console.log(
        "================================="
      );

      console.log(
        "BAKEDROP PAYMENT VERIFICATION"
      );

      console.log(
        "ORDER:",
        orderNumber
      );

      console.log(
        "================================="
      );


      const response =
        await fetch(
          `${API_BASE}/api/paymongo/verify-payment`,
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
                orderNumber,
              }),
          }
        );


      const data =
        await response.json();


      console.log(
        "PAYMONGO VERIFICATION RESPONSE:",
        data
      );


      // -------------------------------------------------
      // Backend returned an error
      // -------------------------------------------------

      if (!response.ok) {

        console.error(
          "PAYMENT VERIFICATION FAILED:",
          data
        );

        return false;

      }


      // -------------------------------------------------
      // PAYMENT SUCCESSFULLY VERIFIED
      // -------------------------------------------------

      if (
        data.success &&
        data.paid
      ) {

        console.log(
          "================================="
        );

        console.log(
          "PAYMENT VERIFIED SUCCESSFULLY"
        );

        console.log(
          "ORDER:",
          orderNumber
        );

        console.log(
          "PAYMENT STATUS:",
          data.payment_status
        );

        console.log(
          "ORDER STATUS:",
          data.status
        );

        console.log(
          "================================="
        );


        // -------------------------------------------------
        // Remove the payment query parameters.
        // -------------------------------------------------

        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );


        return true;

      }


      // -------------------------------------------------
      // PayMongo does not report a paid payment yet
      // -------------------------------------------------

      console.warn(
        "PAYMENT IS NOT YET CONFIRMED BY PAYMONGO:",
        data
      );


      return false;


    } catch (error) {

      console.error(
        "PAYMENT VERIFICATION ERROR:",
        error
      );

      return false;

    }

  }


  // ===================================================
  // INITIAL LOAD
  // PAYMENT VERIFICATION
  // AUTO REFRESH
  // ===================================================

  useEffect(() => {

    let isMounted = true;


    async function initializeOrders() {

      try {

        // ------------------------------------------------
        // Check whether this is a successful PayMongo
        // return.
        // ------------------------------------------------

        const params =
          new URLSearchParams(
            window.location.search
          );


        const payment =
          params.get("payment");


        const orderNumber =
          params.get("order");


        // ------------------------------------------------
        // Verify payment BEFORE fetching orders.
        // ------------------------------------------------

        if (
          payment === "success" &&
          orderNumber
        ) {

          await verifySuccessfulPayment();

        }


        // ------------------------------------------------
        // Fetch fresh orders after verification.
        // ------------------------------------------------

        if (isMounted) {

          await fetchOrders(true);

        }


      } catch (error) {

        console.error(
          "MY ORDERS INITIALIZATION ERROR:",
          error
        );

      }

    }


    initializeOrders();


    // ----------------------------------------------------
    // AUTO REFRESH
    // ----------------------------------------------------

    const refreshInterval =
      setInterval(
        () => {

          if (isMounted) {

            fetchOrders(false);

          }

        },
        5000
      );


    // ----------------------------------------------------
    // CLEANUP
    // ----------------------------------------------------

    return () => {

      isMounted = false;

      clearInterval(
        refreshInterval
      );

    };

  }, []);


  // ===================================================
  // FORMAT ORDER STATUS
  // ===================================================

  function formatStatus(status) {

    if (!status) {
      return "Pending";
    }


    return String(status)
      .replaceAll(
        "_",
        " "
      )
      .replace(
        /\b\w/g,
        (letter) =>
          letter.toUpperCase()
      );

  }


  // ===================================================
  // FORMAT PAYMENT STATUS
  // ===================================================

  function formatPaymentStatus(
    paymentStatus
  ) {

    if (!paymentStatus) {
      return "Unpaid";
    }


    return String(
      paymentStatus
    )
      .replaceAll(
        "_",
        " "
      )
      .replace(
        /\b\w/g,
        (letter) =>
          letter.toUpperCase()
      );

  }


  // ===================================================
  // PAYMENT STATUS CLASS
  // ===================================================

  function getPaymentStatusClass(
    paymentStatus
  ) {

    return `payment-status payment-status-${
      paymentStatus || "unpaid"
    }`;

  }


  // ===================================================
  // FORMAT DATE
  // ===================================================

  function formatDate(date) {

    if (!date) {
      return "—";
    }


    // -------------------------------------------------
    // Handle YYYY-MM-DD safely
    // -------------------------------------------------

    if (
      typeof date === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(
        date
      )
    ) {

      const [
        year,
        month,
        day,
      ] =
        date.split("-");


      const parsedDate =
        new Date(
          Number(year),
          Number(month) - 1,
          Number(day)
        );


      return parsedDate.toLocaleDateString(
        "en-PH",
        {
          year: "numeric",
          month: "long",
          day: "numeric",
        }
      );

    }


    const parsedDate =
      new Date(date);


    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {

      return date;

    }


    return parsedDate.toLocaleDateString(
      "en-PH",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );

  }


  // ===================================================
  // FORMAT PRICE
  // ===================================================

  function formatPrice(value) {

    return Number(
      value || 0
    ).toLocaleString(
      "en-PH",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );

  }


  // ===================================================
  // FORMAT DISTANCE
  // ===================================================

  function formatDistance(value) {

    const distance =
      Number(value || 0);

    return distance.toFixed(2);

  }


  // ===================================================
  // GET DELIVERY FEE
  // ===================================================

  function getDeliveryFee(order) {

    if (
      order.delivery_fee !==
        undefined &&
      order.delivery_fee !==
        null
    ) {

      return Number(
        order.delivery_fee
      );

    }


    // -------------------------------------------------
    // Fallback calculation
    // -------------------------------------------------

    const distance =
      Number(
        order.delivery_distance_km ||
          0
      );


    if (
      distance <= 0
    ) {

      return 0;

    }


    return Number(
      (
        50 +
        distance * 10
      ).toFixed(2)
    );

  }


  // ===================================================
  // GET ORDER SUBTOTAL
  // ===================================================

  function getOrderSubtotal(order) {

    if (
      order.subtotal !==
        undefined &&
      order.subtotal !==
        null
    ) {

      return Number(
        order.subtotal
      );

    }


    const total =
      Number(
        order.total_amount ||
          order.total ||
          0
      );


    const deliveryFee =
      order.order_type ===
        "delivery"
        ? getDeliveryFee(order)
        : 0;


    return Math.max(
      total -
        deliveryFee,
      0
    );

  }


  // ===================================================
  // GET TOTAL
  // ===================================================

  function getOrderTotal(order) {

    if (
      order.total_amount !==
        undefined &&
      order.total_amount !==
        null
    ) {

      return Number(
        order.total_amount
      );

    }


    if (
      order.total !==
        undefined &&
      order.total !==
        null
    ) {

      return Number(
        order.total
      );

    }


    const subtotal =
      getOrderSubtotal(order);


    const deliveryFee =
      order.order_type ===
        "delivery"
        ? getDeliveryFee(order)
        : 0;


    return subtotal +
      deliveryFee;

  }


  // ===================================================
  // LOADING
  // ===================================================

  if (loading) {

    return (

      <section className="my-orders-page">

        <div className="my-orders-container">

          <span className="eyebrow">
            BAKEDROP
          </span>


          <h1>
            My <em>orders.</em>
          </h1>


          <p className="my-orders-loading">
            Loading your orders...
          </p>

        </div>

      </section>

    );

  }


  // ===================================================
  // PAGE
  // ===================================================

  return (

    <section className="my-orders-page">

      <div className="my-orders-container">


        {/* =================================================
            HEADER
        ================================================= */}

        <div className="my-orders-header">

          <span className="eyebrow">
            BAKEDROP ACCOUNT
          </span>


          <h1>
            My <em>orders.</em>
          </h1>


          <p>
            Keep track of your orders,
            schedules, payment, and status.
          </p>

        </div>


        {/* =================================================
            ERROR
        ================================================= */}

        {error && (

          <div className="my-orders-message error">

            {error}

          </div>

        )}


        {/* =================================================
            EMPTY
        ================================================= */}

        {!error &&
          orders.length === 0 && (

            <div className="my-orders-empty">

              <span className="eyebrow">
                NO ORDERS YET
              </span>


              <h2>
                Your first order
                <br />
                is waiting.
              </h2>


              <p>
                Explore our freshly baked
                favorites and place your
                first order with BakeDrop.
              </p>


              <Link
                to="/menu"
                className="btn btn-gold"
              >
                Explore Menu
              </Link>

            </div>

          )}


        {/* =================================================
            ORDERS
        ================================================= */}

        {orders.length > 0 && (

          <div className="my-orders-list">

            {orders.map(
              (order) => (

                <article
                  className="my-order-card"
                  key={order.id}
                >


                  {/* =========================================
                      TOP
                  ========================================== */}

                  <div className="my-order-top">

                    <div>

                      <span className="my-order-label">
                        ORDER #{order.id}
                      </span>


                      <span className="my-order-number">
                        {
                          order.order_number
                        }
                      </span>


                      <h2>

                        {order.order_type ===
                        "delivery"
                          ? "Delivery"
                          : "Pickup"}

                      </h2>

                    </div>


                    {/* ORDER STATUS */}

                    <span
                      className={`order-status order-status-${
                        order.status ||
                        "pending"
                      }`}
                    >

                      {formatStatus(
                        order.status
                      )}

                    </span>

                  </div>


                  {/* =========================================
                      PAYMENT + ORDER STATUS
                  ========================================== */}

                  <div className="my-order-status-row">


                    {/* PAYMENT */}

                    <div className="my-order-payment-status">

                      <span>
                        PAYMENT
                      </span>


                      <strong
                        className={getPaymentStatusClass(
                          order.payment_status
                        )}
                      >

                        {formatPaymentStatus(
                          order.payment_status
                        )}

                      </strong>

                    </div>


                    {/* ORDER STATUS */}

                    <div className="my-order-order-status">

                      <span>
                        ORDER STATUS
                      </span>


                      <strong
                        className={`order-status-text order-status-text-${
                          order.status ||
                          "pending"
                        }`}
                      >

                        {formatStatus(
                          order.status
                        )}

                      </strong>

                    </div>

                  </div>


                  {/* =========================================
                      INFO
                  ========================================== */}

                  <div className="my-order-info">


                    {/* ORDER CREATED */}

                    <div>

                      <span>
                        ORDER DATE
                      </span>


                      <strong>

                        {formatDate(
                          order.created_at
                        )}

                      </strong>

                    </div>


                    {/* SCHEDULE */}

                    <div>

                      <span>
                        SCHEDULE
                      </span>


                      <strong>

                        {formatDate(
                          order.order_date
                        )}


                        {order.order_time && (

                          <>

                            {" • "}

                            {
                              order.order_time
                            }

                          </>

                        )}

                      </strong>

                    </div>


                    {/* ITEMS */}

                    <div>

                      <span>
                        ITEMS
                      </span>


                      <strong>
                        {
                          order.item_count ||
                          0
                        }
                      </strong>

                    </div>


                    {/* TOTAL */}

                    <div>

                      <span>
                        TOTAL
                      </span>


                      <strong className="my-order-total">

                        ₱
                        {formatPrice(
                          getOrderTotal(order)
                        )}

                      </strong>

                    </div>

                  </div>


                  {/* =========================================
                      ORDER COST BREAKDOWN
                  ========================================== */}

                  <div className="my-order-cost-breakdown">

                    {/* SUBTOTAL */}

                    <div className="my-order-cost-row">

                      <span>
                        SUBTOTAL
                      </span>

                      <span>
                        ₱
                        {formatPrice(
                          getOrderSubtotal(order)
                        )}
                      </span>

                    </div>


                    {/* DELIVERY FEE */}

                    {order.order_type === "delivery" && (

                      <div className="my-order-cost-row delivery-cost">

                        <div>

                          <span>
                            DELIVERY FEE
                          </span>

                          <small>
                            ₱50 base + ₱10/km ×{" "}
                            {formatDistance(
                              order.delivery_distance_km
                            )}{" "}
                            km
                          </small>

                        </div>

                        <span>
                          ₱
                          {formatPrice(
                            getDeliveryFee(order)
                          )}
                        </span>

                      </div>

                    )}


                    {/* PICKUP */}

                    {order.order_type === "pickup" && (

                      <div className="my-order-cost-row">

                        <span>
                          DELIVERY FEE
                        </span>

                        <span>
                          ₱0.00
                        </span>

                      </div>

                    )}


                    {/* FINAL TOTAL */}

                    <div className="my-order-cost-row my-order-final-total">

                      <span>
                        TOTAL
                      </span>

                      <strong>
                        ₱
                        {formatPrice(
                          getOrderTotal(order)
                        )}
                      </strong>

                    </div>

                  </div>


                  {/* =========================================
                      ITEMS
                  ========================================== */}

                  {order.items &&
                    order.items.length >
                      0 && (

                      <div className="my-order-items">

                        {order.items.map(
                          (
                            item,
                            index
                          ) => (

                            <div
                              className="my-order-item"
                              key={
                                item.id ||
                                `${order.id}-${index}`
                              }
                            >

                              <div>

                                <strong>
                                  {
                                    item.product_name ||
                                    item.name
                                  }
                                </strong>


                                <span>
                                  ×{" "}
                                  {
                                    item.quantity
                                  }
                                </span>

                              </div>


                              <span>

                                ₱
                                {formatPrice(
                                  item.subtotal ??
                                    item.price *
                                      item.quantity
                                )}

                              </span>

                            </div>

                          )
                        )}

                      </div>

                    )}


                  {/* =========================================
                      DELIVERY ADDRESS
                  ========================================== */}

                  {order.order_type ===
                    "delivery" &&
                    order.delivery_address && (

                    <div className="my-order-address">

                      <span>
                        DELIVERY ADDRESS
                      </span>


                      <p>

                        {typeof order.delivery_address ===
                        "object"
                          ? [
                              order
                                .delivery_address
                                ?.address_line,

                              order
                                .delivery_address
                                ?.city,

                              order
                                .delivery_address
                                ?.province,

                            ]
                              .filter(
                                Boolean
                              )
                              .join(
                                ", "
                              )

                          : order.delivery_address}

                      </p>

                    </div>

                  )}


                  {/* =========================================
                      DELIVERY RIDER
                  ========================================== */}

                  {order.order_type ===
                    "delivery" &&
                    order.rider_id &&
                    order.rider_name && (

                    <div className="my-order-address">

                      <span>
                        DELIVERY RIDER
                      </span>


                      <p>

                        <strong>
                          {order.rider_name}
                        </strong>


                        {order.rider_phone && (

                          <>

                            <br />

                            {order.rider_phone}

                          </>

                        )}

                      </p>

                    </div>

                  )}


                  {/* =========================================
                      DELIVERY DISTANCE
                  ========================================== */}

                  {order.order_type ===
                    "delivery" &&
                    Number(
                      order.delivery_distance_km
                    ) > 0 && (

                    <div className="my-order-address">

                      <span>
                        DELIVERY DISTANCE
                      </span>


                      <p>

                        {
                          formatDistance(
                            order.delivery_distance_km
                          )
                        }{" "}
                        km

                      </p>

                    </div>

                  )}


                  {/* ========================================= 
                CANCEL ORDER 
            ========================================== */}

            {canCustomerCancelOrder(order) && (

              <div className="my-order-cancel">

                <button
                  type="button"
                  className="my-order-cancel-button"
                  onClick={() => {
                    const confirmed = window.confirm(
                      "Are you sure you want to cancel your order?"
                    );

                    if (confirmed) {
                      handleCancelOrder(order);
                    }
                  }}
                >
                  Cancel Order
                </button>

              </div>

            )}


                  {/* =========================================
                      PAID + CONFIRMED MESSAGE
                  ========================================== */}

                  {order.payment_status ===
                    "paid" &&
                    order.status ===
                      "confirmed" && (

                    <div className="my-order-confirmed-message">

                      <strong>
                        Payment confirmed.
                      </strong>


                      <p>
                        Your preorder has been
                        successfully paid and
                        confirmed by BakeDrop.
                      </p>

                    </div>

                  )}


                  {/* =========================================
                      PAYMENT PENDING MESSAGE
                  ========================================== */}

                  {order.payment_status !==
                    "paid" &&
                    order.status ===
                      "pending" && (

                    <div className="my-order-pending-message">

                      <strong>
                        Payment pending.
                      </strong>


                      <p>
                        Your preorder is awaiting
                        payment confirmation.
                      </p>

                    </div>

                  )}


                  {/* =========================================
                      CASH PAYMENT MESSAGE
                  ========================================== */}

                  {(
                    order.payment_method ===
                      "cash_on_pickup" ||
                    order.payment_method ===
                      "cash_on_delivery"
                  ) &&
                    order.payment_status !==
                      "paid" &&
                    order.status !==
                      "cancelled" && (

                    <div className="my-order-pending-message">

                      <strong>
                        Cash payment required.
                      </strong>


                      <p>

                        {order.payment_method ===
                        "cash_on_delivery"
                          ? "Please prepare the exact amount for payment upon delivery."
                          : "Please prepare the exact amount for payment when you pick up your order."}

                      </p>

                    </div>

                  )}

                </article>

              )
            )}

          </div>

        )}


        {/* =================================================
            BACK ACTIONS
        ================================================= */}

        <div className="my-orders-actions">

          <Link
            to="/account"
            className="btn btn-outline"
          >
            Back to Account
          </Link>


          <Link
            to="/menu"
            className="btn btn-gold"
          >
            Order Again
          </Link>

        </div>

      </div>

    </section>

  );

}


export default MyOrders;