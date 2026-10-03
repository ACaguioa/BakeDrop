const express = require("express");
const router = express.Router();

const db = require("../config/db");

const authenticateToken =
  require("../middleware/authMiddleware");

const adminOnly =
  require("../middleware/adminMiddleware");


// =====================================================
// GET ADMIN ANALYTICS
// GET /api/admin/analytics
// =====================================================

router.get(
  "/analytics",
  authenticateToken,
  adminOnly,
  async (req, res) => {

    try {

      // =================================================
      // MAIN ANALYTICS
      // =================================================

      const [
        analyticsRows
      ] = await db.query(
        `
        SELECT

          COUNT(
            CASE
              WHEN status <> 'cancelled'
              THEN 1
            END
          ) AS total_orders,


          COALESCE(
            SUM(
              CASE
                WHEN payment_status = 'paid'
                 AND status <> 'cancelled'
                THEN total_amount
                ELSE 0
              END
            ),
            0
          ) AS total_revenue,


          COUNT(
            CASE
              WHEN DATE(created_at) = CURDATE()
               AND status <> 'cancelled'
              THEN 1
            END
          ) AS today_orders,


          COALESCE(
            SUM(
              CASE
                WHEN DATE(created_at) = CURDATE()
                 AND payment_status = 'paid'
                 AND status <> 'cancelled'
                THEN total_amount
                ELSE 0
              END
            ),
            0
          ) AS today_revenue,


          COUNT(
            CASE
              WHEN status = 'pending'
              THEN 1
            END
          ) AS pending_orders,


          COUNT(
            CASE
              WHEN status = 'confirmed'
              THEN 1
            END
          ) AS confirmed_orders,


          COUNT(
            CASE
              WHEN status = 'preparing'
              THEN 1
            END
          ) AS preparing_orders,


          COUNT(
            CASE
              WHEN status = 'out_for_delivery'
              THEN 1
            END
          ) AS out_for_delivery_orders,


          COUNT(
            CASE
              WHEN status = 'completed'
              THEN 1
            END
          ) AS completed_orders


        FROM orders
        `
      );


      const analyticsRow =
        analyticsRows[0] || {};


      // =================================================
      // LAST 7 DAYS ANALYTICS
      //
      // Includes:
      // - Order count
      // - Revenue
      //
      // Cancelled orders are excluded.
      // Revenue only counts paid orders.
      // =================================================

      const [
        dailyRows
      ] = await db.query(
        `
        SELECT

          DATE(created_at) AS order_date,


          COUNT(
            CASE
              WHEN status <> 'cancelled'
              THEN 1
            END
          ) AS order_count,


          COALESCE(
            SUM(
              CASE
                WHEN payment_status = 'paid'
                 AND status <> 'cancelled'
                THEN total_amount
                ELSE 0
              END
            ),
            0
          ) AS revenue


        FROM orders


        WHERE DATE(created_at)
          BETWEEN
            DATE_SUB(
              CURDATE(),
              INTERVAL 6 DAY
            )
            AND CURDATE()


        GROUP BY
          DATE(created_at)


        ORDER BY
          DATE(created_at) ASC
        `
      );


      // =================================================
      // CREATE MAP OF EXISTING DAILY DATA
      // =================================================

      const dailyMap =
        new Map();


      dailyRows.forEach(
        (row) => {

          const date =
            formatDatabaseDate(
              row.order_date
            );


          dailyMap.set(
            date,
            {

              orders:
                Number(
                  row.order_count ||
                  0
                ),

              revenue:
                Number(
                  row.revenue ||
                  0
                )

            }
          );

        }
      );


      // =================================================
      // CREATE COMPLETE 7-DAY DATASET
      //
      // Even if there were zero orders on a day,
      // that day will still appear on the graph.
      // =================================================

      const daily = [];


      for (
        let i = 6;
        i >= 0;
        i--
      ) {

        const date =
          new Date();


        date.setHours(
          12,
          0,
          0,
          0
        );


        date.setDate(
          date.getDate() - i
        );


        const year =
          date.getFullYear();


        const month =
          String(
            date.getMonth() + 1
          ).padStart(
            2,
            "0"
          );


        const day =
          String(
            date.getDate()
          ).padStart(
            2,
            "0"
          );


        const dateString =
          `${year}-${month}-${day}`;


        const existing =
          dailyMap.get(
            dateString
          );


        daily.push({

          date:
            dateString,

          orders:
            existing
              ? existing.orders
              : 0,

          revenue:
            existing
              ? existing.revenue
              : 0

        });

      }


      // =================================================
      // ANALYTICS OBJECT
      // =================================================

      const analytics = {

        totalOrders:
          Number(
            analyticsRow.total_orders ||
            0
          ),


        totalRevenue:
          Number(
            analyticsRow.total_revenue ||
            0
          ),


        todayOrders:
          Number(
            analyticsRow.today_orders ||
            0
          ),


        todayRevenue:
          Number(
            analyticsRow.today_revenue ||
            0
          ),


        pendingOrders:
          Number(
            analyticsRow.pending_orders ||
            0
          ),


        confirmedOrders:
          Number(
            analyticsRow.confirmed_orders ||
            0
          ),


        preparingOrders:
          Number(
            analyticsRow.preparing_orders ||
            0
          ),


        outForDeliveryOrders:
          Number(
            analyticsRow.out_for_delivery_orders ||
            0
          ),


        completedOrders:
          Number(
            analyticsRow.completed_orders ||
            0
          ),


        // ===============================================
        // GRAPH DATA
        // ===============================================

        daily

      };


      // =================================================
      // DEBUG
      // =================================================

      console.log(
        "================================="
      );

      console.log(
        "ADMIN ANALYTICS:"
      );

      console.log(
        analytics
      );

      console.log(
        "DAILY ANALYTICS:"
      );

      console.log(
        daily
      );

      console.log(
        "================================="
      );


      // =================================================
      // RESPONSE
      // =================================================

      return res.json({

        success: true,

        analytics

      });


    } catch (error) {

      console.error(
        "ADMIN ANALYTICS ERROR:",
        error
      );


      return res.status(500).json({

        success: false,

        message:
          "Failed to load admin analytics.",

        error:
          error.message

      });

    }

  }
);


