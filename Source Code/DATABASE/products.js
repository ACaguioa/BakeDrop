const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

const authenticateToken = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");


// =====================================================
// PRODUCT IMAGE UPLOAD SETTINGS
// =====================================================

const uploadDirectory = path.join(
  __dirname,
  "../uploads/products"
);


// Create upload folder automatically
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, {
    recursive: true,
  });
}


// =====================================================
// MULTER STORAGE
// =====================================================

const storage = multer.diskStorage({

  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },

  filename: (req, file, cb) => {

    const extension =
      path.extname(file.originalname)
        .toLowerCase();

    const productId =
      req.params.id;

    const filename =
      `product-${productId}-${Date.now()}${extension}`;

    cb(null, filename);
  },

});


// =====================================================
// FILE VALIDATION
// =====================================================

const upload = multer({

  storage,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/jpg",
    ];

    if (
      allowedTypes.includes(
        file.mimetype
      )
    ) {

      cb(null, true);

    } else {

      cb(
        new Error(
          "Only JPG, JPEG, PNG, and WEBP images are allowed."
        )
      );

    }

  },

});

/* =====================================================
   GET ALL PRODUCTS
   GET /api/products
   GET /api/products?date=2026-10-05

   IMPORTANT:
   Product availability is based on the CUSTOMER'S
   SELECTED SCHEDULE DATE, not order creation date.
===================================================== */

