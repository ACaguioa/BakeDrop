import { useEffect, useState } from "react";

import AdminNavbar from "../../components/AdminNavbar";
import AdminFooter from "../../components/AdminFooter";

const API_BASE = "http://127.0.0.1:5000";

function AdminRiderAssignment() {
  const [orders, setOrders] = useState([]);
  const [riders, setRiders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [assigningOrderId, setAssigningOrderId] =
    useState(null);

  const [showAddRider, setShowAddRider] =
    useState(false);

  const [riderName, setRiderName] =
    useState("");

  const [riderPhone, setRiderPhone] =
    useState("");

  const [addingRider, setAddingRider] =
    useState(false);

  const [updatingRiderId, setUpdatingRiderId] =
    useState(null);

  const token =
    localStorage.getItem("bakedrop-token");


  /* =====================================================
     LOAD RIDERS + ORDERS
  ===================================================== */

  const loadData = async () => {
    try {
      setLoading(true);

      const headers = {
        Authorization: `Bearer ${token}`
      };

      const [
        ordersResponse,
        ridersResponse
      ] = await Promise.all([
        fetch(
          `${API_BASE}/api/admin/riders/orders`,
          {
            headers
          }
        ),

        fetch(
          `${API_BASE}/api/admin/riders`,
          {
            headers
          }
        )
      ]);

      const ordersData =
        await ordersResponse.json();

      const ridersData =
        await ridersResponse.json();

      if (ordersData.success) {
        setOrders(
          ordersData.orders || []
        );
      }

      if (ridersData.success) {
        setRiders(
          ridersData.riders || []
        );
      }

    } catch (error) {
      console.error(
        "LOAD RIDER ASSIGNMENT ERROR:",
        error
      );

    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadData();
  }, []);


  /* =====================================================
     ADD RIDER
  ===================================================== */

  const handleAddRider = async (event) => {
    event.preventDefault();

    const cleanName =
      riderName.trim();

    const cleanPhone =
      riderPhone.trim();

    if (!cleanName) {
      alert(
        "Please enter the rider's name."
      );
      return;
    }

    if (!cleanPhone) {
      alert(
        "Please enter the rider's contact number."
      );
      return;
    }

    try {
      setAddingRider(true);

      const response = await fetch(
        `${API_BASE}/api/admin/riders`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },

          body: JSON.stringify({
            name: cleanName,
            phone: cleanPhone
          })
        }
      );

      const data =
        await response.json();

      if (!data.success) {
        alert(
          data.message ||
          "Failed to add rider."
        );

        return;
      }

      setRiders(
        (currentRiders) => [
          data.rider,
          ...currentRiders
        ]
      );

      setRiderName("");
      setRiderPhone("");
      setShowAddRider(false);

    } catch (error) {
      console.error(
        "ADD RIDER FRONTEND ERROR:",
        error
      );

      alert(
        "Something went wrong while adding the rider."
      );

    } finally {
      setAddingRider(false);
    }
  };


  /* =====================================================
     TOGGLE RIDER ACTIVE / INACTIVE
  ===================================================== */

  const handleToggleRider = async (
    rider
  ) => {
    try {
      setUpdatingRiderId(rider.id);

      const newStatus =
        !Boolean(rider.is_active);

      const response = await fetch(
        `${API_BASE}/api/admin/riders/${rider.id}`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },

          body: JSON.stringify({
            name: rider.name,
            phone: rider.phone,
            is_active: newStatus
          })
        }
      );

      const data =
        await response.json();

      if (!data.success) {
        alert(
          data.message ||
          "Failed to update rider."
        );

        return;
      }

      setRiders(
        (currentRiders) =>
          currentRiders.map(
            (currentRider) =>
              currentRider.id === rider.id
                ? data.rider
                : currentRider
          )
      );

    } catch (error) {
      console.error(
        "TOGGLE RIDER ERROR:",
        error
      );

      alert(
        "Something went wrong while updating the rider."
      );

    } finally {
      setUpdatingRiderId(null);
    }
  };


  /* =====================================================
     ASSIGN / REASSIGN / UNASSIGN RIDER
  ===================================================== */

  const handleAssignRider = async (
    orderId,
    riderId
  ) => {
    try {
      setAssigningOrderId(orderId);

      const response = await fetch(
        `${API_BASE}/api/admin/riders/orders/${orderId}/assign`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },

          body: JSON.stringify({
            rider_id:
              riderId === ""
                ? null
                : Number(riderId)
          })
        }
      );

      const data =
        await response.json();

      if (!data.success) {
        alert(
          data.message ||
          "Failed to assign rider."
        );

        return;
      }

      setOrders(
        (currentOrders) =>
          currentOrders.map(
            (order) =>
              order.id === orderId
                ? {
                    ...order,

                    rider_id:
                      data.order.rider_id,

                    rider_name:
                      data.order.rider_name,

                    rider_phone:
                      data.order.rider_phone
                  }
                : order
          )
      );

    } catch (error) {
      console.error(
        "ASSIGN RIDER FRONTEND ERROR:",
        error
      );

      alert(
        "Something went wrong while assigning the rider."
      );

    } finally {
      setAssigningOrderId(null);
    }
  };


  /* =====================================================
     FORMAT CURRENCY
  ===================================================== */

  const formatCurrency = (
    amount
  ) => {
    return `₱${Number(
      amount || 0
    ).toLocaleString(
      "en-PH",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }
    )}`;
  };


  /* =====================================================
     FORMAT TIME
  ===================================================== */

  const formatTime = (
    time
  ) => {
    if (!time) {
      return "—";
    }

    const value =
      String(time);

    /*
      MySQL TIME:
      HH:MM:SS
    */

    const match =
      value.match(
        /^(\d{1,2}):(\d{2})/
      );

    if (match) {
      let hours =
        Number(match[1]);

      const minutes =
        Number(match[2]);

      const period =
        hours >= 12
          ? "PM"
          : "AM";

      hours =
        hours % 12 || 12;

      return `${hours}:${String(
        minutes
      ).padStart(
        2,
        "0"
      )} ${period}`;
    }

    /*
      Fallback for date/time values
    */

    const date =
      new Date(value);

    if (
      !Number.isNaN(
        date.getTime()
      )
    ) {
      return date.toLocaleTimeString(
        "en-PH",
        {
          hour: "numeric",
          minute: "2-digit"
        }
      );
    }

    return value;
  };


  /* =====================================================
     ACTIVE / INACTIVE RIDERS
  ===================================================== */

  const activeRiders =
    riders.filter(
      (rider) =>
        Boolean(rider.is_active)
    );

  const inactiveRiders =
    riders.filter(
      (rider) =>
        !Boolean(rider.is_active)
    );


  /* =====================================================
     PAGE
  ===================================================== */

  return (
    <div className="admin-layout">

      <AdminNavbar />


      <main className="admin-rider-assignment-page">

        {/* =================================================
            PAGE HEADER
        ================================================= */}

        <div className="admin-page-header">

          <div>

            <span className="admin-eyebrow">
              DELIVERY MANAGEMENT
            </span>

            <h1>
              Rider <em>Assignment</em>
            </h1>

            <p>
              Assign BakeDrop's personal delivery
              riders to orders that are currently
              out for delivery.
            </p>

          </div>


          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap"
            }}
          >

            <button
              type="button"
              className="admin-secondary-button"
              onClick={() =>
                setShowAddRider(
                  (current) =>
                    !current
                )
              }
            >
              {showAddRider
                ? "CLOSE"
                : "ADD RIDER"}
            </button>


            <button
              type="button"
              className="admin-secondary-button"
              onClick={loadData}
              disabled={loading}
            >
              {loading
                ? "LOADING..."
                : "REFRESH"}
            </button>

          </div>

        </div>


        {/* =================================================
            ADD RIDER
        ================================================= */}

        {showAddRider && (

          <section className="admin-rider-section">

            <div className="admin-section-heading">

              <div>

                <span className="admin-eyebrow">
                  RIDER MANAGEMENT
                </span>

                <h2>
                  Add <em>Rider</em>
                </h2>

              </div>

            </div>


            <form
              onSubmit={
                handleAddRider
              }

              style={{
                display: "grid",
                gridTemplateColumns:
                  "1fr 1fr auto",
                gap: "15px",
                alignItems: "end",
                padding: "25px",
                border:
                  "1px solid var(--line)",
                background:
                  "rgba(255,255,255,.02)"
              }}
            >

              <div>

                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    color:
                      "var(--muted)",
                    fontSize: "9px",
                    fontWeight: "600",
                    letterSpacing:
                      ".12em"
                  }}
                >
                  RIDER NAME
                </label>


                <input
                  type="text"
                  value={riderName}
                  onChange={(event) =>
                    setRiderName(
                      event.target.value
                    )
                  }
                  placeholder="Enter rider name"
                  style={{
                    width: "100%",
                    padding:
                      "13px 14px",
                    border:
                      "1px solid var(--line)",
                    background:
                      "var(--espresso)",
                    color:
                      "var(--cream)",
                    font:
                      "inherit",
                    outline: "none"
                  }}
                />

              </div>


              <div>

                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    color:
                      "var(--muted)",
                    fontSize: "9px",
                    fontWeight: "600",
                    letterSpacing:
                      ".12em"
                  }}
                >
                  CONTACT NUMBER
                </label>


                <input
                  type="text"
                  value={riderPhone}
                  onChange={(event) =>
                    setRiderPhone(
                      event.target.value
                    )
                  }
                  placeholder="09XXXXXXXXX"
                  style={{
                    width: "100%",
                    padding:
                      "13px 14px",
                    border:
                      "1px solid var(--line)",
                    background:
                      "var(--espresso)",
                    color:
                      "var(--cream)",
                    font:
                      "inherit",
                    outline: "none"
                  }}
                />

              </div>


              <button
                type="submit"
                className="admin-secondary-button"
                disabled={
                  addingRider
                }
              >
                {addingRider
                  ? "ADDING..."
                  : "SAVE RIDER"}
              </button>

            </form>

          </section>

        )}


        {/* =================================================
            DELIVERY ORDERS
        ================================================= */}

        <section className="admin-rider-section">

          <div className="admin-section-heading">

            <div>

              <span className="admin-eyebrow">
                OUT FOR DELIVERY
              </span>

              <h2>
                Delivery <em>Orders</em>
              </h2>

            </div>


            <span className="admin-count-badge">
              {orders.length}
            </span>

          </div>


          {loading ? (

            <div className="admin-empty-state">
              Loading delivery orders...
            </div>

          ) : orders.length === 0 ? (

            <div className="admin-empty-state">
              No orders are currently out for delivery.
            </div>

          ) : (

            <div className="admin-rider-orders">

              {orders.map(
                (order) => (

                  <div
                    className="admin-rider-order-card"
                    key={order.id}
                  >

                    {/* =====================================
                        ORDER INFORMATION
                    ===================================== */}

                    <div className="admin-rider-order-main">

                      <div className="admin-rider-order-top">

                        <div>

                          <span className="admin-order-label">
                            ORDER
                          </span>

                          <h3>
                            #
                            {
                              order.order_number
                            }
                          </h3>

                        </div>


                        <span className="admin-status-badge">
                          OUT FOR DELIVERY
                        </span>

                      </div>


                      <div className="admin-rider-order-info">

                        <div>

                          <span>
                            CUSTOMER
                          </span>

                          <strong>
                            {
                              order.customer_name ||
                              "Customer"
                            }
                          </strong>

                        </div>


                        <div>

                          <span>
                            SCHEDULED TIME
                          </span>

                          <strong>
                            {formatTime(
                              order.order_time
                            )}
                          </strong>

                        </div>


                        <div>

                          <span>
                            ORDER TOTAL
                          </span>

                          <strong>
                            {
                              formatCurrency(
                                order.total_amount
                              )
                            }
                          </strong>

                        </div>

                      </div>


                      <div className="admin-rider-address">

                        <span>
                          DELIVERY ADDRESS
                        </span>

                        <p>
                          {
                            order.delivery_address ||
                            "No delivery address"
                          }
                        </p>

                      </div>

                    </div>


                    {/* =====================================
                        RIDER ASSIGNMENT
                    ===================================== */}

                    <div className="admin-rider-assignment">

                      <label>
                        ASSIGNED RIDER
                      </label>


                      <select
                        value={
                          order.rider_id ||
                          ""
                        }
                        onChange={(
                          event
                        ) =>
                          handleAssignRider(
                            order.id,
                            event.target.value
                          )
                        }
                        disabled={
                          assigningOrderId ===
                          order.id
                        }
                      >

                        <option value="">
                          Select a rider
                        </option>


                        {activeRiders.map(
                          (rider) => (

                            <option
                              key={
                                rider.id
                              }
                              value={
                                rider.id
                              }
                            >
                              {rider.name}
                              {" — "}
                              {rider.phone}
                            </option>

                          )
                        )}

                      </select>


                      <small>

                        {
                          assigningOrderId ===
                          order.id
                            ? "Updating rider..."
                            : order.rider_name
                              ? `${order.rider_name} • ${order.rider_phone}`
                              : "No rider assigned"
                        }

                      </small>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </section>


        {/* =================================================
            ACTIVE RIDERS
        ================================================= */}

        <section className="admin-rider-section">

          <div className="admin-section-heading">

            <div>

              <span className="admin-eyebrow">
                PERSONAL RIDERS
              </span>

              <h2>
                Active <em>Riders</em>
              </h2>

            </div>


            <span className="admin-count-badge">
              {activeRiders.length}
            </span>

          </div>


          {activeRiders.length === 0 ? (

            <div className="admin-empty-state">
              No active riders have been added yet.
            </div>

          ) : (

            <div className="admin-rider-list">

              {activeRiders.map(
                (rider) => (

                  <div
                    className="admin-rider-list-item"
                    key={rider.id}
                  >

                    <div>

                      <strong>
                        {rider.name}
                      </strong>

                      <span>
                        {rider.phone}
                      </span>

                    </div>


                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px"
                      }}
                    >

                      <span className="admin-active-badge">
                        ACTIVE
                      </span>


                      <button
                        type="button"
                        className="admin-secondary-button"
                        onClick={() =>
                          handleToggleRider(
                            rider
                          )
                        }
                        disabled={
                          updatingRiderId ===
                          rider.id
                        }
                      >
                        {updatingRiderId ===
                        rider.id
                          ? "UPDATING..."
                          : "SET INACTIVE"}
                      </button>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </section>


        {/* =================================================
            INACTIVE RIDERS
        ================================================= */}

        <section className="admin-rider-section">

          <div className="admin-section-heading">

            <div>

              <span className="admin-eyebrow">
                RIDER MANAGEMENT
              </span>

              <h2>
                Inactive <em>Riders</em>
              </h2>

            </div>


            <span className="admin-count-badge">
              {inactiveRiders.length}
            </span>

          </div>


          {inactiveRiders.length === 0 ? (

            <div className="admin-empty-state">
              No inactive riders.
            </div>

          ) : (

            <div className="admin-rider-list">

              {inactiveRiders.map(
                (rider) => (

                  <div
                    className="admin-rider-list-item"
                    key={rider.id}
                  >

                    <div>

                      <strong>
                        {rider.name}
                      </strong>

                      <span>
                        {rider.phone}
                      </span>

                    </div>


                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px"
                      }}
                    >

                      <span
                        className="admin-active-badge"
                        style={{
                          opacity: 0.5
                        }}
                      >
                        INACTIVE
                      </span>


                      <button
                        type="button"
                        className="admin-secondary-button"
                        onClick={() =>
                          handleToggleRider(
                            rider
                          )
                        }
                        disabled={
                          updatingRiderId ===
                          rider.id
                        }
                      >
                        {updatingRiderId ===
                        rider.id
                          ? "UPDATING..."
                          : "SET ACTIVE"}
                      </button>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </section>

      </main>


      <AdminFooter />

    </div>
  );
}

export default AdminRiderAssignment;