// =====================================================
// HELPER
// FORMAT DATABASE DATE
// =====================================================

function formatDatabaseDate(value) {

  if (!value) {
    return null;
  }


  // MySQL DATE values are normally returned
  // as YYYY-MM-DD strings.
  if (
    typeof value === "string"
  ) {

    return value.slice(
      0,
      10
    );

  }


  const date =
    new Date(value);


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return null;

  }


  const year =
    date.getFullYear();


  const month =
    String(
      date.getMonth() + 1
    ).padStart(
      2,
      "0"
    );


  const day =
    String(
      date.getDate()
    ).padStart(
      2,
      "0"
    );


  return `${year}-${month}-${day}`;

}


// =====================================================
// GET ALL PRODUCTS
// GET /api/admin/products
// =====================================================

router.get(
  "/products",
  authenticateToken,
  adminOnly,
  async (req, res) => {

    try {

      const [products] =
        await db.query(
          `
          SELECT

            p.id,

            p.name,

            p.price,

            p.daily_order_limit,

            p.is_available,

            p.image,


            COALESCE(
              (
                SELECT SUM(
                  oi.quantity
                )

                FROM order_items oi

                INNER JOIN orders o
                  ON o.id = oi.order_id

                WHERE oi.product_id = p.id

                  AND DATE(
                    oi.created_at
                  ) = CURDATE()

                  AND o.status <> 'cancelled'
              ),
              0
            ) AS ordered_today


          FROM products p

          ORDER BY p.name ASC
          `
        );


      const formattedProducts =
        products.map(
          (product) => {

            const dailyLimit =
              Number(
                product.daily_order_limit
              );

            const orderedToday =
              Number(
                product.ordered_today
              );


            return {

              ...product,

              price:
                Number(
                  product.price
                ),

              daily_order_limit:
                dailyLimit,

              is_available:
                Boolean(
                  product.is_available
                ),

              ordered_today:
                orderedToday,

              remaining_today:
                dailyLimit > 0
                  ? Math.max(
                      dailyLimit -
                        orderedToday,
                      0
                    )
                  : null,

              daily_limit_reached:
                dailyLimit > 0 &&
                orderedToday >=
                  dailyLimit

            };

          }
        );


      return res.json({

        success: true,

        products:
          formattedProducts

      });


    } catch (error) {

      console.error(
        "Admin products error:",
        error
      );


      return res.status(500).json({

        success: false,

        message:
          "Failed to load products."

      });

    }

  }
);


// =====================================================
// UPDATE PRODUCT
// PUT /api/admin/products/:id
// =====================================================

