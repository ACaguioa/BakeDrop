import { useEffect, useState } from "react";

import AdminNavbar from "../../components/AdminNavbar";
import AdminFooter from "../../components/AdminFooter";

function AdminSchedule() {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [schedule, setSchedule] = useState({
    maximum_orders: 30,
    reserved_orders: 0,
    remaining_slots: 30,
    is_disabled: false
  });

  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [savingProduct, setSavingProduct] = useState(null);

  useEffect(() => {
    fetchSchedule();
    fetchProductCapacity();
  }, [selectedDate]);

  const getToken = () => {
    return localStorage.getItem("bakedrop-token");
  };

  const fetchSchedule = async () => {
    try {
      setLoading(true);

      const token = getToken();

      const response = await fetch(
        `http://localhost:5000/api/admin/schedule?date=${selectedDate}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load schedule."
        );
      }

      setSchedule(data.schedule);

    } catch (error) {
      console.error("Schedule error:", error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };


  const fetchProductCapacity = async () => {
    try {
      setProductsLoading(true);

      const token = getToken();

      const response = await fetch(
        `http://localhost:5000/api/admin/schedule/products?date=${selectedDate}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          "Failed to load product capacities."
        );
      }

      setProducts(data.products);

    } catch (error) {
      console.error(
        "Product schedule error:",
        error
      );

      alert(error.message);

    } finally {
      setProductsLoading(false);
    }
  };


  const handleSaveSchedule = async () => {
    try {
      const maximumOrders =
        Number(schedule.maximum_orders);

      if (
        !Number.isInteger(maximumOrders) ||
        maximumOrders < 1
      ) {
        alert(
          "Maximum orders must be a whole number greater than 0."
        );
        return;
      }

      setSavingSchedule(true);

      const token = getToken();

      const response = await fetch(
        "http://localhost:5000/api/admin/schedule",
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },

          body: JSON.stringify({
            scheduleDate: selectedDate,
            maximumOrders,
            isDisabled: schedule.is_disabled
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          "Failed to save schedule."
        );
      }

      await fetchSchedule();

      alert(
        "Schedule capacity updated successfully."
      );

    } catch (error) {
      console.error(
        "Save schedule error:",
        error
      );

      alert(error.message);

    } finally {
      setSavingSchedule(false);
    }
  };


  const handleProductLimitChange = (
    productId,
    value
  ) => {
    setProducts((currentProducts) =>
      currentProducts.map((product) =>
        product.id === productId
          ? {
              ...product,
              maximum_quantity: value
            }
          : product
      )
    );
  };


  const handleSaveProduct = async (
    product
  ) => {
    try {
      const maximumQuantity =
        Number(product.maximum_quantity);

      if (
        !Number.isInteger(maximumQuantity) ||
        maximumQuantity < 0
      ) {
        alert(
          "Product capacity must be a whole number greater than or equal to 0."
        );
        return;
      }

      setSavingProduct(product.id);

      const token = getToken();

      const response = await fetch(
        "http://localhost:5000/api/admin/schedule/products",
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },

          body: JSON.stringify({
            productId: product.id,
            scheduleDate: selectedDate,
            maximumQuantity,
            isDisabled: product.is_disabled
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          "Failed to save product capacity."
        );
      }

      await fetchProductCapacity();

      alert(
        `${product.name} capacity updated successfully.`
      );

    } catch (error) {
      console.error(
        "Save product capacity error:",
        error
      );

      alert(error.message);

    } finally {
      setSavingProduct(null);
    }
  };


  return (
    <div className="admin-layout">

      <AdminNavbar />

      <main className="admin-main">

        <section className="admin-page">

          <div className="admin-container">

            <div className="admin-page-header">

              <span className="admin-eyebrow">
                BAKEDROP ADMIN
              </span>

              <h1>
                Schedule <em>Capacity</em>
              </h1>

              <p>
                Manage preorder capacity based on the
                customer's scheduled date.
              </p>

            </div>


            {/* =========================================
                DATE
            ========================================= */}

            <section className="admin-card">

              <div className="admin-card-header">

                <div>
                  <span className="admin-eyebrow">
                    SCHEDULE DATE
                  </span>

                  <h2>
                    Select Date
                  </h2>
                </div>

              </div>

              <input
                type="date"
                value={selectedDate}
                onChange={(e) =>
                  setSelectedDate(e.target.value)
                }
              />

            </section>


            {/* =========================================
                OVERALL CAPACITY
            ========================================= */}

            <section className="admin-card">

              <div className="admin-card-header">

                <div>
                  <span className="admin-eyebrow">
                    DAILY CAPACITY
                  </span>

                  <h2>
                    Overall Order Capacity
                  </h2>
                </div>

              </div>


              {loading ? (
                <p>Loading schedule...</p>
              ) : (
                <>

                  <div className="admin-stats-grid">

                    <div className="admin-stat-card">

                      <span>
                        Maximum Orders
                      </span>

                      <strong>
                        {schedule.maximum_orders}
                      </strong>

                    </div>


                    <div className="admin-stat-card">

                      <span>
                        Reserved Orders
                      </span>

                      <strong>
                        {schedule.reserved_orders}
                      </strong>

                    </div>


                    <div className="admin-stat-card">

                      <span>
                        Remaining Slots
                      </span>

                      <strong>
                        {schedule.remaining_slots}
                      </strong>

                    </div>

                  </div>


                  <div className="admin-form-row">

                    <label>
                      Maximum Orders
                    </label>

                    <input
                      type="number"
                      min="1"
                      value={
                        schedule.maximum_orders
                      }
                      onChange={(e) =>
                        setSchedule({
                          ...schedule,
                          maximum_orders:
                            e.target.value
                        })
                      }
                    />

                  </div>


                  <label className="admin-checkbox">

                    <input
                      type="checkbox"
                      checked={
                        schedule.is_disabled
                      }
                      onChange={(e) =>
                        setSchedule({
                          ...schedule,
                          is_disabled:
                            e.target.checked
                        })
                      }
                    />

                    <span>
                      Disable ordering for this date
                    </span>

                  </label>


                  <button
                    type="button"
                    onClick={handleSaveSchedule}
                    disabled={savingSchedule}
                    className="admin-button"
                  >
                    {savingSchedule
                      ? "Saving..."
                      : "Save Schedule"}
                  </button>

                </>
              )}

            </section>


            {/* =========================================
                PRODUCT CAPACITY
            ========================================= */}

            <section className="admin-card">

              <div className="admin-card-header">

                <div>

                  <span className="admin-eyebrow">
                    PRODUCT CAPACITY
                  </span>

                  <h2>
                    Product Limits for{" "}
                    {selectedDate}
                  </h2>

                </div>

              </div>


              {productsLoading ? (
                <p>
                  Loading products...
                </p>
              ) : (

                <div className="admin-product-list">

                  {products.map((product) => (

                    <div
                      key={product.id}
                      className="admin-product-row"
                    >

                      <div className="admin-product-info">

                        <strong>
                          {product.name}
                        </strong>

                        <span>
                          ₱
                          {Number(
                            product.price
                          ).toLocaleString(
                            "en-PH",
                            {
                              minimumFractionDigits: 2
                            }
                          )}
                        </span>

                      </div>


                      <div className="admin-product-capacity">

                        <div>

                          <small>
                            Reserved
                          </small>

                          <strong>
                            {
                              product.reserved_quantity
                            }
                          </strong>

                        </div>


                        <div>

                          <small>
                            Remaining
                          </small>

                          <strong>
                            {
                              product.remaining_quantity ===
                              null
                                ? "Unlimited"
                                : product.remaining_quantity
                            }
                          </strong>

                        </div>


                        <div>

                          <small>
                            Maximum
                          </small>

                          <input
                            type="number"
                            min="0"
                            value={
                              product.maximum_quantity
                            }
                            onChange={(e) =>
                              handleProductLimitChange(
                                product.id,
                                e.target.value
                              )
                            }
                          />

                        </div>


                        <label className="admin-checkbox">

                          <input
                            type="checkbox"
                            checked={
                              product.is_disabled
                            }
                            onChange={(e) =>
                              setProducts(
                                (currentProducts) =>
                                  currentProducts.map(
                                    (item) =>
                                      item.id ===
                                      product.id
                                        ? {
                                            ...item,
                                            is_disabled:
                                              e.target
                                                .checked
                                          }
                                        : item
                                  )
                              )
                            }
                          />

                          <span>
                            Disable
                          </span>

                        </label>


                        <button
                          type="button"
                          onClick={() =>
                            handleSaveProduct(
                              product
                            )
                          }
                          disabled={
                            savingProduct ===
                            product.id
                          }
                          className="admin-button-small"
                        >
                          {savingProduct ===
                          product.id
                            ? "Saving..."
                            : "Save"}
                        </button>


                        {product.is_full && (
                          <span className="admin-status-danger">
                            FULL
                          </span>
                        )}

                      </div>

                    </div>

                  ))}

                </div>

              )}

            </section>

          </div>

        </section>

      </main>

      <AdminFooter />

    </div>
  );
}

export default AdminSchedule;