import { useEffect, useState } from "react";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";

import AdminNavbar from "../../components/AdminNavbar";
import AdminFooter from "../../components/AdminFooter";

const API_BASE = "http://127.0.0.1:5000";


function AdminDashboard() {

  // =====================================================
  // DAILY LIMIT
  // =====================================================

  const [dailyLimit, setDailyLimit] = useState(30);


  // =====================================================
  // ANALYTICS
  // =====================================================

  const [analytics, setAnalytics] = useState({

    totalOrders: 0,

    totalRevenue: 0,

    todayOrders: 0,

    todayRevenue: 0,

    pendingOrders: 0,

    confirmedOrders: 0,

    preparingOrders: 0,

    outForDeliveryOrders: 0,

    completedOrders: 0

  });


  // =====================================================
  // CHART DATA
  // =====================================================

  const [chartData, setChartData] = useState([]);


  // =====================================================
  // PRODUCTS
  // =====================================================

  const [products, setProducts] = useState([]);


  // =====================================================
  // LOADING
  // =====================================================

  const [loading, setLoading] = useState(true);

  const [productsLoading, setProductsLoading] =
    useState(true);


  // =====================================================
  // ERROR
  // =====================================================

  const [analyticsError, setAnalyticsError] =
    useState("");


  // =====================================================
  // EDITING PRODUCT
  // =====================================================

  const [editingProduct, setEditingProduct] =
    useState(null);


  // =====================================================
  // LOAD ANALYTICS
  // =====================================================

  useEffect(() => {

    let isMounted = true;


    const fetchAnalytics = async () => {

      try {

        const token =
          localStorage.getItem(
            "bakedrop-token"
          );


        if (!token) {

          throw new Error(
            "Admin authentication token is missing."
          );

        }


        const response =
          await fetch(
            `${API_BASE}/api/admin/analytics`,
            {
              method: "GET",

              headers: {
                Authorization:
                  `Bearer ${token}`,

                "Content-Type":
                  "application/json"
              }
            }
          );


        const data =
          await response.json();


        console.log(
          "ADMIN ANALYTICS RESPONSE:",
          data
        );


        if (!response.ok) {

          throw new Error(
            data.message ||
            "Failed to load analytics."
          );

        }


        const source =
          data.analytics || data;


        // =================================================
        // BASIC ANALYTICS
        // =================================================

        const totalOrders =
          Number(
            source.totalOrders ??
            source.total_orders ??
            0
          );


        const totalRevenue =
          Number(
            source.totalRevenue ??
            source.total_revenue ??
            source.revenue ??
            0
          );


        const todayOrders =
          Number(
            source.todayOrders ??
            source.today_orders ??
            0
          );


        const todayRevenue =
          Number(
            source.todayRevenue ??
            source.today_revenue ??
            0
          );


        const pendingOrders =
          Number(
            source.pendingOrders ??
            source.pending_orders ??
            0
          );


        const confirmedOrders =
          Number(
            source.confirmedOrders ??
            source.confirmed_orders ??
            0
          );


        const preparingOrders =
          Number(
            source.preparingOrders ??
            source.preparing_orders ??
            0
          );


        const outForDeliveryOrders =
          Number(
            source.outForDeliveryOrders ??
            source.out_for_delivery_orders ??
            source.outForDelivery ??
            source.out_for_delivery ??
            source.outForDeliveryOrdersCount ??
            source.out_for_delivery_orders_count ??
            source.outForDeliveryCount ??
            source.out_for_delivery_count ??
            0
          );


        const completedOrders =
          Number(
            source.completedOrders ??
            source.completed_orders ??
            0
          );


        // =================================================
        // DAILY CHART DATA
        // =================================================

        const dailyData =
          source.daily ??
          source.dailyData ??
          data.daily ??
          data.dailyData ??
          [];


        const formattedDailyData =
          Array.isArray(dailyData)
            ? dailyData.map((item) => {

                const rawDate =
                  item.date ||
                  item.order_date ||
                  item.day ||
                  "";


                let formattedDate =
                  rawDate;


                if (rawDate) {

                  const date =
                    new Date(
                      `${rawDate}T00:00:00`
                    );


                  if (
                    !Number.isNaN(
                      date.getTime()
                    )
                  ) {

                    formattedDate =
                      date.toLocaleDateString(
                        "en-PH",
                        {
                          month: "short",
                          day: "numeric"
                        }
                      );

                  }

                }


                return {

                  date:
                    formattedDate,

                  orders:
                    Number(
                      item.orders ??
                      item.order_count ??
                      item.total_orders ??
                      0
                    ),

                  revenue:
                    Number(
                      item.revenue ??
                      item.total_revenue ??
                      0
                    )

                };

              })
            : [];


        // =================================================
        // UPDATE STATE
        // =================================================

        if (isMounted) {

          setAnalytics({

            totalOrders,

            totalRevenue,

            todayOrders,

            todayRevenue,

            pendingOrders,

            confirmedOrders,

            preparingOrders,

            outForDeliveryOrders,

            completedOrders

          });


          setChartData(
            formattedDailyData
          );


          setAnalyticsError("");

          setLoading(false);

        }


      } catch (error) {

        console.error(
          "Analytics error:",
          error
        );


        if (isMounted) {

          setAnalyticsError(
            error.message ||
            "Unable to load analytics."
          );


          setLoading(false);

        }

      }

    };


    // =====================================================
    // FIRST LOAD
    // =====================================================

    fetchAnalytics();


    // =====================================================
    // REFRESH EVERY 5 SECONDS
    // =====================================================

    const interval =
      setInterval(
        fetchAnalytics,
        5000
      );


    return () => {

      isMounted = false;

      clearInterval(interval);

    };

  }, []);


  // =====================================================
  // ORDER STATUS DATA
  // =====================================================

  const orderStatusData = [

    {
      name: "Pending",
      value: analytics.pendingOrders,
      color: "#9b8060"
    },

    {
      name: "Confirmed",
      value: analytics.confirmedOrders,
      color: "#b79b70"
    },

    {
      name: "Preparing",
      value: analytics.preparingOrders,
      color: "#c9a46c"
    },

    {
      name: "Out for Delivery",
      value:
        analytics.outForDeliveryOrders,
      color: "#dfc38e"
    },

    {
      name: "Completed",
      value: analytics.completedOrders,
      color: "#8f7350"
    }

  ].filter(
    (item) =>
      Number(item.value) > 0
  );


  // =====================================================
  // CURRENCY FORMAT
  // =====================================================

  const formatCurrency = (value) => {

    return `₱${Number(
      value || 0
    ).toLocaleString(
      "en-PH",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }
    )}`;

  };


  // =====================================================
  // TOOLTIP
  // =====================================================

  const RevenueTooltip = ({
    active,
    payload,
    label
  }) => {

    if (
      !active ||
      !payload ||
      !payload.length
    ) {

      return null;

    }


    return (

      <div className="admin-custom-tooltip">

        <span className="tooltip-date">
          {label}
        </span>

        <strong>
          {formatCurrency(
            payload[0].value
          )}
        </strong>

      </div>

    );

  };


  const OrdersTooltip = ({
    active,
    payload,
    label
  }) => {

    if (
      !active ||
      !payload ||
      !payload.length
    ) {

      return null;

    }


    return (

      <div className="admin-custom-tooltip">

        <span className="tooltip-date">
          {label}
        </span>

        <strong>
          {payload[0].value} orders
        </strong>

      </div>

    );

  };


  // =====================================================
  // RETURN
  // =====================================================

  return (

    <div className="admin-layout">


      {/* =================================================
          ADMIN NAVBAR
      ================================================= */}

      <AdminNavbar />


      {/* =================================================
          ADMIN CONTENT
      ================================================= */}

      <main className="admin-main">

        <section className="admin-page">

          <div className="admin-container">


            {/* =================================================
                HEADER
            ================================================= */}

            <div className="admin-header">

              <div>

                <span className="admin-eyebrow">
                  BAKEDROP ADMIN
                </span>

                <h1>
                  Admin <em>dashboard.</em>
                </h1>

                <p>
                  View your store's analytics.
                </p>

              </div>

            </div>


            {/* =================================================
                ANALYTICS
            ================================================= */}

            <div className="admin-section">

              <div className="admin-section-header">

                <div>

                  <span className="admin-label">
                    OVERVIEW
                  </span>

                  <h2>
                    Analytics
                  </h2>

                </div>

              </div>


              {analyticsError && (

                <div className="admin-error">

                  Analytics error:{" "}

                  {analyticsError}

                </div>

              )}


              <div className="analytics-grid">


                {/* TOTAL ORDERS */}

                <div className="analytics-card">

                  <span>
                    Total Orders
                  </span>

                  <strong>

                    {loading
                      ? "..."
                      : analytics.totalOrders}

                  </strong>

                  <small>
                    All active orders
                  </small>

                </div>


                {/* TOTAL REVENUE */}

                <div className="analytics-card">

                  <span>
                    Total Revenue
                  </span>

                  <strong>

                    {loading
                      ? "..."
                      : formatCurrency(
                          analytics.totalRevenue
                        )}

                  </strong>

                  <small>
                    Paid orders
                  </small>

                </div>


                {/* TODAY'S ORDERS */}

                <div className="analytics-card">

                  <span>
                    Today's Orders
                  </span>

                  <strong>

                    {loading
                      ? "..."
                      : analytics.todayOrders}

                  </strong>

                  <small>
                    Orders placed today
                  </small>

                </div>


                {/* TODAY'S REVENUE */}

                <div className="analytics-card">

                  <span>
                    Today's Revenue
                  </span>

                  <strong>

                    {loading
                      ? "..."
                      : formatCurrency(
                          analytics.todayRevenue
                        )}

                  </strong>

                  <small>
                    Paid orders today
                  </small>

                </div>


              </div>

            </div>



            {/* =================================================
                ANALYTICS GRAPHS
            ================================================= */}

            <div className="admin-section">

              <div className="admin-section-header">

                <div>

                  <span className="admin-label">
                    PERFORMANCE
                  </span>

                  <h2>
                    Store <em>analytics.</em>
                  </h2>

                </div>

              </div>


              <div className="admin-charts-grid">


                {/* =================================================
                    REVENUE LINE GRAPH
                ================================================= */}

                <div className="admin-chart-card">

                  <div className="admin-chart-header">

                    <div>

                      <span className="admin-chart-label">
                        REVENUE
                      </span>

                      <h3>
                        Revenue Trend
                      </h3>

                    </div>

                  </div>


                  <div className="admin-chart">

                    {chartData.length === 0 ? (

                      <div className="admin-chart-empty">

                        No revenue data available yet.

                      </div>

                    ) : (

                      <ResponsiveContainer
                        width="100%"
                        height="100%"
                      >

                        <LineChart
                          data={chartData}
                          margin={{
                            top: 10,
                            right: 20,
                            left: 10,
                            bottom: 5
                          }}
                        >

                          <CartesianGrid
                            strokeDasharray="3 3"
                            className="chart-grid"
                          />

                          <XAxis
                            dataKey="date"
                            tick={{
                              fontSize: 11
                            }}
                            tickLine={false}
                            axisLine={false}
                          />

                          <YAxis
                            tick={{
                              fontSize: 11
                            }}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) =>
                              `₱${Number(
                                value
                              ).toLocaleString()}`
                            }
                          />

                          <Tooltip
                            content={
                              <RevenueTooltip />
                            }
                          />

                          <Line
                            type="monotone"
                            dataKey="revenue"
                            name="Revenue"
                            stroke="#c9a46c"
                            strokeWidth={3}
                            dot={{
                              r: 4,
                              fill: "#c9a46c"
                            }}
                            activeDot={{
                              r: 6
                            }}
                          />

                        </LineChart>

                      </ResponsiveContainer>

                    )}

                  </div>

                </div>



                {/* =================================================
                    ORDERS LINE GRAPH
                ================================================= */}

                <div className="admin-chart-card">

                  <div className="admin-chart-header">

                    <div>

                      <span className="admin-chart-label">
                        ORDERS
                      </span>

                      <h3>
                        Order Trend
                      </h3>

                    </div>

                  </div>


                  <div className="admin-chart">

                    {chartData.length === 0 ? (

                      <div className="admin-chart-empty">

                        No order data available yet.

                      </div>

                    ) : (

                      <ResponsiveContainer
                        width="100%"
                        height="100%"
                      >

                        <LineChart
                          data={chartData}
                          margin={{
                            top: 10,
                            right: 20,
                            left: 10,
                            bottom: 5
                          }}
                        >

                          <CartesianGrid
                            strokeDasharray="3 3"
                            className="chart-grid"
                          />

                          <XAxis
                            dataKey="date"
                            tick={{
                              fontSize: 11
                            }}
                            tickLine={false}
                            axisLine={false}
                          />

                          <YAxis
                            allowDecimals={false}
                            tick={{
                              fontSize: 11
                            }}
                            tickLine={false}
                            axisLine={false}
                          />

                          <Tooltip
                            content={
                              <OrdersTooltip />
                            }
                          />

                          <Line
                            type="monotone"
                            dataKey="orders"
                            name="Orders"
                            stroke="#dfc38e"
                            strokeWidth={3}
                            dot={{
                              r: 4,
                              fill: "#dfc38e"
                            }}
                            activeDot={{
                              r: 6
                            }}
                          />

                        </LineChart>

                      </ResponsiveContainer>

                    )}

                  </div>

                </div>



                {/* =================================================
                    ORDER STATUS PIE GRAPH
                ================================================= */}

                <div className="admin-chart-card">

                  <div className="admin-chart-header">

                    <div>

                      <span className="admin-chart-label">
                        ORDER STATUS
                      </span>

                      <h3>
                        Current Orders
                      </h3>

                    </div>

                  </div>


                  <div className="admin-chart pie-chart-wrapper">

                    {orderStatusData.length === 0 ? (

                      <div className="admin-chart-empty">

                        No active orders yet.

                      </div>

                    ) : (

                      <ResponsiveContainer
                        width="100%"
                        height="100%"
                      >

                        <PieChart>

                          <Pie
                            data={orderStatusData}
                            cx="50%"
                            cy="45%"
                            innerRadius={65}
                            outerRadius={105}
                            paddingAngle={3}
                            dataKey="value"
                            nameKey="name"
                          >

                            {orderStatusData.map(
                              (entry) => (

                                <Cell
                                  key={entry.name}
                                  fill={entry.color}
                                  stroke="#111111"
                                  strokeWidth={2}
                                />

                              )
                            )}

                          </Pie>


                          <Tooltip />


                          <Legend
                            verticalAlign="bottom"
                            height={42}
                            iconType="circle"
                          />

                        </PieChart>

                      </ResponsiveContainer>

                    )}

                  </div>

                </div>



                {/* =================================================
                    DAILY ORDERS BAR GRAPH
                ================================================= */}

                <div className="admin-chart-card">

                  <div className="admin-chart-header">

                    <div>

                      <span className="admin-chart-label">
                        DAILY ACTIVITY
                      </span>

                      <h3>
                        Orders Per Day
                      </h3>

                    </div>

                  </div>


                  <div className="admin-chart">

                    {chartData.length === 0 ? (

                      <div className="admin-chart-empty">

                        No daily order data available yet.

                      </div>

                    ) : (

                      <ResponsiveContainer
                        width="100%"
                        height="100%"
                      >

                        <BarChart
                          data={chartData}
                          margin={{
                            top: 10,
                            right: 20,
                            left: 10,
                            bottom: 5
                          }}
                        >

                          <CartesianGrid
                            strokeDasharray="3 3"
                            className="chart-grid"
                          />

                          <XAxis
                            dataKey="date"
                            tick={{
                              fontSize: 11
                            }}
                            tickLine={false}
                            axisLine={false}
                          />

                          <YAxis
                            allowDecimals={false}
                            tick={{
                              fontSize: 11
                            }}
                            tickLine={false}
                            axisLine={false}
                          />

                          <Tooltip />


                          <Bar
                            dataKey="orders"
                            name="Orders"
                            fill="#c9a46c"
                            radius={[
                              6,
                              6,
                              0,
                              0
                            ]}
                          />

                        </BarChart>

                      </ResponsiveContainer>

                    )}

                  </div>

                </div>


              </div>

            </div>



            {/* =================================================
                ORDER SUMMARY
            ================================================= */}

            <div className="admin-section">

              <div className="admin-section-header">

                <div>

                  <span className="admin-label">
                    ORDERS
                  </span>

                  <h2>
                    Order Summary
                  </h2>

                </div>

              </div>


              <div className="order-summary-grid">


                {/* PENDING */}

                <div className="order-status-card">

                  <span>
                    Pending
                  </span>

                  <strong>

                    {loading
                      ? "..."
                      : analytics.pendingOrders}

                  </strong>

                </div>


                {/* CONFIRMED */}

                <div className="order-status-card">

                  <span>
                    Confirmed
                  </span>

                  <strong>

                    {loading
                      ? "..."
                      : analytics.confirmedOrders}

                  </strong>

                </div>


                {/* PREPARING */}

                <div className="order-status-card">

                  <span>
                    Preparing
                  </span>

                  <strong>

                    {loading
                      ? "..."
                      : analytics.preparingOrders}

                  </strong>

                </div>


                {/* OUT FOR DELIVERY */}

                <div className="order-status-card">

                  <span>
                    Out for Delivery
                  </span>

                  <strong>

                    {loading
                      ? "..."
                      : analytics.outForDeliveryOrders}

                  </strong>

                </div>


                {/* COMPLETED */}

                <div className="order-status-card">

                  <span>
                    Completed
                  </span>

                  <strong>

                    {loading
                      ? "..."
                      : analytics.completedOrders}

                  </strong>

                </div>


              </div>

            </div>


          </div>

        </section>

      </main>


      {/* =================================================
          ADMIN FOOTER
      ================================================= */}

      <AdminFooter />

    </div>

  );

}


export default AdminDashboard;