router.put(
  "/products/:id",
  authenticateToken,
  adminOnly,
  async (req, res) => {

    try {

      const {
        id
      } = req.params;


      const {
        price,
        is_available,
        daily_order_limit
      } = req.body;


      if (
        price === undefined ||
        price === null ||
        !Number.isFinite(
          Number(price)
        ) ||
        Number(price) < 0
      ) {

        return res.status(400).json({

          success: false,

          message:
            "A valid price is required."

        });

      }


      if (
        daily_order_limit ===
          undefined ||
        daily_order_limit ===
          null ||
        !Number.isInteger(
          Number(
            daily_order_limit
          )
        ) ||
        Number(
          daily_order_limit
        ) < 0
      ) {

        return res.status(400).json({

          success: false,

          message:
            "A valid daily order limit is required."

        });

      }


      await db.query(
        `
        UPDATE products

        SET

          price = ?,

          is_available = ?,

          daily_order_limit = ?

        WHERE id = ?
        `,
        [

          Number(price),

          is_available
            ? 1
            : 0,

          Number(
            daily_order_limit
          ),

          id

        ]
      );


      const [
        updatedProduct
      ] = await db.query(
        `
        SELECT

          id,

          name,

          price,

          daily_order_limit,

          is_available,

          image

        FROM products

        WHERE id = ?

        LIMIT 1
        `,
        [id]
      );


      if (
        updatedProduct.length ===
        0
      ) {

        return res.status(404).json({

          success: false,

          message:
            "Product not found."

        });

      }


      return res.json({

        success: true,

        message:
          "Product updated successfully.",

        product: {

          ...updatedProduct[0],

          price:
            Number(
              updatedProduct[0]
                .price
            ),

          daily_order_limit:
            Number(
              updatedProduct[0]
                .daily_order_limit
            ),

          is_available:
            Boolean(
              updatedProduct[0]
                .is_available
            )

        }

      });


    } catch (error) {

      console.error(
        "Update product error:",
        error
      );


      return res.status(500).json({

        success: false,

        message:
          "Failed to update product."

      });

    }

  }
);


// =====================================================
// GET DAILY ORDER LIMIT
// GET /api/admin/order-limit
// =====================================================

router.get(
  "/order-limit",
  authenticateToken,
  adminOnly,
  async (req, res) => {

    try {

      const [
        rows
      ] = await db.query(
        `
        SELECT
          daily_limit

        FROM order_limit_settings

        WHERE id = 1

        LIMIT 1
        `
      );


      if (
        rows.length === 0
      ) {

        return res.status(404).json({

          success: false,

          message:
            "Order limit setting not found."

        });

      }


      return res.json({

        success: true,

        dailyLimit:
          Number(
            rows[0].daily_limit
          )

      });


    } catch (error) {

      console.error(
        "Get order limit error:",
        error
      );


      return res.status(500).json({

        success: false,

        message:
          "Failed to load daily order limit."

      });

    }

  }
);


// =====================================================
// UPDATE DAILY ORDER LIMIT
// PUT /api/admin/order-limit
// =====================================================

router.put(
  "/order-limit",
  authenticateToken,
  adminOnly,
  async (req, res) => {

    try {

      const {
        dailyLimit
      } = req.body;


      if (
        dailyLimit ===
          undefined ||
        dailyLimit ===
          null ||
        !Number.isInteger(
          Number(dailyLimit)
        ) ||
        Number(dailyLimit) < 1
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Daily order limit must be a whole number greater than 0."

        });

      }


      await db.query(
        `
        UPDATE order_limit_settings

        SET
          daily_limit = ?

        WHERE id = 1
        `,
        [
          Number(dailyLimit)
        ]
      );


      return res.json({

        success: true,

        message:
          "Daily order limit updated successfully.",

        dailyLimit:
          Number(dailyLimit)

      });


    } catch (error) {

      console.error(
        "Update order limit error:",
        error
      );


      return res.status(500).json({

        success: false,

        message:
          "Failed to update daily order limit."

      });

    }

  }
);


// =====================================================
// SCHEDULE CAPACITY
// =====================================================


// =====================================================
// GET SCHEDULE CAPACITY
// GET /api/admin/schedule?date=2026-10-05
// =====================================================

router.get(
  "/schedule",
  authenticateToken,
  adminOnly,
  async (req, res) => {

    try {

      const {
        date
      } = req.query;


      if (!date) {

        return res.status(400).json({

          success: false,

          message:
            "Schedule date is required."

        });

      }


      const [
        scheduleRows
      ] = await db.query(
        `
        SELECT

          id,

          DATE_FORMAT(
            schedule_date,
            '%Y-%m-%d'
          ) AS schedule_date,

          maximum_orders,

          is_disabled

        FROM schedule_capacity

        WHERE schedule_date = ?

        LIMIT 1
        `,
        [date]
      );


      const [
        orderRows
      ] = await db.query(
        `
        SELECT
          COUNT(*) AS reserved_orders

        FROM orders

        WHERE DATE(order_date) = ?

          AND status <> 'cancelled'
        `,
        [date]
      );


      const reservedOrders =
        Number(
          orderRows[0]
            ?.reserved_orders ||
            0
        );


      if (
        scheduleRows.length ===
        0
      ) {

        return res.json({

          success: true,

          schedule: {

            id: null,

            schedule_date:
              date,

            maximum_orders:
              30,

            reserved_orders:
              reservedOrders,

            remaining_slots:
              Math.max(
                30 -
                  reservedOrders,
                0
              ),

            is_disabled:
              false

          }

        });

      }


      const schedule =
        scheduleRows[0];


      const maximumOrders =
        Number(
          schedule.maximum_orders
        );


      return res.json({

        success: true,

        schedule: {

          id:
            schedule.id,

          schedule_date:
            schedule.schedule_date,

          maximum_orders:
            maximumOrders,

          reserved_orders:
            reservedOrders,

          remaining_slots:
            maximumOrders > 0
              ? Math.max(
                  maximumOrders -
                    reservedOrders,
                  0
                )
              : 0,

          is_disabled:
            Boolean(
              schedule.is_disabled
            )

        }

      });


    } catch (error) {

      console.error(
        "GET SCHEDULE CAPACITY ERROR:",
        error
      );


      return res.status(500).json({

        success: false,

        message:
          "Failed to load schedule capacity."

      });

    }

  }
);