router.get("/", async (req, res) => {
  try {
    const db = req.app.locals.db;

    /*
      If a date is supplied:
        /api/products?date=2026-10-05

      use that date.

      Otherwise default to today's date.
    */
    const requestedDate =
      req.query.date ||
      new Date().toISOString().split("T")[0];


    /* -------------------------------------------------
       VALIDATE DATE FORMAT
    ------------------------------------------------- */

    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(
        requestedDate
      )
    ) {
      return res.status(400).json({
        message:
          "Invalid schedule date. Use YYYY-MM-DD.",
      });
    }


    /* =================================================
       GET PRODUCTS
    ================================================= */

    const [products] = await db.query(
      `
      SELECT
        p.id,
        p.category_id,
        c.name AS category_name,
        p.name,
        p.description,
        p.price,
        p.unit_description,
        p.image,
        p.customizable,
        p.daily_order_limit,
        p.is_available,

        /*
          PRODUCT-SPECIFIC CAPACITY
          FOR THE SELECTED SCHEDULE DATE
        */
        COALESCE(
          psc.maximum_quantity,
          0
        ) AS maximum_quantity,

        COALESCE(
          psc.is_disabled,
          0
        ) AS product_date_disabled,


        /*
          HOW MANY UNITS OF THIS PRODUCT
          ARE ALREADY RESERVED FOR THE
          SELECTED SCHEDULE DATE
        */
        COALESCE(
          (
            SELECT SUM(oi.quantity)

            FROM order_items oi

            INNER JOIN orders o
              ON o.id = oi.order_id

            WHERE oi.product_id = p.id

              AND DATE(o.order_date) = ?

              AND o.status <> 'cancelled'
          ),
          0
        ) AS reserved_quantity,


        /*
          TOTAL ORDERS RESERVED
          FOR THE SELECTED SCHEDULE DATE
        */
        (
          SELECT COUNT(*)

          FROM orders o2

          WHERE DATE(o2.order_date) = ?

            AND o2.status <> 'cancelled'
        ) AS reserved_orders,


        /*
          OVERALL DATE CAPACITY

          If no schedule_capacity record exists,
          default to 30 orders.
        */
        COALESCE(
          (
            SELECT
              sc.maximum_orders

            FROM schedule_capacity sc

            WHERE sc.schedule_date = ?

            LIMIT 1
          ),
          30
        ) AS maximum_orders,


        /*
          WHETHER THE ENTIRE DATE
          HAS BEEN DISABLED
        */
        COALESCE(
          (
            SELECT
              sc.is_disabled

            FROM schedule_capacity sc

            WHERE sc.schedule_date = ?

            LIMIT 1
          ),
          0
        ) AS schedule_disabled


      FROM products p


      LEFT JOIN categories c
        ON c.id = p.category_id


      /*
        GET PRODUCT-SPECIFIC CAPACITY
        FOR THE SELECTED DATE
      */
      LEFT JOIN product_schedule_capacity psc
        ON psc.product_id = p.id

        AND psc.schedule_date = ?


      ORDER BY p.id ASC
      `,
      [
        requestedDate,
        requestedDate,
        requestedDate,
        requestedDate,
        requestedDate,
      ]
    );


    /* =================================================
       FORMAT PRODUCTS
    ================================================= */

    const formattedProducts =
      products.map((product) => {

        /*
          PRODUCT DATE CAPACITY
        */
        const maximumQuantity =
          Number(
            product.maximum_quantity || 0
          );


        /*
          PRODUCT QUANTITY ALREADY
          RESERVED FOR SELECTED DATE
        */
        const reservedQuantity =
          Number(
            product.reserved_quantity || 0
          );


        /*
          OVERALL DAILY ORDER CAPACITY
        */
        const maximumOrders =
          Number(
            product.maximum_orders || 0
          );


        /*
          TOTAL ORDERS ALREADY
          RESERVED FOR SELECTED DATE
        */
        const reservedOrders =
          Number(
            product.reserved_orders || 0
          );


        /*
          PRODUCT REMAINING QUANTITY

          0 = unlimited
        */
        const remainingQuantity =
          maximumQuantity > 0
            ? Math.max(
                maximumQuantity -
                  reservedQuantity,
                0
              )
            : null;


        /*
          REMAINING TOTAL ORDER SLOTS
        */
        const remainingOrderSlots =
          Math.max(
            maximumOrders -
              reservedOrders,
            0
          );


        /*
          PRODUCT DISABLED FOR
          THIS SPECIFIC DATE
        */
        const productDateDisabled =
          Boolean(
            product.product_date_disabled
          );


        /*
          ENTIRE DATE DISABLED
        */
        const scheduleDisabled =
          Boolean(
            product.schedule_disabled
          );


        /*
          PRODUCT CAPACITY REACHED
        */
        const productLimitReached =
          maximumQuantity > 0 &&
          remainingQuantity === 0;


        /*
          OVERALL DATE CAPACITY REACHED
        */
        const overallCapacityReached =
          remainingOrderSlots === 0;


        /*
          FINAL CUSTOMER-FACING AVAILABILITY
        */
        const canOrder =
          Boolean(
            product.is_available
          ) &&
          !productDateDisabled &&
          !scheduleDisabled &&
          !productLimitReached &&
          !overallCapacityReached;


        return {
          /* -----------------------------------------
             BASIC PRODUCT DATA
          ----------------------------------------- */

          id:
            product.id,

          category_id:
            product.category_id,

          category_name:
            product.category_name,

          name:
            product.name,

          description:
            product.description,

          price:
            Number(
              product.price
            ),

          unit_description:
            product.unit_description,

          image:
            product.image,

          customizable:
            Boolean(
              product.customizable
            ),

          is_available:
            Boolean(
              product.is_available
            ),


          /* -----------------------------------------
             SELECTED SCHEDULE DATE
          ----------------------------------------- */

          schedule_date:
            requestedDate,


          /* -----------------------------------------
             LEGACY PRODUCT LIMIT
             Kept for backwards compatibility.

             This is NOT used for preorder capacity.
          ----------------------------------------- */

          daily_order_limit:
            Number(
              product.daily_order_limit || 0
            ),


          /* -----------------------------------------
             PRODUCT-SPECIFIC DATE CAPACITY
          ----------------------------------------- */

          maximum_quantity:
            maximumQuantity,

          reserved_quantity:
            reservedQuantity,

          remaining_quantity:
            remainingQuantity,

          product_date_disabled:
            productDateDisabled,

          product_limit_reached:
            productLimitReached,


          /* -----------------------------------------
             OVERALL DATE CAPACITY
          ----------------------------------------- */

          maximum_orders:
            maximumOrders,

          reserved_orders:
            reservedOrders,

          remaining_order_slots:
            remainingOrderSlots,

          schedule_disabled:
            scheduleDisabled,

          overall_capacity_reached:
            overallCapacityReached,


          /* -----------------------------------------
             FINAL ORDER STATUS
          ----------------------------------------- */

          can_order:
            canOrder,
        };
      });


    /* =================================================
       SCHEDULE SUMMARY
    ================================================= */

    const firstProduct =
      formattedProducts[0];


    const scheduleSummary = {
      date:
        requestedDate,

      maximum_orders:
        firstProduct
          ? firstProduct.maximum_orders
          : 30,

      reserved_orders:
        firstProduct
          ? firstProduct.reserved_orders
          : 0,

      remaining_order_slots:
        firstProduct
          ? firstProduct.remaining_order_slots
          : 30,

      disabled:
        firstProduct
          ? firstProduct.schedule_disabled
          : false,
    };


    /* =================================================
       RESPONSE
    ================================================= */

    return res.json({
      success: true,

      schedule:
        scheduleSummary,

      products:
        formattedProducts,
    });


  } catch (error) {

    console.error(
      "GET PRODUCTS ERROR:",
      error
    );


    return res.status(500).json({
      success: false,

      message:
        "Failed to load products.",
    });
  }
});


/* =====================================================
   ADMIN — UPDATE OLD PRODUCT DAILY ORDER LIMIT
   PUT /api/products/:id/daily-limit

   NOTE:
   This route is kept for compatibility with your
   existing admin system.

   The NEW preorder capacity system uses:
   product_schedule_capacity

   instead of this field.
===================================================== */

