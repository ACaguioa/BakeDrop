const express = require("express");
const jwt = require("jsonwebtoken");

const router = express.Router();

/* =====================================================
   AUTHENTICATION
===================================================== */

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  const token =
    authHeader &&
    authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

  if (!token) {
    return res.status(401).json({
      message: "Authentication required.",
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token.",
    });
  }
}


/* =====================================================
   DIRECT CREATE ORDER DISABLED
===================================================== */

router.post(
  "/create",
  authenticateToken,
  async (req, res) => {
    return res.status(403).json({
      message:
        "Direct order creation is disabled. Please complete payment through PayMongo.",
    });
  }
);


/* =====================================================
   CREATE CASH ORDER
   POST /api/orders/create-cash
===================================================== */

router.post(
  "/create-cash",
  authenticateToken,
  async (req, res) => {
    const database = req.app.locals.db;

    let connection;

    try {
      const {
        paymentMethod,
        orderType,
        orderDate,
        orderTime,
        deliveryAddress,
        deliveryLatitude,
        deliveryLongitude,
        deliveryDistanceKm,
        deliveryFee,
        notes,
        items,
      } = req.body;


      // =================================================
      // VALIDATE PAYMENT METHOD
      // =================================================

      const allowedPaymentMethods = [
        "cash_on_pickup",
        "cash_on_delivery",
      ];

      if (
        !allowedPaymentMethods.includes(
          paymentMethod
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid cash payment method.",
        });
      }


      // =================================================
      // VALIDATE ORDER TYPE
      // =================================================

      if (
        !["pickup", "delivery"].includes(
          orderType
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid order type.",
        });
      }


      // =================================================
      // PAYMENT METHOD + ORDER TYPE MATCH
      // =================================================

      if (
        paymentMethod ===
          "cash_on_pickup" &&
        orderType !==
          "pickup"
      ) {
        return res.status(400).json({
          message:
            "Cash on Pickup can only be used for pickup orders.",
        });
      }


      if (
        paymentMethod ===
          "cash_on_delivery" &&
        orderType !==
          "delivery"
      ) {
        return res.status(400).json({
          message:
            "Cash on Delivery can only be used for delivery orders.",
        });
      }


      // =================================================
      // VALIDATE SCHEDULE
      // =================================================

      if (!orderDate) {
        return res.status(400).json({
          message:
            "Order date is required.",
        });
      }


      if (!orderTime) {
        return res.status(400).json({
          message:
            "Order time is required.",
        });
      }


      // =================================================
      // VALIDATE ITEMS
      // =================================================

      if (
        !Array.isArray(items) ||
        items.length === 0
      ) {
        return res.status(400).json({
          message:
            "At least one product is required.",
        });
      }


      // =================================================
      // DELIVERY VALIDATION
      // =================================================

      if (
        orderType ===
        "delivery"
      ) {
        if (!deliveryAddress) {
          return res.status(400).json({
            message:
              "Delivery address is required.",
          });
        }
      }


      // =================================================
      // GET PRODUCT IDS
      // =================================================

      const productIds =
        items.map(
          (item) =>
            Number(
              item.product_id
            )
        );


      const uniqueProductIds = [
        ...new Set(
          productIds
        ),
      ];


      if (
        uniqueProductIds.some(
          (id) =>
            !Number.isInteger(id) ||
            id <= 0
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid product ID.",
        });
      }


      // =================================================
      // GET FLASH DEAL IDS
      // =================================================

      const flashDealIds =
        items
          .map((item) =>
            item.flash_deal_id
              ? Number(
                  item.flash_deal_id
                )
              : null
          )
          .filter(
            (id) =>
              id !== null
          );


      const uniqueFlashDealIds = [
        ...new Set(
          flashDealIds
        ),
      ];


      if (
        uniqueFlashDealIds.some(
          (id) =>
            !Number.isInteger(id) ||
            id <= 0
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid Flash Deal ID.",
        });
      }


      const containsFlashDeal =
        uniqueFlashDealIds.length >
        0;


      // =================================================
      // START TRANSACTION
      // =================================================

      connection =
        await database.getConnection();

      await connection.beginTransaction();


      // =================================================
      // LOAD PRODUCTS
      // =================================================

      const [
        products,
      ] =
        await connection.query(
          `
          SELECT
            id,
            name,
            price,
            customizable,
            is_available
          FROM products
          WHERE id IN (?)
          FOR UPDATE
          `,
          [
            uniqueProductIds,
          ]
        );


      if (
        products.length !==
        uniqueProductIds.length
      ) {
        throw new Error(
          "One or more products no longer exist."
        );
      }


      // =================================================
      // PRODUCT MAP
      // =================================================

      const productMap =
        new Map(
          products.map(
            (product) => [
              Number(
                product.id
              ),
              product,
            ]
          )
        );


      // =================================================
      // CHECK PRODUCT AVAILABILITY
      // =================================================

      for (
        const item of items
      ) {
        const product =
          productMap.get(
            Number(
              item.product_id
            )
          );


        if (!product) {
          throw new Error(
            `Product ${item.product_id} was not found.`
          );
        }


        if (
          !Boolean(
            product.is_available
          )
        ) {
          throw new Error(
            `${product.name} is currently unavailable.`
          );
        }
      }


      // =================================================
      // CUSTOM CAKE CHECK
      // =================================================

      const containsCustomCake =
        products.some(
          (product) =>
            Boolean(
              product.customizable
            )
        );


      if (
        containsCustomCake
      ) {
        throw new Error(
          "Customized cakes require online payment through PayMongo."
        );
      }


      // =================================================
      // PRODUCT QUANTITY VALIDATION
      // =================================================

      for (
        const item of items
      ) {
        const quantity =
          Number(
            item.quantity
          );


        if (
          !Number.isInteger(
            quantity
          ) ||
          quantity <= 0
        ) {
          throw new Error(
            "Each product quantity must be a whole number greater than 0."
          );
        }
      }


      // =================================================
      // LOAD FLASH DEALS
      // =================================================

      const flashDealMap =
        new Map();


      if (
        containsFlashDeal
      ) {
        const [
          flashDeals,
        ] =
          await connection.query(
            `
            SELECT
              fd.id,
              fd.source_order_id,
              fd.product_id,
              fd.product_name,
              fd.quantity,
              fd.original_price,
              fd.discount_percent,
              fd.flash_price,
              fd.deal_date,
              fd.is_available,
              p.name AS actual_product_name,
              p.price AS actual_product_price,
              p.customizable,
              p.is_available AS product_is_available
            FROM flash_deals fd
            INNER JOIN products p
              ON p.id = fd.product_id
            WHERE fd.id IN (?)
              AND fd.deal_date = CURDATE()
            FOR UPDATE
            `,
            [
              uniqueFlashDealIds,
            ]
          );


        if (
          flashDeals.length !==
          uniqueFlashDealIds.length
        ) {
          throw new Error(
            "One or more Flash Deals are expired or no longer available today."
          );
        }


        for (
          const deal of flashDeals
        ) {
          flashDealMap.set(
            Number(
              deal.id
            ),
            deal
          );
        }
      }


      // =================================================
      // VALIDATE FLASH DEALS
      // =================================================

      for (
        const item of items
      ) {
        if (
          !item.flash_deal_id
        ) {
          continue;
        }


        const flashDeal =
          flashDealMap.get(
            Number(
              item.flash_deal_id
            )
          );


        if (!flashDeal) {
          throw new Error(
            "Flash Deal was not found."
          );
        }


        // -------------------------------------------------
        // PRODUCT MUST MATCH FLASH DEAL
        // -------------------------------------------------

        if (
          Number(
            item.product_id
          ) !==
          Number(
            flashDeal.product_id
          )
        ) {
          throw new Error(
            "Flash Deal does not match the selected product."
          );
        }


        // -------------------------------------------------
        // FLASH DEAL MUST BE AVAILABLE
        // -------------------------------------------------

        if (
          !Boolean(
            flashDeal.is_available
          )
        ) {
          throw new Error(
            `${flashDeal.product_name} Flash Deal is no longer available.`
          );
        }


        // -------------------------------------------------
        // PRODUCT MUST STILL BE AVAILABLE
        // -------------------------------------------------

        if (
          !Boolean(
            flashDeal.product_is_available
          )
        ) {
          throw new Error(
            `${flashDeal.product_name} is currently unavailable.`
          );
        }


        // -------------------------------------------------
        // FLASH DEALS CANNOT BE CUSTOM CAKES
        // -------------------------------------------------

        if (
          Boolean(
            flashDeal.customizable
          )
        ) {
          throw new Error(
            "Customized cakes cannot be sold as Flash Deals."
          );
        }


        // -------------------------------------------------
        // CHECK REMAINING FLASH DEAL QUANTITY
        // -------------------------------------------------

        const requestedQuantity =
          Number(
            item.quantity
          );


        if (
          Number(
            flashDeal.quantity
          ) <
          requestedQuantity
        ) {
          throw new Error(
            `${flashDeal.product_name} only has ${flashDeal.quantity} Flash Deal item(s) remaining.`
          );
        }
      }


      // =================================================
      // SCHEDULE CAPACITY
      // =================================================

      const [
        scheduleRows,
      ] =
        await connection.query(
          `
          SELECT
            id,
            maximum_orders,
            is_disabled
          FROM schedule_capacity
          WHERE schedule_date = ?
          LIMIT 1
          FOR UPDATE
          `,
          [
            orderDate,
          ]
        );


      const schedule =
        scheduleRows[0] || {
          maximum_orders: 30,
          is_disabled: false,
        };


      if (
        Boolean(
          schedule.is_disabled
        )
      ) {
        throw new Error(
          "Ordering is disabled for the selected date."
        );
      }


      const maximumOrders =
        Number(
          schedule.maximum_orders
        );


      const [
        reservedOrderRows,
      ] =
        await connection.query(
          `
          SELECT
            COUNT(*) AS reserved_orders
          FROM orders
          WHERE DATE(order_date) = ?
            AND status <> 'cancelled'
          `,
          [
            orderDate,
          ]
        );


      const reservedOrders =
        Number(
          reservedOrderRows[0]
            ?.reserved_orders || 0
        );


      if (
        maximumOrders > 0 &&
        reservedOrders >=
          maximumOrders
      ) {
        throw new Error(
          "The selected date is already fully booked."
        );
      }


      // =================================================
      // PRODUCT SCHEDULE CAPACITY
      // Flash Deals are excluded because their inventory
      // is controlled by flash_deals.quantity.
      // =================================================

      for (
        const item of items
      ) {

        if (
          item.flash_deal_id
        ) {
          continue;
        }


        const [
          capacityRows,
        ] =
          await connection.query(
            `
            SELECT
              maximum_quantity,
              is_disabled
            FROM product_schedule_capacity
            WHERE product_id = ?
              AND schedule_date = ?
            LIMIT 1
            FOR UPDATE
            `,
            [
              Number(
                item.product_id
              ),
              orderDate,
            ]
          );


        if (
          capacityRows.length ===
          0
        ) {
          continue;
        }


        const capacity =
          capacityRows[0];


        if (
          Boolean(
            capacity.is_disabled
          )
        ) {
          const product =
            productMap.get(
              Number(
                item.product_id
              )
            );


          throw new Error(
            `${
              product?.name ||
              "This product"
            } is unavailable for the selected date.`
          );
        }


        const maximumQuantity =
          Number(
            capacity.maximum_quantity
          );


        // 0 = unlimited
        if (
          maximumQuantity === 0
        ) {
          continue;
        }


        const [
          reservedRows,
        ] =
          await connection.query(
            `
            SELECT
              COALESCE(
                SUM(oi.quantity),
                0
              ) AS reserved_quantity
            FROM order_items oi
            INNER JOIN orders o
              ON o.id =
                oi.order_id
            WHERE oi.product_id = ?
              AND DATE(
                o.order_date
              ) = ?
              AND o.status <> 'cancelled'
            `,
            [
              Number(
                item.product_id
              ),
              orderDate,
            ]
          );


        const reservedQuantity =
          Number(
            reservedRows[0]
              ?.reserved_quantity ||
              0
          );


        const requestedQuantity =
          Number(
            item.quantity
          );


        if (
          reservedQuantity +
            requestedQuantity >
          maximumQuantity
        ) {
          const product =
            productMap.get(
              Number(
                item.product_id
              )
            );


          throw new Error(
            `Only ${
              Math.max(
                maximumQuantity -
                  reservedQuantity,
                0
              )
            } ${
              product?.name ||
              "units"
            } remaining for the selected date.`
          );
        }
      }


      // =================================================
      // FLASH DEALS MUST BE ORDERED TODAY
      // =================================================

      if (
        containsFlashDeal
      ) {
        const [
          todayRows,
        ] =
          await connection.query(
            `
            SELECT
              DATE_FORMAT(
                CURDATE(),
                '%Y-%m-%d'
              ) AS today
            `
          );


        const today =
          todayRows[0]?.today;


        if (
          String(
            orderDate
          ) !==
          String(
            today
          )
        ) {
          throw new Error(
            "Flash Deals can only be ordered for today."
          );
        }
      }


      // =================================================
      // CALCULATE TOTALS
      // =================================================

      let subtotal = 0;


      const orderItems =
        items.map(
          (item) => {

            const product =
              productMap.get(
                Number(
                  item.product_id
                )
              );


            const quantity =
              Number(
                item.quantity
              );


            const flashDeal =
              item.flash_deal_id
                ? flashDealMap.get(
                    Number(
                      item.flash_deal_id
                    )
                  )
                : null;


            const unitPrice =
              flashDeal
                ? Number(
                    flashDeal.flash_price
                  )
                : Number(
                    product.price
                  );


            const itemSubtotal =
              unitPrice *
              quantity;


            subtotal +=
              itemSubtotal;


            return {
              product_id:
                Number(
                  product.id
                ),

              product_name:
                product.name,

              quantity,

              unit_price:
                unitPrice,

              subtotal:
                itemSubtotal,

              flash_deal_id:
                flashDeal
                  ? Number(
                      flashDeal.id
                    )
                  : null,

              customization:
                item.customization ||
                null,
            };
          }
        );


      const finalDeliveryFee =
        orderType ===
        "delivery"
          ? Number(
              deliveryFee || 0
            )
          : 0;


      const totalAmount =
        subtotal +
        finalDeliveryFee;


      // =================================================
      // GENERATE ORDER NUMBER
      // =================================================

      const orderNumber =
        `BD-${Date.now()}`;


      // =================================================
      // CREATE ORDER
      // =================================================

      const [
        orderResult,
      ] =
        await connection.query(
          `
          INSERT INTO orders
          (
            user_id,
            order_number,
            order_type,
            order_date,
            order_time,
            delivery_address,
            delivery_latitude,
            delivery_longitude,
            delivery_distance_km,
            subtotal,
            delivery_fee,
            total_amount,
            status,
            payment_status,
            payment_method,
            notes
          )
          VALUES
          (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          [
            req.user.id,

            orderNumber,

            orderType,

            orderDate,

            orderTime,

            orderType ===
            "delivery"
              ? deliveryAddress
              : null,

            orderType ===
            "delivery"
              ? Number(
                  deliveryLatitude
                )
              : null,

            orderType ===
            "delivery"
              ? Number(
                  deliveryLongitude
                )
              : null,

            orderType ===
            "delivery"
              ? Number(
                  deliveryDistanceKm ||
                    0
                )
              : null,

            subtotal,

            finalDeliveryFee,

            totalAmount,

            "confirmed",

            "unpaid",

            paymentMethod,

            notes ||
              null,
          ]
        );


      const orderId =
        orderResult.insertId;


      // =================================================
      // INSERT ORDER ITEMS
      // =================================================

      for (
        const item of orderItems
      ) {

        await connection.query(
          `
          INSERT INTO order_items
          (
            order_id,
            product_id,
            flash_deal_id,
            product_name,
            quantity,
            unit_price,
            subtotal,
            customization
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `,
          [
            orderId,

            item.product_id,

            item.flash_deal_id,

            item.product_name,

            item.quantity,

            item.unit_price,

            item.subtotal,

            item.customization
              ? JSON.stringify(
                  item.customization
                )
              : null,
          ]
        );
      }


      // =================================================
      // REDUCE FLASH DEAL INVENTORY
      // =================================================

      for (
        const item of orderItems
      ) {

        if (
          !item.flash_deal_id
        ) {
          continue;
        }


        const [
          updateResult,
        ] =
          await connection.query(
            `
            UPDATE flash_deals
            SET
              quantity =
                quantity - ?,
              is_available =
                CASE
                  WHEN quantity - ? <= 0
                    THEN FALSE
                  ELSE is_available
                END
            WHERE id = ?
              AND deal_date = CURDATE()
              AND is_available = TRUE
              AND quantity >= ?
            `,
            [
              item.quantity,

              item.quantity,

              item.flash_deal_id,

              item.quantity,
            ]
          );


        if (
          updateResult.affectedRows ===
          0
        ) {
          throw new Error(
            "A Flash Deal became unavailable while processing your order. Please try again."
          );
        }
      }


      // =================================================
      // COMMIT
      // =================================================

      await connection.commit();


      return res.status(201).json({

        success: true,

        message:
          "Cash order created successfully.",

        order: {

          id:
            orderId,

          order_number:
            orderNumber,

          order_type:
            orderType,

          order_date:
            orderDate,

          order_time:
            orderTime,

          subtotal,

          delivery_fee:
            finalDeliveryFee,

          total_amount:
            totalAmount,

          status:
            "confirmed",

          payment_status:
            "unpaid",

          payment_method:
            paymentMethod,

        },
      });

    } catch (error) {

      if (
        connection
      ) {
        await connection.rollback();
      }


      console.error(
        "CREATE CASH ORDER ERROR:",
        error
      );


      return res.status(400).json({

        success: false,

        message:
          error.message ||
          "Failed to create cash order.",
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

/* =====================================================
   CUSTOMER CANCEL ORDER
   POST /api/orders/:orderId/cancel
===================================================== */

router.post(
  "/:orderId/cancel",
  authenticateToken,
  async (req, res) => {
    try {
      const db = req.app.locals.db;

      const orderId =
        Number(req.params.orderId);

      if (
        !Number.isInteger(orderId) ||
        orderId <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid order ID."
        });
      }


      // =================================================
      // GET CUSTOMER ORDER
      // =================================================

      const [orders] =
        await db.query(
          `
          SELECT
            id,
            user_id,
            order_date,
            status,
            cancelled_by
          FROM orders
          WHERE id = ?
            AND user_id = ?
          LIMIT 1
          `,
          [
            orderId,
            req.user.id
          ]
        );


      if (orders.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Order not found."
        });
      }


      const order =
        orders[0];


      // =================================================
      // ORDER MUST STILL BE CANCELLABLE
      // =================================================

      const cancellableStatuses = [
        "pending",
        "confirmed"
      ];


      if (
        !cancellableStatuses.includes(
          order.status
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "This order can no longer be cancelled."
        });
      }


      // =================================================
      // CANNOT CANCEL ONE DAY BEFORE SCHEDULE
      //
      // 0 = today
      // 1 = tomorrow
      // >1 = cancellation allowed
      // =================================================

      const [scheduleRows] =
        await db.query(
          `
          SELECT
            DATEDIFF(
              order_date,
              CURDATE()
            ) AS days_until_order
          FROM orders
          WHERE id = ?
          LIMIT 1
          `,
          [orderId]
        );


      const daysUntilOrder =
        Number(
          scheduleRows[0]
            ?.days_until_order ?? -1
        );


      if (
        daysUntilOrder <= 1
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Orders can only be cancelled more than 1 day before the scheduled pickup or delivery date."
        });
      }


      // =================================================
      // CUSTOMER CANCELLATION
      //
      // IMPORTANT:
      // Customer cancellations NEVER create Flash Deals.
      // =================================================

      await db.query(
        `
        UPDATE orders
        SET
          status = 'cancelled',
          cancelled_by = 'customer'
        WHERE id = ?
          AND user_id = ?
        `,
        [
          orderId,
          req.user.id
        ]
      );


      return res.json({
        success: true,
        message:
          "Your order has been cancelled successfully.",
        order: {
          id: orderId,
          status: "cancelled",
          cancelled_by: "customer"
        }
      });

    } catch (error) {

      console.error(
        "CUSTOMER CANCEL ORDER ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to cancel the order."
      });
    }
  }
);

/* =====================================================
   GET CUSTOMER ORDERS
   GET /api/orders/my-orders
===================================================== */

router.get(
  "/my-orders",
  authenticateToken,
  async (req, res) => {

    try {

      const db =
        req.app.locals.db;


      const [
        orders,
      ] =
        await db.query(
          `
          SELECT
            o.id,
            o.order_number,
            o.order_type,
            o.order_date,
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

            o.rider_id,
            r.name AS rider_name,
            r.phone AS rider_phone,

            o.paymongo_checkout_session_id,
            o.created_at

          FROM orders o

          LEFT JOIN riders r
            ON r.id = o.rider_id

          WHERE o.user_id = ?

          ORDER BY
            o.id DESC
          `,
          [
            req.user.id,
          ]
        );


      /* =================================================
         LOAD ORDER ITEMS
      ================================================= */

      for (
        const order of orders
      ) {

        const [
          items,
        ] =
          await db.query(
            `
            SELECT
              id,
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
            [
              order.id,
            ]
          );


        order.items =
          items;


        order.item_count =
          items.reduce(
            (
              total,
              item
            ) =>
              total +
              Number(
                item.quantity ||
                0
              ),
            0
          );
      }


      return res.json({
        orders,
      });

    } catch (error) {

      console.error(
        "MY ORDERS ERROR:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to load orders.",
      });
    }
  }
);


module.exports = router;