// =====================================================
// CREATE / UPDATE SCHEDULE CAPACITY
// PUT /api/admin/schedule
// =====================================================

router.put(
  "/schedule",
  authenticateToken,
  adminOnly,
  async (req, res) => {

    try {

      const {
        scheduleDate,
        maximumOrders,
        isDisabled
      } = req.body;


      if (!scheduleDate) {

        return res.status(400).json({

          success: false,

          message:
            "Schedule date is required."

        });

      }


      const limit =
        Number(
          maximumOrders
        );


      if (
        !Number.isInteger(limit) ||
        limit < 1
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Maximum orders must be a whole number greater than 0."

        });

      }


      const disabled =
        Boolean(
          isDisabled
        );


      await db.query(
        `
        INSERT INTO schedule_capacity
        (
          schedule_date,
          maximum_orders,
          is_disabled
        )

        VALUES (?, ?, ?)

        ON DUPLICATE KEY UPDATE

          maximum_orders =
            VALUES(maximum_orders),

          is_disabled =
            VALUES(is_disabled)
        `,
        [
          scheduleDate,
          limit,
          disabled
        ]
      );


      const [
        rows
      ] = await db.query(
        `
        SELECT

          id,

          DATE_FORMAT(
            schedule_date,
            '%Y-%m-%d'
          ) AS schedule_date,

          maximum_orders,

          is_disabled

        FROM schedule_capacity

        WHERE schedule_date = ?

        LIMIT 1
        `,
        [scheduleDate]
      );


      return res.json({

        success: true,

        message:
          "Schedule capacity updated successfully.",

        schedule: {

          ...rows[0],

          maximum_orders:
            Number(
              rows[0]
                .maximum_orders
            ),

          is_disabled:
            Boolean(
              rows[0]
                .is_disabled
            )

        }

      });


    } catch (error) {

      console.error(
        "UPDATE SCHEDULE CAPACITY ERROR:",
        error
      );


      return res.status(500).json({

        success: false,

        message:
          "Failed to update schedule capacity."

      });

    }

  }
);


// =====================================================
// PRODUCT SCHEDULE CAPACITY
// =====================================================


// =====================================================
// GET PRODUCT CAPACITIES
// GET /api/admin/schedule/products?date=2026-10-05
// =====================================================

router.get(
  "/schedule/products",
  authenticateToken,
  adminOnly,
  async (req, res) => {

    try {

      const {
        date
      } = req.query;


      if (!date) {

        return res.status(400).json({

          success: false,

          message:
            "Schedule date is required."

        });

      }


      const [
        products
      ] = await db.query(
        `
        SELECT

          p.id,

          p.name,

          p.price,

          p.is_available,

          COALESCE(
            psc.maximum_quantity,
            0
          ) AS maximum_quantity,

          COALESCE(
            psc.is_disabled,
            0
          ) AS is_disabled,


          COALESCE(
            (
              SELECT SUM(
                oi.quantity
              )

              FROM order_items oi

              INNER JOIN orders o
                ON o.id =
                  oi.order_id

              WHERE
                oi.product_id =
                  p.id

                AND DATE(
                  o.order_date
                ) = ?

                AND o.status <>
                  'cancelled'
            ),
            0
          ) AS reserved_quantity


        FROM products p


        LEFT JOIN
          product_schedule_capacity psc

          ON psc.product_id =
              p.id

          AND psc.schedule_date =
              ?


        ORDER BY
          p.name ASC
        `,
        [
          date,
          date
        ]
      );


      const formattedProducts =
        products.map(
          (product) => {

            const maximumQuantity =
              Number(
                product.maximum_quantity
              );

            const reservedQuantity =
              Number(
                product.reserved_quantity
              );


            return {

              id:
                product.id,

              name:
                product.name,

              price:
                Number(
                  product.price
                ),

              is_available:
                Boolean(
                  product.is_available
                ),

              maximum_quantity:
                maximumQuantity,

              reserved_quantity:
                reservedQuantity,

              remaining_quantity:
                maximumQuantity > 0
                  ? Math.max(
                      maximumQuantity -
                        reservedQuantity,
                      0
                    )
                  : null,

              is_disabled:
                Boolean(
                  product.is_disabled
                ),

              is_full:
                maximumQuantity > 0 &&
                reservedQuantity >=
                  maximumQuantity

            };

          }
        );


      return res.json({

        success: true,

        scheduleDate:
          date,

        products:
          formattedProducts

      });


    } catch (error) {

      console.error(
        "GET PRODUCT SCHEDULE CAPACITY ERROR:",
        error
      );


      return res.status(500).json({

        success: false,

        message:
          "Failed to load product schedule capacity."

      });

    }

  }
);