router.put(
  "/:id/daily-limit",
  authenticateToken,
  adminOnly,
  async (req, res) => {

    try {

      const db = req.app.locals.db;

      const productId =
        Number(req.params.id);

      const dailyLimit =
        Number(
          req.body.daily_order_limit
        );


      /* -------------------------------------------------
         VALIDATE PRODUCT ID
      ------------------------------------------------- */

      if (
        !Number.isInteger(productId) ||
        productId <= 0
      ) {

        return res.status(400).json({
          message:
            "Invalid product ID.",
        });

      }


      /* -------------------------------------------------
         VALIDATE DAILY LIMIT

         0 = unlimited
      ------------------------------------------------- */

      if (
        !Number.isInteger(
          dailyLimit
        ) ||
        dailyLimit < 0
      ) {

        return res.status(400).json({
          message:
            "Daily order limit must be a whole number greater than or equal to 0.",
        });

      }


      /* -------------------------------------------------
         CHECK PRODUCT EXISTS
      ------------------------------------------------- */

      const [products] =
        await db.query(
          `
          SELECT
            id,
            name
          FROM products
          WHERE id = ?
          LIMIT 1
          `,
          [productId]
        );


      if (
        products.length === 0
      ) {

        return res.status(404).json({
          message:
            "Product not found.",
        });

      }


      /* -------------------------------------------------
         UPDATE OLD LIMIT
      ------------------------------------------------- */

      await db.query(
        `
        UPDATE products

        SET
          daily_order_limit = ?

        WHERE id = ?
        `,
        [
          dailyLimit,
          productId,
        ]
      );


      /* -------------------------------------------------
         RETURN UPDATED PRODUCT
      ------------------------------------------------- */

      const [
        updatedProducts
      ] = await db.query(
        `
        SELECT
          id,
          name,
          daily_order_limit,
          is_available

        FROM products

        WHERE id = ?

        LIMIT 1
        `,
        [productId]
      );


      return res.json({

        success: true,

        message:
          "Daily order limit updated successfully.",

        product:
          updatedProducts[0],
      });


    } catch (error) {

      console.error(
        "UPDATE DAILY LIMIT ERROR:",
        error
      );


      return res.status(500).json({

        success: false,

        message:
          "Failed to update daily order limit.",
      });

    }

  }
);

// =====================================================
// ADMIN — UPLOAD / CHANGE PRODUCT IMAGE
// PUT /api/products/:id/image
// =====================================================

router.put(
  "/:id/image",
  authenticateToken,
  adminOnly,
  upload.single("image"),
  async (req, res) => {

    try {

      const db =
        req.app.locals.db;

      const productId =
        Number(req.params.id);


      // -------------------------------------------------
      // VALIDATE PRODUCT ID
      // -------------------------------------------------

      if (
        !Number.isInteger(productId) ||
        productId <= 0
      ) {

        return res.status(400).json({
          success: false,
          message:
            "Invalid product ID.",
        });

      }


      // -------------------------------------------------
      // CHECK PRODUCT
      // -------------------------------------------------

      const [products] =
        await db.query(
          `
          SELECT
            id,
            name,
            image
          FROM products
          WHERE id = ?
          LIMIT 1
          `,
          [productId]
        );


      if (
        products.length === 0
      ) {

        return res.status(404).json({
          success: false,
          message:
            "Product not found.",
        });

      }


      // -------------------------------------------------
      // CHECK FILE
      // -------------------------------------------------

      if (!req.file) {

        return res.status(400).json({
          success: false,
          message:
            "Please select an image.",
        });

      }


      const product =
        products[0];


      // -------------------------------------------------
      // DELETE OLD UPLOADED IMAGE
      // -------------------------------------------------

      if (
        product.image &&
        product.image.startsWith(
          "/uploads/products/"
        )
      ) {

        const oldFilename =
          path.basename(
            product.image
          );

        const oldFilePath =
          path.join(
            uploadDirectory,
            oldFilename
          );


        if (
          fs.existsSync(
            oldFilePath
          )
        ) {

          fs.unlinkSync(
            oldFilePath
          );

        }

      }


      // -------------------------------------------------
      // NEW IMAGE PATH
      // -------------------------------------------------

      const imagePath =
        `/uploads/products/${req.file.filename}`;


      // -------------------------------------------------
      // SAVE IMAGE PATH
      // -------------------------------------------------

      await db.query(
        `
        UPDATE products

        SET image = ?

        WHERE id = ?
        `,
        [
          imagePath,
          productId,
        ]
      );


      // -------------------------------------------------
      // RETURN UPDATED PRODUCT
      // -------------------------------------------------

      const [
        updatedProducts
      ] = await db.query(
        `
        SELECT
          id,
          name,
          price,
          image,
          is_available

        FROM products

        WHERE id = ?

        LIMIT 1
        `,
        [productId]
      );


      return res.json({

        success: true,

        message:
          "Product image updated successfully.",

        product:
          updatedProducts[0],

      });


    } catch (error) {

      console.error(
        "UPLOAD PRODUCT IMAGE ERROR:",
        error
      );


      return res.status(500).json({

        success: false,

        message:
          error.message ||
          "Failed to upload product image.",

      });

    }

  }
);

module.exports = router;