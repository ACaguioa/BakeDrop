import { useEffect, useMemo, useState } from "react";

import AdminNavbar from "../../components/AdminNavbar";
import AdminFooter from "../../components/AdminFooter";


// =====================================================
// API
// =====================================================

const API_BASE = "http://localhost:5000";


// =====================================================
// STATUS OPTIONS
// =====================================================

const STATUS_OPTIONS = [
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "out_for_delivery",
  "completed",
  "cancelled",
];


// =====================================================
// ORDER VIEW OPTIONS
// =====================================================

const VIEW_OPTIONS = [
  {
    value: "next",
    label: "Next Order",
  },

  {
    value: "today",
    label: "Today",
  },

  {
    value: "upcoming",
    label: "Upcoming",
  },

  {
    value: "all",
    label: "All Orders",
  },
];


// =====================================================
// GET TODAY DATE
// =====================================================

function getTodayDate() {
  const now = new Date();

  const year =
    now.getFullYear();

  const month =
    String(
      now.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      now.getDate()
    ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}


// =====================================================
// GET ORDER DATE + TIME
// =====================================================

function getOrderDateTime(order) {
  if (!order?.order_date) {
    return null;
  }

  const datePart =
    String(
      order.order_date
    ).slice(0, 10);

  const timePart =
    order.order_time
      ? String(
          order.order_time
        ).slice(0, 8)
      : "23:59:59";

  const date =
    new Date(
      `${datePart}T${timePart}`
    );

  return Number.isNaN(
    date.getTime()
  )
    ? null
    : date;
}


// =====================================================
// FORMAT DATE
// =====================================================

function formatDate(dateValue) {
  if (!dateValue) {
    return "—";
  }

  const datePart =
    String(
      dateValue
    ).slice(0, 10);

  const [
    year,
    month,
    day,
  ] =
    datePart.split("-");

  if (
    !year ||
    !month ||
    !day
  ) {
    return dateValue;
  }

  const date =
    new Date(
      Number(year),
      Number(month) - 1,
      Number(day)
    );

  return date.toLocaleDateString(
    "en-PH",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );
}


// =====================================================
// FORMAT TIME
// =====================================================

function formatTime(timeValue) {
  if (!timeValue) {
    return "Any time";
  }

  const value = String(timeValue).trim();

  // Already formatted like "9:00 AM"
  if (/^\d{1,2}:\d{2}\s?(AM|PM)$/i.test(value)) {
    return value;
  }

  // Handle database format like "09:00:00"
  const parts = value.split(":");

  const hours = Number(parts[0]);
  const minutes = Number(parts[1] || 0);

  if (
    Number.isNaN(hours) ||
    hours < 0 ||
    hours > 23 ||
    Number.isNaN(minutes) ||
    minutes < 0 ||
    minutes > 59
  ) {
    return "Any time";
  }

  const date = new Date();

  date.setHours(
    hours,
    minutes,
    0,
    0
  );

  return date.toLocaleTimeString(
    "en-PH",
    {
      hour: "numeric",
      minute: "2-digit",
    }
  );
}


// =====================================================
// FORMAT MONEY
// =====================================================

function formatMoney(value) {
  return `₱${Number(
    value || 0
  ).toLocaleString(
    "en-PH",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  )}`;
}


// =====================================================
// STATUS CLASS
// =====================================================

function getStatusClass(status) {
  return `admin-order-status admin-order-status-${status}`;
}


// =====================================================
// CUSTOMER NAME
// =====================================================

function getCustomerName(order) {
  const firstName =
    order.first_name || "";

  const lastName =
    order.last_name || "";

  const fullName =
    `${firstName} ${lastName}`.trim();

  return (
    fullName ||
    order.customer_name ||
    "Customer"
  );
}


// =====================================================
// FORMAT ORDER TYPE
// =====================================================

function formatOrderType(orderType) {
  return String(
    orderType || "pickup"
  )
    .replaceAll(
      "_",
      " "
    )
    .replace(
      /\b\w/g,
      (char) =>
        char.toUpperCase()
    );
}


// =====================================================
// FORMAT STATUS
// =====================================================

function formatStatus(status) {
  return String(
    status || ""
  )
    .replaceAll(
      "_",
      " "
    )
    .replace(
      /\b\w/g,
      (char) =>
        char.toUpperCase()
    );
}


// =====================================================
// ADMIN ORDERS
// =====================================================

function AdminOrders() {

  // ===================================================
  // STATE
  // ===================================================

  const [orders, setOrders] =
    useState([]);

  const [selectedOrder, setSelectedOrder] =
    useState(null);

  const [viewFilter, setViewFilter] =
    useState("next");

  const [statusFilter, setStatusFilter] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [loadingDetails, setLoadingDetails] =
    useState(false);

  const [updatingStatus, setUpdatingStatus] =
    useState(false);

  const [error, setError] =
    useState("");

  const [detailsError, setDetailsError] =
    useState("");


  // ===================================================
  // TOKEN
  // ===================================================

  const token =
    localStorage.getItem(
      "bakedrop-token"
    );


  // ===================================================
  // LOAD ORDERS
  // ===================================================

  const loadOrders = async () => {

    try {

      setLoading(true);

      setError("");

      const params =
        new URLSearchParams();

      if (statusFilter) {
        params.set(
          "status",
          statusFilter
        );
      }

      const query =
        params.toString();

      const response =
        await fetch(
          `${API_BASE}/api/admin/orders${
            query
              ? `?${query}`
              : ""
          }`,
          {
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
            "Failed to load orders."
        );
      }

      setOrders(
        Array.isArray(
          data.orders
        )
          ? data.orders
          : []
      );

    } catch (err) {

      setError(
        err.message ||
          "Failed to load orders."
      );

    } finally {

      setLoading(false);

    }
  };


  // ===================================================
  // LOAD ORDERS ON PAGE LOAD
  // ===================================================

  useEffect(() => {

    loadOrders();

  }, [statusFilter]);


  // ===================================================
  // SORT ORDERS BY SCHEDULED DATE + TIME
  // ===================================================

  const sortedOrders =
    useMemo(() => {

      return [
        ...orders,
      ].sort(
        (a, b) => {

          const dateA =
            getOrderDateTime(
              a
            );

          const dateB =
            getOrderDateTime(
              b
            );

          if (
            !dateA &&
            !dateB
          ) {
            return 0;
          }

          if (!dateA) {
            return 1;
          }

          if (!dateB) {
            return -1;
          }

          return (
            dateA.getTime() -
            dateB.getTime()
          );

        }
      );

    }, [orders]);


  // ===================================================
  // FILTER ORDERS
  // ===================================================

  const filteredOrders =
    useMemo(() => {

      const today =
        getTodayDate();

      const now =
        new Date();


      // -----------------------------------------------
      // ACTIVE ORDERS
      // -----------------------------------------------

      const activeOrders =
        sortedOrders.filter(
          (order) =>
            order.status !==
              "completed" &&
            order.status !==
              "cancelled"
        );


      // -----------------------------------------------
      // NEXT ORDER
      // -----------------------------------------------

      if (
        viewFilter ===
        "next"
      ) {

        return activeOrders
          .filter(
            (order) => {

              const orderDateTime =
                getOrderDateTime(
                  order
                );

              return (
                orderDateTime &&
                orderDateTime >=
                  now
              );

            }
          )
          .slice(
            0,
            1
          );
      }


      // -----------------------------------------------
      // TODAY
      // -----------------------------------------------

      if (
        viewFilter ===
        "today"
      ) {

        return activeOrders.filter(
          (order) =>
            String(
              order.order_date
            ).slice(
              0,
              10
            ) === today
        );
      }


      // -----------------------------------------------
      // UPCOMING
      // -----------------------------------------------

      if (
        viewFilter ===
        "upcoming"
      ) {

        return activeOrders.filter(
          (order) => {

            const orderDate =
              String(
                order.order_date
              ).slice(
                0,
                10
              );

            return (
              orderDate >
              today
            );

          }
        );
      }


      // -----------------------------------------------
      // ALL ORDERS
      // -----------------------------------------------

      return sortedOrders;

    }, [
      sortedOrders,
      viewFilter,
    ]);


  // ===================================================
  // NEXT ORDER ID
  // ===================================================

  const nextOrderId =
    filteredOrders.length
      ? filteredOrders[0]?.id
      : null;


  // ===================================================
  // VIEW ORDER DETAILS
  // ===================================================

  const handleViewDetails =
    async (orderId) => {

      try {

        setLoadingDetails(true);

        setDetailsError("");

        const response =
          await fetch(
            `${API_BASE}/api/admin/orders/${orderId}`,
            {
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
              "Failed to load order details."
          );
        }

        setSelectedOrder(
          data.order
        );

      } catch (err) {

        setDetailsError(
          err.message ||
            "Failed to load order details."
        );

      } finally {

        setLoadingDetails(false);

      }
    };


  // ===================================================
  // UPDATE STATUS
  // ===================================================

  const handleStatusChange =
    async (
      orderId,
      newStatus
    ) => {

      try {

        setUpdatingStatus(true);

        const response =
          await fetch(
            `${API_BASE}/api/admin/orders/${orderId}/status`,
            {
              method:
                "PUT",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body:
                JSON.stringify({
                  status:
                    newStatus,
                }),
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to update order status."
          );
        }


        // Update table
        setOrders(
          (currentOrders) =>
            currentOrders.map(
              (order) =>
                order.id ===
                orderId
                  ? {
                      ...order,
                      status:
                        newStatus,
                    }
                  : order
            )
        );


        // Update modal
        setSelectedOrder(
          (currentOrder) =>
            currentOrder
              ? {
                  ...currentOrder,
                  status:
                    newStatus,
                }
              : currentOrder
        );

      } catch (err) {

        alert(
          err.message ||
            "Failed to update order status."
        );

      } finally {

        setUpdatingStatus(
          false
        );

      }
    };

    // ===================================================
// UPDATE PAYMENT STATUS
// ===================================================

const handlePaymentStatusChange =
  async (
    orderId,
    newPaymentStatus
  ) => {

    try {

      setUpdatingStatus(true);

      const response =
        await fetch(
          `${API_BASE}/api/admin/orders/${orderId}/payment-status`,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body:
              JSON.stringify({
                payment_status:
                  newPaymentStatus,
              }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update payment status."
        );
      }


      // =============================================
      // UPDATE TABLE
      // =============================================

      setOrders(
        (currentOrders) =>
          currentOrders.map(
            (order) =>
              order.id === orderId
                ? {
                    ...order,
                    payment_status:
                      newPaymentStatus,
                  }
                : order
          )
      );


      // =============================================
      // UPDATE MODAL
      // =============================================

      setSelectedOrder(
        (currentOrder) =>
          currentOrder
            ? {
                ...currentOrder,
                payment_status:
                  newPaymentStatus,
              }
            : currentOrder
      );


    } catch (err) {

      alert(
        err.message ||
          "Failed to update payment status."
      );

    } finally {

      setUpdatingStatus(false);

    }
  };

  // ===================================================
  // RETURN
  // ===================================================

  return (
    <div className="admin-layout">

      {/* =================================================
          ADMIN NAVBAR
      ================================================= */}

      <AdminNavbar />


      {/* =================================================
          ADMIN ORDERS PAGE
      ================================================= */}

      <main className="admin-page">


        {/* ===============================================
            PAGE HEADER
        =============================================== */}

        <div className="admin-page-header">

          <div>

            <span className="admin-eyebrow">
              ORDER MANAGEMENT
            </span>

            <h1>
              Orders
            </h1>

            <p>
              Manage production schedules
              and prioritize the nearest
              upcoming orders first.
            </p>

          </div>


          <button
            className="admin-button admin-button-secondary"
            onClick={
              loadOrders
            }
          >
            Refresh
          </button>

        </div>


        {/* ===============================================
            ORDER VIEW FILTERS
        =============================================== */}

        <div className="admin-order-view-filters">

          {VIEW_OPTIONS.map(
            (option) => (

              <button
                key={
                  option.value
                }
                type="button"
                className={
                  viewFilter ===
                  option.value
                    ? "admin-order-view-btn active"
                    : "admin-order-view-btn"
                }
                onClick={() =>
                  setViewFilter(
                    option.value
                  )
                }
              >
                {option.label}
              </button>

            )
          )}

        </div>


        {/* ===============================================
            STATUS FILTER
        =============================================== */}

        <div className="admin-order-filter-bar">

          <div>

            <label>
              Status
            </label>

            <select
              value={
                statusFilter
              }
              onChange={(
                event
              ) =>
                setStatusFilter(
                  event.target
                    .value
                )
              }
            >

              <option value="">
                All Statuses
              </option>


              {STATUS_OPTIONS.map(
                (status) => (

                  <option
                    key={status}
                    value={status}
                  >
                    {formatStatus(
                      status
                    )}
                  </option>

                )
              )}

            </select>

          </div>


          <div className="admin-order-filter-summary">

            {loading
              ? "Loading orders..."
              : `${filteredOrders.length} order${
                  filteredOrders.length !==
                  1
                    ? "s"
                    : ""
                }`}

          </div>

        </div>


        {/* ===============================================
            ERROR
        =============================================== */}

        {error && (

          <div className="admin-error-message">
            {error}
          </div>

        )}


        {detailsError && (

          <div className="admin-error-message">
            {detailsError}
          </div>

        )}


        {/* ===============================================
            NEXT ORDER BANNER
        =============================================== */}

        {viewFilter ===
          "next" &&
          !loading && (

            <div className="admin-next-order-banner">

              <div>

                <span>
                  NEXT ORDER
                </span>


                {filteredOrders.length ? (

                  <strong>
                    Order #
                    {
                      filteredOrders[0]
                        .order_number
                    }
                  </strong>

                ) : (

                  <strong>
                    No upcoming active orders
                  </strong>

                )}

              </div>


              {filteredOrders.length >
                0 && (

                <div className="admin-next-order-info">

                  {formatDate(
                    filteredOrders[0]
                      .order_date
                  )}

                  {" • "}

                  {formatTime(
                    filteredOrders[0]
                      .order_time
                  )}

                </div>

              )}

            </div>

          )}


        {/* ===============================================
            ORDERS CARD
        =============================================== */}

        <div className="admin-card">


          {/* -----------------------------------------------
              CARD HEADER
          ----------------------------------------------- */}

          <div className="admin-card-header">

            <div>

              <h2>

                {viewFilter ===
                "next"
                  ? "Next Scheduled Order"
                  : viewFilter ===
                    "today"
                  ? "Today’s Orders"
                  : viewFilter ===
                    "upcoming"
                  ? "Upcoming Orders"
                  : "All Orders"}

              </h2>


              <p>
                Orders are arranged
                by scheduled production
                date and time.
              </p>

            </div>

          </div>


          {/* -----------------------------------------------
              LOADING
          ----------------------------------------------- */}

          {loading ? (

            <div className="admin-empty-state">

              Loading orders...

            </div>


          ) : filteredOrders.length ===
            0 ? (

            <div className="admin-empty-state">

              No orders found
              for this view.

            </div>


          ) : (

            <div className="admin-table-wrapper">

              <table className="admin-table">

                <thead>

                  <tr>

                    <th>
                      Schedule
                    </th>

                    <th>
                      Order
                    </th>

                    <th>
                      Customer
                    </th>

                    <th>
                      Type
                    </th>

                    <th>
                      Total
                    </th>

                    <th>
                      Payment
                    </th>

                    <th>
                      Status
                    </th>

                    <th>
                      Action
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {filteredOrders.map(
                    (order) => {

                      const isNext =
                        viewFilter ===
                          "next" &&
                        order.id ===
                          nextOrderId;


                      return (

                        <tr
                          key={
                            order.id
                          }
                          className={
                            isNext
                              ? "admin-next-order-row"
                              : ""
                          }
                        >

                          {/* =============================
                              SCHEDULE
                          ============================== */}

                          <td>

                            <div className="admin-order-schedule">

                              {isNext && (

                                <span className="admin-next-tag">
                                  NEXT
                                </span>

                              )}


                              <strong>

                                {formatDate(
                                  order.order_date
                                )}

                              </strong>


                              <span>

                                {formatTime(
                                  order.order_time
                                )}

                              </span>

                            </div>

                          </td>


                          {/* =============================
                              ORDER
                          ============================== */}

                          <td>

                            <strong>

                              #
                              {
                                order.order_number
                              }

                            </strong>


                            <small>
                              Order #
                              {
                                order.id
                              }
                            </small>

                          </td>


                          {/* =============================
                              CUSTOMER
                          ============================== */}

                          <td>

                            <strong>
                              {
                                getCustomerName(
                                  order
                                )
                              }
                            </strong>


                            {order.email && (

                              <small>
                                {
                                  order.email
                                }
                              </small>

                            )}

                          </td>


                          {/* =============================
                              TYPE
                          ============================== */}

                                <td>

                                  {formatOrderType(
                                    order.order_type
                                  )}

                                </td>


                                {/* =============================
                                    TOTAL
                                ============================== */}

                                <td>

                                  <strong>

                                    {formatMoney(
                                      order.total_amount
                                    )}

                                  </strong>

                                </td>


                                {/* =============================
                                    PAYMENT
                                ============================== */}

                                <td>

                              <select
                                className={`admin-payment-status ${
                                  order.payment_status === "paid"
                                    ? "paid"
                                    : "unpaid"
                                }`}
                                value={
                                  order.payment_status ||
                                  "unpaid"
                                }
                                disabled={
                                  updatingStatus
                                }
                                onChange={(event) =>
                                  handlePaymentStatusChange(
                                    order.id,
                                    event.target.value
                                  )
                                }
                              >

                                <option value="unpaid">
                                  Unpaid
                                </option>

                                <option value="paid">
                                  Paid
                                </option>

                              </select>

                            </td>


                          {/* =============================
                              STATUS
                          ============================== */}

                          <td>

                            <select
                              className={
                                getStatusClass(
                                  order.status
                                )
                              }
                              value={
                                order.status
                              }
                              disabled={
                                updatingStatus
                              }
                              onChange={(
                                event
                              ) =>
                                handleStatusChange(
                                  order.id,
                                  event
                                    .target
                                    .value
                                )
                              }
                            >

                              {STATUS_OPTIONS.map(
                                (status) => (

                                  <option
                                    key={
                                      status
                                    }
                                    value={
                                      status
                                    }
                                  >
                                    {formatStatus(
                                      status
                                    )}
                                  </option>

                                )
                              )}

                            </select>

                          </td>


                          {/* =============================
                              ACTION
                          ============================== */}

                          <td>

                            <button
                              className="admin-button admin-button-small"
                              onClick={() =>
                                handleViewDetails(
                                  order.id
                                )
                              }
                            >
                              View
                            </button>

                          </td>

                        </tr>

                      );

                    }
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>


        {/* =================================================
            ORDER DETAILS MODAL
        ================================================= */}

        {selectedOrder && (

          <div
            className="admin-modal-backdrop"
            onClick={() =>
              setSelectedOrder(
                null
              )
            }
          >

            <div
              className="admin-product-modal"
              onClick={(
                event
              ) =>
                event.stopPropagation()
              }
            >


              {/* =========================================
                  MODAL HEADER
              ========================================== */}

              <div className="admin-modal-header">

                <div>

                  <span className="admin-eyebrow">
                    ORDER DETAILS
                  </span>


                  <h2>
                    #
                    {
                      selectedOrder.order_number
                    }
                  </h2>

                </div>


                <button
                  className="admin-modal-close"
                  onClick={() =>
                    setSelectedOrder(
                      null
                    )
                  }
                >
                  ×
                </button>

              </div>


              {/* =========================================
                  LOADING DETAILS
              ========================================== */}

              {loadingDetails ? (

                <div className="admin-empty-state">

                  Loading order details...

                </div>

              ) : (

                <div className="admin-detail-section">


                  {/* =======================================
                      BASIC INFORMATION
                  ======================================== */}

                  <div className="admin-detail-grid">


                    <div>

                      <span>
                        Customer
                      </span>

                      <strong>
                        {
                          getCustomerName(
                            selectedOrder
                          )
                        }
                      </strong>

                    </div>


                    <div>

                      <span>
                        Email
                      </span>

                      <strong>
                        {
                          selectedOrder.email ||
                          "—"
                        }
                      </strong>

                    </div>


                    <div>

                      <span>
                        Scheduled Date
                      </span>

                      <strong>
                        {
                          formatDate(
                            selectedOrder.order_date
                          )
                        }
                      </strong>

                    </div>


                    <div>

                      <span>
                        Scheduled Time
                      </span>

                      <strong>
                        {
                          formatTime(
                            selectedOrder.order_time
                          )
                        }
                      </strong>

                    </div>


                    <div>

                      <span>
                        Order Type
                      </span>

                      <strong>
                        {
                          formatOrderType(
                            selectedOrder.order_type
                          )
                        }
                      </strong>

                    </div>


                    <div>

                        <span>
                          Payment
                        </span>

                        <select
                          className={`admin-payment-status ${
                            selectedOrder.payment_status === "paid"
                              ? "paid"
                              : "unpaid"
                          }`}
                          value={
                            selectedOrder.payment_status ||
                            "unpaid"
                          }
                          disabled={
                            updatingStatus
                          }
                          onChange={(event) =>
                            handlePaymentStatusChange(
                              selectedOrder.id,
                              event.target.value
                            )
                          }
                        >

                          <option value="unpaid">
                            Unpaid
                          </option>

                          <option value="paid">
                            Paid
                          </option>

                        </select>

                      </div>
                  </div>


                  {/* =======================================
                      DELIVERY ADDRESS
                  ======================================== */}

                  {selectedOrder.delivery_address && (

                    <div className="admin-detail-block">

                      <span>
                        Delivery Address
                      </span>


                      <p>

                        {typeof selectedOrder.delivery_address ===
                        "object"
                          ? [
                              selectedOrder
                                .delivery_address
                                ?.address_line,

                              selectedOrder
                                .delivery_address
                                ?.city,

                              selectedOrder
                                .delivery_address
                                ?.province,
                            ]
                              .filter(
                                Boolean
                              )
                              .join(
                                ", "
                              )

                          : selectedOrder.delivery_address}

                      </p>

                    </div>

                  )}


                  {/* =======================================
                      NOTES
                  ======================================== */}

                  {selectedOrder.notes && (

                    <div className="admin-detail-block">

                      <span>
                        Notes
                      </span>


                      <p>
                        {
                          selectedOrder.notes
                        }
                      </p>

                    </div>

                  )}


                  {/* =======================================
                      ITEMS
                  ======================================== */}

                  <div className="admin-detail-block">

                    <span>
                      Items
                    </span>


                    <div className="admin-order-items">

                      {selectedOrder.items?.map(
                        (item) => (

                          <div
                            key={
                              item.id
                            }
                            className="admin-order-item"
                          >

                            <div>

                              <strong>
                                {
                                  item.product_name
                                }
                              </strong>


                              <span>
                                Qty:{" "}
                                {
                                  item.quantity
                                }
                              </span>


                              {item.customization && (

                                <small>

                                  Customization:{" "}

                                  {typeof item.customization ===
                                  "object"
                                    ? JSON.stringify(
                                        item.customization
                                      )
                                    : item.customization}

                                </small>

                              )}

                            </div>


                            <strong>

                              {formatMoney(
                                item.subtotal
                              )}

                            </strong>

                          </div>

                        )
                      )}

                    </div>

                  </div>


                  {/* =======================================
                      ORDER TOTAL
                  ======================================== */}

                  <div className="admin-order-total">

                    <span>
                      Total
                    </span>


                    <strong>

                      {formatMoney(
                        selectedOrder.total_amount
                      )}

                    </strong>

                  </div>


                  {/* =======================================
                      UPDATE STATUS
                  ======================================== */}

                  <div className="admin-detail-block">

                    <span>
                      Update Status
                    </span>


                    <select
                      className={
                        getStatusClass(
                          selectedOrder.status
                        )
                      }
                      value={
                        selectedOrder.status
                      }
                      disabled={
                        updatingStatus
                      }
                      onChange={(
                        event
                      ) =>
                        handleStatusChange(
                          selectedOrder.id,
                          event.target
                            .value
                        )
                      }
                    >

                      {STATUS_OPTIONS.map(
                        (status) => (

                          <option
                            key={
                              status
                            }
                            value={
                              status
                            }
                          >
                            {formatStatus(
                              status
                            )}
                          </option>

                        )
                      )}

                    </select>

                  </div>

                </div>

              )}

            </div>

          </div>

        )}

      </main>


      {/* =================================================
          ADMIN FOOTER
      ================================================= */}

      <AdminFooter />

    </div>
  );
}

export default AdminOrders;