// =====================================================
// CREATE / UPDATE PRODUCT CAPACITY
// PUT /api/admin/schedule/products
// =====================================================

router.put(
  "/schedule/products",
  authenticateToken,
  adminOnly,
  async (req, res) => {

    try {

      const {
        productId,
        scheduleDate,
        maximumQuantity,
        isDisabled
      } = req.body;


      const id =
        Number(
          productId
        );


      const limit =
        Number(
          maximumQuantity
        );


      if (
        !Number.isInteger(id) ||
        id <= 0
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Invalid product ID."

        });

      }


      if (!scheduleDate) {

        return res.status(400).json({

          success: false,

          message:
            "Schedule date is required."

        });

      }


      if (
        !Number.isInteger(limit) ||
        limit < 0
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Maximum quantity must be a whole number greater than or equal to 0."

        });

      }


      const [
        productRows
      ] = await db.query(
        `
        SELECT

          id,

          name

        FROM products

        WHERE id = ?

        LIMIT 1
        `,
        [id]
      );


      if (
        productRows.length ===
        0
      ) {

        return res.status(404).json({

          success: false,

          message:
            "Product not found."

        });

      }


      await db.query(
        `
        INSERT INTO product_schedule_capacity
        (
          product_id,
          schedule_date,
          maximum_quantity,
          is_disabled
        )

        VALUES (?, ?, ?, ?)

        ON DUPLICATE KEY UPDATE

          maximum_quantity =
            VALUES(maximum_quantity),

          is_disabled =
            VALUES(is_disabled)
        `,
        [
          id,
          scheduleDate,
          limit,
          Boolean(
            isDisabled
          )
        ]
      );


      return res.json({

        success: true,

        message:
          "Product schedule capacity updated successfully."

      });


    } catch (error) {

      console.error(
        "UPDATE PRODUCT SCHEDULE CAPACITY ERROR:",
        error
      );


      return res.status(500).json({

        success: false,

        message:
          "Failed to update product schedule capacity."

      });

    }

  }
);


// =====================================================
// ADMIN ORDERS MANAGEMENT
// =====================================================

const allowedOrderStatuses = [

  "pending",

  "confirmed",

  "preparing",

  "ready",

  "out_for_delivery",

  "completed",

  "cancelled"

];


// =====================================================
// GET ALL ADMIN ORDERS
// GET /api/admin/orders
//
// Optional:
// ?date=2026-10-05
// ?status=pending
// =====================================================

router.get(
  "/orders",
  authenticateToken,
  adminOnly,
  async (req, res) => {

    try {

      const {
        date,
        status
      } = req.query;


      let query = `
        SELECT

          o.id,

          o.order_number,

          o.user_id,

          o.order_type,


          DATE_FORMAT(
            o.order_date,
            '%Y-%m-%d'
          ) AS order_date,


          o.order_time,

          o.delivery_address,

          o.delivery_latitude,

          o.delivery_longitude,

          o.delivery_distance_km,

          o.subtotal,

          o.delivery_fee,

          o.total_amount,

          o.status,

          o.payment_status,

          o.payment_method,

          o.paymongo_checkout_session_id,

          o.notes,

          o.created_at,

          o.updated_at,


          CONCAT(
            COALESCE(
              u.first_name,
              ''
            ),
            ' ',
            COALESCE(
              u.last_name,
              ''
            )
          ) AS customer_name,


          u.email AS email,


          (
            SELECT COUNT(*)

            FROM order_items oi

            WHERE oi.order_id =
              o.id

          ) AS item_count


        FROM orders o


        LEFT JOIN users u
          ON u.id =
            o.user_id


        WHERE 1 = 1
      `;


      const params = [];


      // ===============================================
      // FILTER BY SCHEDULE DATE
      // ===============================================

      if (date) {

        query += `
          AND DATE(
            o.order_date
          ) = ?
        `;

        params.push(
          date
        );

      }


      // ===============================================
      // FILTER BY STATUS
      // ===============================================

      if (status) {

        if (
          !allowedOrderStatuses.includes(
            status
          )
        ) {

          return res.status(400).json({

            success: false,

            message:
              "Invalid order status."

          });

        }


        query += `
          AND o.status = ?
        `;

        params.push(
          status
        );

      }


      // ===============================================
      // EARLIEST SCHEDULE FIRST
      // ===============================================

      query += `
        ORDER BY

          o.order_date ASC,

          o.order_time ASC,

          o.created_at ASC
      `;


      const [
        orders
      ] = await db.query(
        query,
        params
      );


      const formattedOrders =
        orders.map(
          (order) => ({

            ...order,

            total_amount:
              Number(
                order.total_amount
              ),

            subtotal:
              Number(
                order.subtotal
              ),

            delivery_fee:
              Number(
                order.delivery_fee
              ),

            item_count:
              Number(
                order.item_count
              ),

            customer_name:
              order.customer_name
                ?.trim() ||
              "BakeDrop Customer"

          })
        );


      return res.json({

        success: true,

        orders:
          formattedOrders

      });


    } catch (error) {

      console.error(
        "ADMIN ORDERS ERROR:",
        error
      );


      return res.status(500).json({

        success: false,

        message:
          "Failed to load admin orders."

      });

    }

  }
);


