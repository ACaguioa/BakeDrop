const express = require("express");
const jwt = require("jsonwebtoken");

const router = express.Router();


// =====================================================
// AUTHENTICATION
// =====================================================

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


// =====================================================
// CREATE PAYMONGO CHECKOUT SESSION
// POST /api/paymongo/create-checkout
// =====================================================

router.post(
  "/create-checkout",
  authenticateToken,
  async (req, res) => {

    const db =
      req.app.locals.db;

    let connection;

    try {

      const {
        orderType,
        orderDate,
        orderTime,
        deliveryAddress,
        notes,
        deliveryFee,
        items,
        deliveryDistanceKm,
      } = req.body;


      // =================================================
      // BASIC ORDER DATE VALIDATION
      // =================================================

      if (!orderDate) {

        return res.status(400).json({
          success: false,
          message:
            "Please select a preorder date.",
        });

      }


      // =================================================
      // VALIDATE DATE FORMAT
      // =================================================

      if (
        !/^\d{4}-\d{2}-\d{2}$/.test(
          orderDate
        )
      ) {

        return res.status(400).json({
          success: false,
          message:
            "Invalid preorder date.",
        });

      }


      // =================================================
      // BASIC VALIDATION
      // =================================================

      if (!orderType) {

        return res.status(400).json({
          message:
            "Order type is required.",
        });

      }


      if (
        !Array.isArray(items) ||
        items.length === 0
      ) {

        return res.status(400).json({
          message:
            "Your cart is empty.",
        });

      }


      if (
        orderType !== "pickup" &&
        orderType !== "delivery"
      ) {

        return res.status(400).json({
          message:
            "Invalid order type.",
        });

      }


      if (
        orderType === "delivery" &&
        !deliveryAddress
      ) {

        return res.status(400).json({
          message:
            "Delivery address is required.",
        });

      }


      // =================================================
      // CHECK WHETHER CART CONTAINS FLASH DEALS
      // =================================================

      const containsFlashDeal =
        items.some(
          (item) =>
            item.flash_deal_id !==
              undefined &&
            item.flash_deal_id !==
              null &&
            Number(
              item.flash_deal_id
            ) > 0
        );


      // =================================================
      // DATE VALIDATION
      //
      // Normal orders:
      // TOMORROW OR LATER
      //
      // Flash Deals:
      // TODAY ONLY
      // =================================================

      const today =
        new Date();

      today.setHours(
        0,
        0,
        0,
        0
      );


      const selectedDate =
        new Date(
          `${orderDate}T00:00:00`
        );


      if (
        Number.isNaN(
          selectedDate.getTime()
        )
      ) {

        return res.status(400).json({
          success: false,
          message:
            "Invalid preorder date.",
        });

      }


      if (
        containsFlashDeal
      ) {

        // -------------------------------------------------
        // FLASH DEALS MUST BE ORDERED TODAY
        // -------------------------------------------------

        if (
          selectedDate.getTime() !==
          today.getTime()
        ) {

          return res.status(400).json({
            success: false,
            message:
              "Flash Deals can only be ordered for today.",
          });

        }

      } else {

        // -------------------------------------------------
        // NORMAL ORDERS MUST BE TOMORROW OR LATER
        // -------------------------------------------------

        if (
          selectedDate <= today
        ) {

          return res.status(400).json({
            success: false,
            message:
              "Orders cannot be scheduled for today or any previous date. Please choose a future date.",
          });

        }

      }


      // =================================================
      // DELIVERY INFORMATION
      // =================================================

      let deliveryLatitude =
        null;

      let deliveryLongitude =
        null;

      let finalDeliveryDistanceKm =
        null;


      if (
        orderType === "delivery"
      ) {

        deliveryLatitude =
          deliveryAddress?.latitude !==
          undefined
            ? Number(
                deliveryAddress.latitude
              )
            : null;


        deliveryLongitude =
          deliveryAddress?.longitude !==
          undefined
            ? Number(
                deliveryAddress.longitude
              )
            : null;


        if (
          !Number.isFinite(
            deliveryLatitude
          )
        ) {

          deliveryLatitude =
            null;

        }


        if (
          !Number.isFinite(
            deliveryLongitude
          )
        ) {

          deliveryLongitude =
            null;

        }


        if (
          deliveryDistanceKm !==
            undefined &&
          deliveryDistanceKm !==
            null
        ) {

          finalDeliveryDistanceKm =
            Number(
              deliveryDistanceKm
            );


          if (
            !Number.isFinite(
              finalDeliveryDistanceKm
            ) ||
            finalDeliveryDistanceKm < 0
          ) {

            finalDeliveryDistanceKm =
              null;

          }

        }

      }


      // =================================================
      // CLEAN CART ITEMS
      // =================================================

      let cleanItems;


      try {

        cleanItems =
          items.map(
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


              const quantity =
                Number(
                  item.quantity
                );


              const price =
                Number(
                  item.price
                );


              const flashDealId =
                item.flash_deal_id !==
                  undefined &&
                item.flash_deal_id !==
                  null
                  ? Number(
                      item.flash_deal_id
                    )
                  : null;


              if (
                !Number.isInteger(
                  productId
                ) ||
                productId <= 0
              ) {

                throw new Error(
                  `Invalid product ID for ${item.name}.`
                );

              }


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


              if (
                flashDealId !== null &&
                (
                  !Number.isInteger(
                    flashDealId
                  ) ||
                  flashDealId <= 0
                )
              ) {

                throw new Error(
                  `Invalid Flash Deal ID for ${item.name}.`
                );

              }


              return {

                product_id:
                  productId,

                name:
                  String(
                    item.name ||
                    "BakeDrop Item"
                  ),

                quantity,

                price,

                flash_deal_id:
                  flashDealId,

                customization:
                  item.customization
                    ? JSON.stringify(
                        item.customization
                      )
                    : null,

              };

            }
          );


      } catch (itemError) {

        return res.status(400).json({
          message:
            itemError.message,
        });

      }


      // =================================================
      // UNIQUE PRODUCT IDS
      // =================================================

      const productIds =
        cleanItems.map(
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


      // =================================================
      // UNIQUE FLASH DEAL IDS
      // =================================================

      const flashDealIds =
        cleanItems
          .map(
            (item) =>
              item.flash_deal_id
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


      // =================================================
      // START TRANSACTION
      // =================================================

      connection =
        await db.getConnection();


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
        const item of cleanItems
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
      // LOAD FLASH DEALS
      // =================================================

      const flashDealMap =
        new Map();


      if (
        uniqueFlashDealIds.length >
        0
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

              DATE_FORMAT(
                fd.deal_date,
                '%Y-%m-%d'
              ) AS deal_date,

              fd.is_available,

              p.name AS actual_product_name,
              p.price AS actual_product_price,
              p.customizable,
              p.is_available AS product_is_available

            FROM flash_deals fd

            INNER JOIN products p
              ON p.id =
                fd.product_id

            WHERE fd.id IN (?)

              AND fd.deal_date =
                CURDATE()

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
        const item of cleanItems
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
        // FLASH DEAL QUANTITY
        // -------------------------------------------------

        if (
          Number(
            flashDeal.quantity
          ) <
          Number(
            item.quantity
          )
        ) {

          throw new Error(
            `${flashDeal.product_name} only has ${flashDeal.quantity} Flash Deal item(s) remaining.`
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
        // CUSTOMIZABLE PRODUCTS CANNOT BE FLASH DEALS
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

      }


      // =================================================
      // CHECK SCHEDULE CAPACITY
      //
      // Flash Deal items have their own inventory.
      // They are skipped from product-date capacity.
      //
      // Overall order capacity is still checked.
      // =================================================

      const [
        scheduleRows,
      ] =
        await connection.query(
          `
          SELECT
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


      let maximumOrders =
        30;

      let scheduleDisabled =
        false;


      if (
        scheduleRows.length >
        0
      ) {

        maximumOrders =
          Number(
            scheduleRows[0]
              .maximum_orders
          );


        scheduleDisabled =
          Boolean(
            scheduleRows[0]
              .is_disabled
          );

      }


      // =================================================
      // CHECK IF DATE IS DISABLED
      // =================================================

      if (
        scheduleDisabled
      ) {

        throw new Error(
          `Ordering for ${orderDate} is currently unavailable.`
        );

      }


      // =================================================
      // COUNT RESERVED ORDERS
      // =================================================

      const [
        reservedOrderRows,
      ] =
        await connection.query(
          `
          SELECT
            COUNT(*) AS reserved_orders

          FROM orders

          WHERE DATE(
            order_date
          ) = ?

            AND status <>
              'cancelled'
          `,
          [
            orderDate,
          ]
        );


      const reservedOrders =
        Number(
          reservedOrderRows[0]
            ?.reserved_orders ||
          0
        );


      const remainingOrderSlots =
        Math.max(
          maximumOrders -
            reservedOrders,
          0
        );


      // =================================================
      // CHECK OVERALL DATE CAPACITY
      // =================================================

      if (
        remainingOrderSlots <= 0
      ) {

        throw new Error(
          `All order slots for ${orderDate} are already reserved.`
        );

      }


      // =================================================
      // CHECK PRODUCT CAPACITY
      // =================================================

      for (
        const item of cleanItems
      ) {

        // Flash Deal inventory is controlled by
        // flash_deals.quantity.
        if (
          item.flash_deal_id
        ) {

          continue;

        }


        const [
          productRows,
        ] =
          await connection.query(
            `
            SELECT
              p.id,
              p.name,
              p.is_available,

              COALESCE(
                psc.maximum_quantity,
                0
              ) AS maximum_quantity,

              COALESCE(
                psc.is_disabled,
                0
              ) AS is_disabled

            FROM products p

            LEFT JOIN
              product_schedule_capacity psc

              ON psc.product_id =
                p.id

              AND psc.schedule_date =
                ?

            WHERE p.id = ?

            LIMIT 1

            FOR UPDATE
            `,
            [
              orderDate,
              item.product_id,
            ]
          );


        if (
          productRows.length ===
          0
        ) {

          throw new Error(
            `Product "${item.name}" was not found.`
          );

        }


        const product =
          productRows[0];


        if (
          !product.is_available
        ) {

          throw new Error(
            `${product.name} is currently unavailable.`
          );

        }


        if (
          Boolean(
            product.is_disabled
          )
        ) {

          throw new Error(
            `${product.name} is unavailable for ${orderDate}.`
          );

        }


        const maximumQuantity =
          Number(
            product.maximum_quantity
          );


        // 0 = unlimited
        if (
          maximumQuantity === 0
        ) {

          continue;

        }


        const [
          reservedProductRows,
        ] =
          await connection.query(
            `
            SELECT
              COALESCE(
                SUM(
                  oi.quantity
                ),
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

              AND o.status <>
                'cancelled'
            `,
            [
              item.product_id,
              orderDate,
            ]
          );


        const reservedQuantity =
          Number(
            reservedProductRows[0]
              ?.reserved_quantity ||
            0
          );


        const remainingQuantity =
          Math.max(
            maximumQuantity -
              reservedQuantity,
            0
          );


        if (
          item.quantity >
          remainingQuantity
        ) {

          if (
            remainingQuantity ===
            0
          ) {

            throw new Error(
              `${product.name} is fully booked for ${orderDate}.`
            );

          }


          throw new Error(
            `${product.name} only has ${remainingQuantity} remaining for ${orderDate}.`
          );

        }

      }


      // =================================================
      // CALCULATE SUBTOTAL
      // =================================================

      let calculatedSubtotal =
        0;


      const orderItems =
        cleanItems.map(
          (item) => {

            const product =
              productMap.get(
                Number(
                  item.product_id
                )
              );


            const flashDeal =
              item.flash_deal_id
                ? flashDealMap.get(
                    Number(
                      item.flash_deal_id
                    )
                  )
                : null;


            // Flash Deal uses database flash price.
            // Normal product uses database regular price.
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
              Number(
                item.quantity
              );


            calculatedSubtotal +=
              itemSubtotal;


            return {

              product_id:
                Number(
                  product.id
                ),

              product_name:
                product.name,

              quantity:
                Number(
                  item.quantity
                ),

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


      // =================================================
      // CALCULATE DELIVERY FEE
      // =================================================

      const finalDeliveryFee =
        orderType === "delivery"
          ? Number(
              deliveryFee || 0
            )
          : 0;


      if (
        !Number.isFinite(
          finalDeliveryFee
        ) ||
        finalDeliveryFee < 0
      ) {

        throw new Error(
          "Invalid delivery fee."
        );

      }


      // =================================================
      // CALCULATE FINAL TOTAL
      // =================================================

      const calculatedTotalAmount =
        calculatedSubtotal +
        finalDeliveryFee;


      if (
        calculatedTotalAmount <= 0
      ) {

        throw new Error(
          "Order total must be greater than zero."
        );

      }


      // =================================================
      // GENERATE ORDER NUMBER
      // =================================================

      const datePart =
        new Date()
          .toISOString()
          .slice(
            0,
            10
          )
          .replace(
            /-/g,
            ""
          );


      const randomPart =
        Math.floor(
          100000 +
            Math.random() *
              900000
        );


      const orderNumber =
        `BD-${datePart}-${randomPart}`;


      // =================================================
      // CREATE PENDING ORDER
      // =================================================

      const [
        orderResult,
      ] =
        await connection.query(
          `
          INSERT INTO orders (
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

          VALUES (
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            'pending',
            'pending',
            'online',
            ?
          )
          `,
          [
            req.user.id,

            orderNumber,

            orderType,

            orderDate,

            orderTime,

            orderType ===
            "delivery"
              ? JSON.stringify(
                  deliveryAddress
                )
              : null,

            orderType ===
            "delivery"
              ? deliveryLatitude
              : null,

            orderType ===
            "delivery"
              ? deliveryLongitude
              : null,

            orderType ===
            "delivery"
              ? finalDeliveryDistanceKm
              : null,

            calculatedSubtotal,

            finalDeliveryFee,

            calculatedTotalAmount,

            notes ||
              null,
          ]
        );


      console.log(
        "ORDER VALUES:",
        {
          orderDate,
          orderTime,
          subtotal:
            calculatedSubtotal,
          finalDeliveryFee,
          totalAmount:
            calculatedTotalAmount,
          containsFlashDeal,
        }
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
          INSERT INTO order_items (
            order_id,
            product_id,
            flash_deal_id,
            product_name,
            quantity,
            unit_price,
            subtotal,
            customization
          )

          VALUES (
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?
          )
          `,
          [
            orderId,

            item.product_id,

            item.flash_deal_id,

            item.product_name,

            item.quantity,

            item.unit_price,

            item.subtotal,

            item.customization,
          ]
        );

      }


      // =================================================
      // PAYMONGO SECRET KEY
      // =================================================

      const secretKey =
        process.env.PAYMONGO_SECRET_KEY;


      if (!secretKey) {

        throw new Error(
          "PAYMONGO_SECRET_KEY is not configured."
        );

      }


      // =================================================
      // PAYMONGO LINE ITEMS
      // =================================================

      const lineItems =
        orderItems.map(
          (item) => ({

            name:
              item.product_name,

            amount:
              Math.round(
                Number(
                  item.unit_price
                ) * 100
              ),

            currency:
              "PHP",

            quantity:
              item.quantity,

          })
        );


      // =================================================
      // ADD DELIVERY FEE
      // =================================================

      if (
        finalDeliveryFee > 0
      ) {

        lineItems.push({

          name:
            "Delivery Fee",

          amount:
            Math.round(
              finalDeliveryFee * 100
            ),

          currency:
            "PHP",

          quantity:
            1,

        });

      }


      // =================================================
      // FRONTEND URL
      // =================================================

      const frontendUrl =
        process.env.FRONTEND_URL ||
        "http://localhost:5173";


      // =================================================
      // PAYMONGO CHECKOUT PAYLOAD
      // =================================================

      const checkoutPayload = {

        data: {

          attributes: {

            line_items:
              lineItems,

            payment_method_types: [
              "card",
              "gcash",
              "qrph",
            ],

            success_url:
              `${frontendUrl}/my-orders?payment=success&order=${orderNumber}`,

            cancel_url:
              `${frontendUrl}/payment?payment=cancelled`,

            reference_number:
              orderNumber,

            send_email_receipt:
              false,

            metadata: {

              order_id:
                String(
                  orderId
                ),

              order_number:
                orderNumber,

              user_id:
                String(
                  req.user.id
                ),

            },

          },

        },

      };


      // =================================================
      // CREATE PAYMONGO CHECKOUT SESSION
      // =================================================

      const paymongoResponse =
        await fetch(
          "https://api.paymongo.com/v2/checkout_sessions",
          {
            method:
              "POST",

            headers: {

              Authorization:
                `Basic ${Buffer.from(
                  `${secretKey}:`
                ).toString(
                  "base64"
                )}`,

              "Content-Type":
                "application/json",

              Accept:
                "application/json",

            },

            body:
              JSON.stringify(
                checkoutPayload
              ),

          }
        );


      const paymongoData =
        await paymongoResponse.json();


      // =================================================
      // HANDLE PAYMONGO ERROR
      // =================================================

      if (
        !paymongoResponse.ok
      ) {

        console.error(
          "PAYMONGO CREATE ERROR:",
          paymongoData
        );


        throw new Error(
          paymongoData
            ?.errors?.[0]
            ?.detail ||
          "Failed to create PayMongo checkout session."
        );

      }


      // =================================================
      // GET CHECKOUT SESSION
      // =================================================

      const checkoutSession =
        paymongoData?.data;


      const checkoutSessionId =
        checkoutSession?.id;


      const checkoutUrl =
        checkoutSession
          ?.attributes
          ?.checkout_url;


      if (
        !checkoutSessionId ||
        !checkoutUrl
      ) {

        throw new Error(
          "PayMongo did not return a checkout URL."
        );

      }


      // =================================================
      // SAVE CHECKOUT SESSION ID
      // =================================================

      await connection.query(
        `
        UPDATE orders

        SET
          paymongo_checkout_session_id = ?

        WHERE id = ?
        `,
        [
          checkoutSessionId,
          orderId,
        ]
      );


      // =================================================
      // COMMIT TRANSACTION
      // =================================================

      await connection.commit();


      // =================================================
      // RETURN CHECKOUT URL
      // =================================================

      return res.json({

        success: true,

        order: {

          id:
            orderId,

          order_number:
            orderNumber,

          total_amount:
            calculatedTotalAmount,

          payment_status:
            "pending",

        },

        checkout_session_id:
          checkoutSessionId,

        checkout_url:
          checkoutUrl,

      });


    } catch (error) {

      if (connection) {

        try {

          await connection.rollback();

        } catch (
          rollbackError
        ) {

          console.error(
            "ROLLBACK ERROR:",
            rollbackError
          );

        }

      }


      console.error(
        "PAYMONGO CHECKOUT ERROR:",
        error
      );


      return res.status(500).json({

        success: false,

        message:
          error.message ||
          "Unable to create payment checkout.",

      });

    } finally {

      if (connection) {
        connection.release();
      }

    }

  }
);


// =====================================================
// VERIFY PAYMONGO PAYMENT
// POST /api/paymongo/verify-payment
// =====================================================

router.post(
  "/verify-payment",
  authenticateToken,
  async (req, res) => {

    try {

      const db =
        req.app.locals.db;


      const {
        orderNumber,
      } = req.body;


      // =================================================
      // VALIDATE ORDER NUMBER
      // =================================================

      if (!orderNumber) {

        return res.status(400).json({

          success: false,

          paid: false,

          message:
            "Order number is required.",

        });

      }


      // =================================================
      // FIND BAKEdROP ORDER
      // =================================================

      const [
        orders,
      ] =
        await db.query(
          `
          SELECT

            id,

            user_id,

            order_number,

            total_amount,

            status,

            payment_status,

            paymongo_checkout_session_id

          FROM orders

          WHERE order_number = ?

            AND user_id = ?

          LIMIT 1
          `,
          [
            orderNumber,
            req.user.id,
          ]
        );


      if (
        orders.length === 0
      ) {

        return res.status(404).json({

          success: false,

          paid: false,

          message:
            "Order not found.",

        });

      }


      const order =
        orders[0];


      // =================================================
      // ALREADY PAID
      // =================================================

      if (
        order.payment_status ===
        "paid"
      ) {

        return res.json({

          success: true,

          paid: true,

          payment_status:
            "paid",

          status:
            order.status,

          message:
            "Order is already paid.",

        });

      }


      // =================================================
      // GET CHECKOUT SESSION ID
      // =================================================

      const checkoutSessionId =
        order.paymongo_checkout_session_id;


      if (!checkoutSessionId) {

        return res.status(400).json({

          success: false,

          paid: false,

          message:
            "PayMongo Checkout Session ID is missing.",

        });

      }


      // =================================================
      // PAYMONGO SECRET KEY
      // =================================================

      const secretKey =
        process.env.PAYMONGO_SECRET_KEY;


      if (!secretKey) {

        return res.status(500).json({

          success: false,

          paid: false,

          message:
            "PAYMONGO_SECRET_KEY is not configured.",

        });

      }


      // =================================================
      // RETRIEVE CHECKOUT SESSION
      // =================================================

      const paymongoResponse =
        await fetch(

          `https://api.paymongo.com/v1/checkout_sessions/${encodeURIComponent(
            checkoutSessionId
          )}`,

          {

            method:
              "GET",

            headers: {

              Authorization:
                `Basic ${Buffer.from(
                  `${secretKey}:`
                ).toString(
                  "base64"
                )}`,

              Accept:
                "application/json",

            },

          }

        );


      const paymongoData =
        await paymongoResponse.json();


      // =================================================
      // PAYMONGO API ERROR
      // =================================================

      if (
        !paymongoResponse.ok
      ) {

        console.error(
          "PAYMONGO VERIFY ERROR:",
          paymongoData
        );


        return res.status(502).json({

          success: false,

          paid: false,

          message:
            "Unable to retrieve payment information from PayMongo.",

        });

      }


      // =================================================
      // CHECKOUT SESSION
      // =================================================

      const session =
        paymongoData?.data;


      if (!session) {

        return res.status(502).json({

          success: false,

          paid: false,

          message:
            "PayMongo returned an invalid Checkout Session.",

        });

      }


      const sessionAttributes =
        session?.attributes ||
        {};


      // =================================================
      // VERIFY REFERENCE NUMBER
      // =================================================

      const referenceNumber =
        sessionAttributes
          .reference_number;


      console.log(
        "PAYMONGO VERIFY SESSION:",
        {
          sessionId:
            checkoutSessionId,

          referenceNumber,

          expectedReference:
            order.order_number,

          orderId:
            order.id,
        }
      );


      if (
        referenceNumber !==
        order.order_number
      ) {

        console.error(
          "PAYMONGO REFERENCE MISMATCH:",
          {
            database:
              order.order_number,

            paymongo:
              referenceNumber,
          }
        );


        return res.status(400).json({

          success: false,

          paid: false,

          message:
            "PayMongo reference does not match the BakeDrop order.",

        });

      }


      // =================================================
      // GET PAYMENTS
      // =================================================

      const payments =
        Array.isArray(
          sessionAttributes
            .payments
        )
          ? sessionAttributes
              .payments
          : [];


      console.log(
        "PAYMONGO PAYMENTS COUNT:",
        payments.length
      );


      // =================================================
      // FIND PAID PAYMENT
      // =================================================

      const paidPayment =
        payments.find(
          (payment) =>
            payment
              ?.attributes
              ?.status ===
            "paid"
        );


      // =================================================
      // PAYMENT NOT YET PAID
      // =================================================

      if (!paidPayment) {

        console.log(
          `PAYMENT NOT YET PAID: ${order.order_number}`
        );


        return res.json({

          success: true,

          paid: false,

          payment_status:
            order.payment_status,

          status:
            order.status,

          message:
            "Payment has not been confirmed by PayMongo.",

        });

      }


      // =================================================
      // GET PAYMENT AMOUNT
      // =================================================

      const paidAmount =
        Number(
          paidPayment
            ?.attributes
            ?.amount
        );


      // =================================================
      // EXPECTED BAKEDROP AMOUNT
      // =================================================

      const expectedAmount =
        Math.round(
          Number(
            order.total_amount
          ) * 100
        );


      console.log(
        "PAYMENT AMOUNT CHECK:",
        {

          order:
            order.order_number,

          expected:
            expectedAmount,

          received:
            paidAmount,

        }
      );


      // =================================================
      // VERIFY AMOUNT
      // =================================================

      if (
        paidAmount !==
        expectedAmount
      ) {

        console.error(
          "PAYMENT AMOUNT MISMATCH:",
          {

            order:
              order.order_number,

            expected:
              expectedAmount,

            received:
              paidAmount,

          }
        );


        return res.status(400).json({

          success: false,

          paid: false,

          message:
            "Payment amount does not match the order total.",

        });

      }


      // =================================================
      // BEGIN PAYMENT CONFIRMATION TRANSACTION
      // =================================================

      let connection;


      try {

        connection =
          await db.getConnection();


        await connection.beginTransaction();


        // =================================================
        // LOCK ORDER
        // =================================================

        const [
          lockedOrders,
        ] =
          await connection.query(
            `
            SELECT
              id,
              payment_status,
              status

            FROM orders

            WHERE id = ?

            LIMIT 1

            FOR UPDATE
            `,
            [
              order.id,
            ]
          );


        if (
          lockedOrders.length ===
          0
        ) {

          throw new Error(
            "Order no longer exists."
          );

        }


        const lockedOrder =
          lockedOrders[0];


        // =================================================
        // PREVENT DUPLICATE VERIFICATION
        // =================================================

        if (
          lockedOrder.payment_status ===
          "paid"
        ) {

          await connection.rollback();


          return res.json({

            success: true,

            paid: true,

            payment_status:
              "paid",

            status:
              lockedOrder.status,

            message:
              "Order is already paid.",

          });

        }


        // =================================================
        // LOAD FLASH DEAL ORDER ITEMS
        // =================================================

        const [
          flashOrderItems,
        ] =
          await connection.query(
            `
            SELECT
              oi.flash_deal_id,
              oi.product_id,
              oi.quantity

            FROM order_items oi

            WHERE oi.order_id = ?

              AND oi.flash_deal_id
                IS NOT NULL

            FOR UPDATE
            `,
            [
              order.id,
            ]
          );


        // =================================================
        // VALIDATE + CONSUME FLASH DEAL INVENTORY
        // =================================================

        for (
          const item of flashOrderItems
        ) {

          const [
            dealRows,
          ] =
            await connection.query(
              `
              SELECT
                id,
                product_name,
                quantity,

                DATE_FORMAT(
                  deal_date,
                  '%Y-%m-%d'
                ) AS deal_date,

                is_available

              FROM flash_deals

              WHERE id = ?

              LIMIT 1

              FOR UPDATE
              `,
              [
                item.flash_deal_id,
              ]
            );


          if (
            dealRows.length ===
            0
          ) {

            throw new Error(
              "A Flash Deal attached to this order no longer exists."
            );

          }


          const deal =
            dealRows[0];


          // =================================================
          // FLASH DEAL DATE
          //
          // The SQL query above already returns deal_date
          // as YYYY-MM-DD, so we do NOT convert it through
          // JavaScript Date or UTC.
          // =================================================

          if (
            !deal.deal_date
          ) {

            throw new Error(
              `${deal.product_name} Flash Deal has expired.`
            );

          }


          // -------------------------------------------------
          // CHECK AVAILABILITY
          // -------------------------------------------------

          if (
            !Boolean(
              deal.is_available
            )
          ) {

            throw new Error(
              `${deal.product_name} Flash Deal is no longer available.`
            );

          }


          // -------------------------------------------------
          // CHECK REMAINING QUANTITY
          // -------------------------------------------------

          if (
            Number(
              deal.quantity
            ) <
            Number(
              item.quantity
            )
          ) {

            throw new Error(
              `${deal.product_name} no longer has enough Flash Deal stock.`
            );

          }


          // -------------------------------------------------
          // REDUCE FLASH DEAL INVENTORY
          // -------------------------------------------------

          const [
            updateDealResult,
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

                AND deal_date =
                  CURDATE()

                AND is_available =
                  TRUE

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
            updateDealResult.affectedRows ===
            0
          ) {

            throw new Error(
              `${deal.product_name} Flash Deal became unavailable while confirming payment.`
            );

          }

        }


        // =================================================
        // MARK ORDER AS PAID
        // =================================================

        await connection.query(
          `
          UPDATE orders

          SET

            payment_status =
              'paid',

            status =
              'confirmed'

          WHERE id = ?

            AND payment_status <>
              'paid'
          `,
          [
            order.id,
          ]
        );


        // =================================================
        // COMMIT
        // =================================================

        await connection.commit();


        // =================================================
        // SUCCESS LOG
        // =================================================

        console.log(
          "================================="
        );

        console.log(
          "PAYMENT VERIFIED SUCCESSFULLY"
        );

        console.log(
          "ORDER:",
          order.order_number
        );

        console.log(
          "ORDER ID:",
          order.id
        );

        console.log(
          "PAID AMOUNT:",
          paidAmount
        );

        console.log(
          "FLASH DEAL ITEMS:",
          flashOrderItems.length
        );

        console.log(
          "PAYMENT STATUS: paid"
        );

        console.log(
          "ORDER STATUS: confirmed"
        );

        console.log(
          "================================="
        );


        return res.json({

          success: true,

          paid: true,

          payment_status:
            "paid",

          status:
            "confirmed",

          message:
            "Payment verified and order marked as paid.",

        });


      } catch (
        transactionError
      ) {

        if (connection) {

          try {

            await connection.rollback();

          } catch (
            rollbackError
          ) {

            console.error(
              "PAYMENT ROLLBACK ERROR:",
              rollbackError
            );

          }

        }


        throw transactionError;


      } finally {

        if (connection) {
          connection.release();
        }

      }


    } catch (error) {

      console.error(
        "================================="
      );


      console.error(
        "VERIFY PAYMENT ERROR:"
      );


      console.error(
        error
      );


      console.error(
        "================================="
      );


      return res.status(500).json({

        success: false,

        paid: false,

        message:
          error.message ||
          "Unable to verify payment.",

      });

    }

  }
);


// =====================================================
// EXPORT
// =====================================================

module.exports = router;