// =====================================================
// GET SINGLE ORDER DETAILS
// GET /api/admin/orders/:id
// =====================================================

router.get(
  "/orders/:id",
  authenticateToken,
  adminOnly,
  async (req, res) => {

    try {

      const orderId =
        Number(
          req.params.id
        );


      if (
        !Number.isInteger(
          orderId
        ) ||
        orderId <= 0
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Invalid order ID."

        });

      }


      // ===============================================
      // ORDER
      // ===============================================

      const [
        orderRows
      ] = await db.query(
        `
        SELECT

          o.id,

          o.order_number,

          o.user_id,

          o.order_type,


          DATE_FORMAT(
            o.order_date,
            '%Y-%m-%d'
          ) AS order_date,


          o.order_time,

          o.delivery_address,

          o.delivery_latitude,

          o.delivery_longitude,

          o.delivery_distance_km,

          o.subtotal,

          o.delivery_fee,

          o.total_amount,

          o.status,

          o.payment_status,

          o.payment_method,

          o.paymongo_checkout_session_id,

          o.notes,

          o.created_at,

          o.updated_at,


          CONCAT(
            COALESCE(
              u.first_name,
              ''
            ),
            ' ',
            COALESCE(
              u.last_name,
              ''
            )
          ) AS customer_name,


          u.email AS email


        FROM orders o


        LEFT JOIN users u
          ON u.id =
            o.user_id


        WHERE o.id = ?

        LIMIT 1
        `,
        [orderId]
      );


      if (
        orderRows.length ===
        0
      ) {

        return res.status(404).json({

          success: false,

          message:
            "Order not found."

        });

      }


      const order =
        orderRows[0];


      // ===============================================
      // ORDER ITEMS
      // ===============================================

      const [
        items
      ] = await db.query(
        `
        SELECT

          id,

          order_id,

          product_id,

          flash_deal_id,

          product_name,

          quantity,

          unit_price,

          subtotal,

          customization,

          created_at

        FROM order_items

        WHERE order_id = ?

        ORDER BY id ASC
        `,
        [orderId]
      );


      const formattedItems =
        items.map(
          (item) => {

            let customization =
              item.customization;


            try {

              if (
                typeof customization ===
                  "string" &&
                customization.trim() !==
                  ""
              ) {

                customization =
                  JSON.parse(
                    customization
                  );

              }

            } catch (error) {

              // Keep original string

            }


            return {

              ...item,

              quantity:
                Number(
                  item.quantity
                ),

              unit_price:
                Number(
                  item.unit_price
                ),

              subtotal:
                Number(
                  item.subtotal
                ),

              flash_deal_id:
                item.flash_deal_id
                  ? Number(
                      item.flash_deal_id
                    )
                  : null,

              customization

            };

          }
        );


      return res.json({

        success: true,

        order: {

          ...order,

          customer_name:
            order.customer_name
              ?.trim() ||
            "BakeDrop Customer",

          subtotal:
            Number(
              order.subtotal
            ),

          delivery_fee:
            Number(
              order.delivery_fee
            ),

          total_amount:
            Number(
              order.total_amount
            ),

          items:
            formattedItems

        }

      });


    } catch (error) {

      console.error(
        "ADMIN ORDER DETAILS ERROR:",
        error
      );


      return res.status(500).json({

        success: false,

        message:
          "Failed to load order details."

      });

    }

  }
);

// =====================================================
// UPDATE PAYMENT STATUS
// PUT /api/admin/orders/:id/payment-status
// =====================================================

router.put(
  "/orders/:id/payment-status",
  authenticateToken,
  adminOnly,
  async (req, res) => {

    try {

      const orderId =
        Number(req.params.id);

      const {
        payment_status,
      } = req.body;


      // ===============================================
      // VALIDATE ORDER ID
      // ===============================================

      if (
        !orderId ||
        Number.isNaN(orderId)
      ) {

        return res.status(400).json({
          message:
            "Invalid order ID.",
        });

      }


      // ===============================================
      // VALIDATE PAYMENT STATUS
      // ===============================================

      const allowedStatuses = [
        "paid",
        "unpaid",
      ];

      if (
        !allowedStatuses.includes(
          payment_status
        )
      ) {

        return res.status(400).json({
          message:
            "Payment status must be paid or unpaid.",
        });

      }


      // ===============================================
      // CHECK ORDER
      // ===============================================

      const [orders] =
        await db.query(
          `
          SELECT
            id,
            payment_status
          FROM orders
          WHERE id = ?
          LIMIT 1
          `,
          [orderId]
        );


      if (
        !orders.length
      ) {

        return res.status(404).json({
          message:
            "Order not found.",
        });

      }


      // ===============================================
      // UPDATE PAYMENT STATUS
      // ===============================================

      await db.query(
        `
        UPDATE orders
        SET payment_status = ?
        WHERE id = ?
        `,
        [
          payment_status,
          orderId,
        ]
      );


      // ===============================================
      // RESPONSE
      // ===============================================

      return res.json({

        success: true,

        message:
          "Payment status updated successfully.",

        payment_status:
          payment_status,

      });

    } catch (error) {

      console.error(
        "UPDATE PAYMENT STATUS ERROR:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to update payment status.",
      });

    }

  }
);

// =====================================================
// UPDATE ORDER STATUS
// PUT /api/admin/orders/:id/status
// =====================================================

router.put(
  "/orders/:id/status",
  authenticateToken,
  adminOnly,
  async (req, res) => {

    const orderId =
      Number(
        req.params.id
      );

    const {
      status
    } = req.body;


    // ===============================================
    // VALIDATE ORDER ID
    // ===============================================

    if (
      !Number.isInteger(
        orderId
      ) ||
      orderId <= 0
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Invalid order ID."

      });

    }


    // ===============================================
    // VALIDATE STATUS
    // ===============================================

    if (
      !allowedOrderStatuses.includes(
        status
      )
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Invalid order status."

      });

    }


    let connection;


    try {

      // =============================================
      // CREATE TRANSACTION CONNECTION
      // =============================================

      connection =
        await db.getConnection();

      await connection.beginTransaction();


      // =============================================
      // GET CURRENT ORDER
      // LOCK ROW
      // =============================================

      const [
        existingOrders
      ] = await connection.query(
        `
        SELECT

          id,

          order_number,

          order_type,

          order_date,

          status,

          payment_status,

          payment_method

        FROM orders

        WHERE id = ?

        LIMIT 1

        FOR UPDATE
        `,
        [orderId]
      );


      if (
        existingOrders.length ===
        0
      ) {

        await connection.rollback();

        return res.status(404).json({

          success: false,

          message:
            "Order not found."

        });

      }


      const existingOrder =
        existingOrders[0];


      // =============================================
      // IDENTIFY CASH ORDER
      // =============================================

      const isCashOrder =
        existingOrder.payment_method ===
          "cash_on_pickup" ||
        existingOrder.payment_method ===
          "cash_on_delivery";


      // =============================================
      // UPDATE ORDER STATUS
      // =============================================

      await connection.query(
        `
        UPDATE orders

        SET
          status = ?

        WHERE id = ?
        `,
        [
          status,
          orderId
        ]
      );


      // =============================================
      // CASH ORDER COMPLETED
      // =============================================

      if (
        status === "completed" &&
        isCashOrder
      ) {

        await connection.query(
          `
          UPDATE orders

          SET
            payment_status = 'paid'

          WHERE id = ?
          `,
          [
            orderId
          ]
        );

      }


      // =============================================
      // CREATE FLASH DEALS
      //
      // ONLY:
      // - Cash order
      // - Previously unpaid
      // - Admin marks cancelled
      //
      // Customizable products are excluded.
      // =============================================

      let createdFlashDeals = [];


      if (
        status === "cancelled" &&
        isCashOrder &&
        existingOrder.payment_status ===
          "unpaid"
      ) {

        // ===========================================
        // GET ORDER ITEMS
        // ===========================================

        const [
          itemRows
        ] = await connection.query(
          `
          SELECT

            oi.product_id,

            oi.product_name,

            SUM(
              oi.quantity
            ) AS quantity,

            MAX(
              oi.unit_price
            ) AS original_price,

            MAX(
              p.customizable
            ) AS customizable

          FROM order_items oi

          INNER JOIN products p
            ON p.id =
              oi.product_id

          WHERE oi.order_id = ?

          GROUP BY

            oi.product_id,

            oi.product_name
          `,
          [
            orderId
          ]
        );


        // ===========================================
        // CREATE FLASH DEAL FOR EACH PRODUCT
        // ===========================================

        for (
          const item of itemRows
        ) {

          const isCustomCake =
            Boolean(
              item.customizable
            );


          // =========================================
          // CUSTOM CAKE / CUSTOMIZABLE PRODUCT
          // NEVER FLASH DEAL
          // =========================================

          if (
            isCustomCake
          ) {

            continue;

          }


          const quantity =
            Number(
              item.quantity
            );


          const originalPrice =
            Number(
              item.original_price
            );


          if (
            quantity <= 0 ||
            originalPrice <= 0
          ) {

            continue;

          }


          // =========================================
          // PREVENT DUPLICATE FLASH DEALS
          // =========================================

          const [
            existingDealRows
          ] = await connection.query(
            `
            SELECT

              id

            FROM flash_deals

            WHERE source_order_id = ?

              AND product_id = ?

              AND deal_date =
                CURDATE()

            LIMIT 1
            `,
            [
              orderId,

              Number(
                item.product_id
              )
            ]
          );


          if (
            existingDealRows.length >
            0
          ) {

            continue;

          }


          // =========================================
          // 50% OFF
          // =========================================

          const flashPrice =
            Number(
              (
                originalPrice *
                0.50
              ).toFixed(2)
            );


          // =========================================
          // INSERT FLASH DEAL
          // =========================================

          const [
            flashResult
          ] = await connection.query(
            `
            INSERT INTO flash_deals
            (
              source_order_id,

              product_id,

              product_name,

              quantity,

              original_price,

              discount_percent,

              flash_price,

              deal_date,

              is_available
            )

            VALUES
            (
              ?,

              ?,

              ?,

              ?,

              ?,

              ?,

              ?,

              CURDATE(),

              TRUE
            )
            `,
            [
              orderId,

              Number(
                item.product_id
              ),

              item.product_name,

              quantity,

              originalPrice,

              50.00,

              flashPrice
            ]
          );


          createdFlashDeals.push({

            id:
              flashResult.insertId,

            product_id:
              Number(
                item.product_id
              ),

            product_name:
              item.product_name,

            quantity,

            original_price:
              originalPrice,

            discount_percent:
              50,

            flash_price:
              flashPrice,

            deal_date:
              getCurrentDatabaseDateForResponse()

          });

        }

      }


      // =============================================
      // COMMIT TRANSACTION
      // =============================================

      await connection.commit();


      // =============================================
      // GET UPDATED ORDER
      // =============================================

      const [
        updatedOrders
      ] = await db.query(
        `
        SELECT

          id,

          order_number,

          DATE_FORMAT(
            order_date,
            '%Y-%m-%d'
          ) AS order_date,

          order_time,

          status,

          payment_status,

          payment_method,

          total_amount

        FROM orders

        WHERE id = ?

        LIMIT 1
        `,
        [
          orderId
        ]
      );


      const updatedOrder =
        updatedOrders[0];


      // =============================================
      // RESPONSE MESSAGE
      // =============================================

      let message =
        "Order status updated successfully.";


      if (
        status === "completed" &&
        isCashOrder
      ) {

        message =
          "Cash order completed and payment marked as paid.";

      }


      if (
        status === "cancelled" &&
        createdFlashDeals.length >
          0
      ) {

        message =
          "Order cancelled and Flash Deals created.";

      }


      if (
        status === "cancelled" &&
        isCashOrder &&
        existingOrder.payment_status ===
          "unpaid" &&
        createdFlashDeals.length ===
          0
      ) {

        message =
          "Order cancelled. No Flash Deal was created because the order contained only excluded products.";

      }


      return res.json({

        success: true,

        message,

        order: {

          ...updatedOrder,

          total_amount:
            Number(
              updatedOrder.total_amount
            )

        },

        flashDeals:
          createdFlashDeals

      });


    } catch (error) {

      if (
        connection
      ) {

        try {

          await connection.rollback();

        } catch (rollbackError) {

          console.error(
            "ROLLBACK ERROR:",
            rollbackError
          );

        }

      }


      console.error(
        "UPDATE ORDER STATUS ERROR:",
        error
      );


      return res.status(500).json({

        success: false,

        message:
          error.message ||
          "Failed to update order status."

      });


    } finally {

      if (
        connection
      ) {

        connection.release();

      }

    }

  }
);


// =====================================================
// HELPER
// Get current database date for JSON response
// =====================================================

function getCurrentDatabaseDateForResponse() {

  const now =
    new Date();


  const year =
    now.getFullYear();


  const month =
    String(
      now.getMonth() + 1
    ).padStart(
      2,
      "0"
    );


  const day =
    String(
      now.getDate()
    ).padStart(
      2,
      "0"
    );


  return `${year}-${month}-${day}`;

}


// =====================================================
// EXPORT ROUTER
// =====================================================

module.exports = router;