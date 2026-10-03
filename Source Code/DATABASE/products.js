const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

const authenticateToken =
  require("../middleware/authMiddleware");

const adminOnly =
  require("../middleware/adminMiddleware");


// =====================================================
// DATABASE
// =====================================================

const getDatabase = (req) => {
  return req.app.locals.db;
};


// =====================================================
// PRODUCT IMAGE DIRECTORIES
// =====================================================

// Existing admin-uploaded images
const uploadDirectory =
  path.join(
    __dirname,
    "../uploads/products"
  );


// New product images
// Saves directly to:
//
// BAKEDROP/src/assets/products
const frontendProductDirectory =
  path.join(
    __dirname,
    "../../src/assets/products"
  );


// =====================================================
// CREATE DIRECTORIES
// =====================================================

if (
  !fs.existsSync(
    uploadDirectory
  )
) {
  fs.mkdirSync(
    uploadDirectory,
    {
      recursive: true,
    }
  );
}


if (
  !fs.existsSync(
    frontendProductDirectory
  )
) {
  fs.mkdirSync(
    frontendProductDirectory,
    {
      recursive: true,
    }
  );
}


// =====================================================
// IMAGE FILE FILTER
// =====================================================

const imageFileFilter = (
  req,
  file,
  cb
) => {

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

    cb(
      null,
      true
    );

  } else {

    cb(
      new Error(
        "Only JPG, JPEG, PNG, and WEBP images are allowed."
      )
    );

  }

};


// =====================================================
// EXISTING MULTER STORAGE
//
// Used by:
// PUT /api/products/:id/image
//
// Existing products keep using:
// backend/uploads/products
// =====================================================

const storage =
  multer.diskStorage({

    destination: (
      req,
      file,
      cb
    ) => {

      cb(
        null,
        uploadDirectory
      );

    },


    filename: (
      req,
      file,
      cb
    ) => {

      const extension =
        path.extname(
          file.originalname
        ).toLowerCase();


      const productId =
        req.params.id;


      const filename =
        `product-${productId}-${Date.now()}${extension}`;


      cb(
        null,
        filename
      );

    },

  });


// =====================================================
// EXISTING IMAGE UPLOAD
// =====================================================

const upload =
  multer({

    storage,

    limits: {
      fileSize:
        5 * 1024 * 1024,
    },

    fileFilter:
      imageFileFilter,

  });


// =====================================================
// NEW PRODUCT IMAGE STORAGE
//
// New products are saved to:
//
// BAKEDROP/src/assets/products
// =====================================================

const newProductStorage =
  multer.diskStorage({

    destination: (
      req,
      file,
      cb
    ) => {

      cb(
        null,
        frontendProductDirectory
      );

    },


    filename: (
      req,
      file,
      cb
    ) => {

      const extension =
        path.extname(
          file.originalname
        ).toLowerCase();


      const safeName =
        String(
          req.body.name ||
          "product"
        )
          .trim()
          .toLowerCase()
          .replace(
            /[^a-z0-9]+/g,
            "-"
          )
          .replace(
            /^-+|-+$/g,
            ""
          );


      const filename =
        `${safeName || "product"}-${Date.now()}${extension}`;


      cb(
        null,
        filename
      );

    },

  });


// =====================================================
// NEW PRODUCT IMAGE UPLOAD
// =====================================================

const uploadNewProduct =
  multer({

    storage:
      newProductStorage,

    limits: {

      fileSize:
        5 * 1024 * 1024,

    },

    fileFilter:
      imageFileFilter,

  });


// =====================================================
// DELETE UPLOADED FILE HELPER
// =====================================================

const deleteUploadedFile = (
  file
) => {

  if (
    !file ||
    !file.path
  ) {
    return;
  }


  if (
    fs.existsSync(
      file.path
    )
  ) {

    try {

      fs.unlinkSync(
        file.path
      );

    } catch (error) {

      console.error(
        "FAILED TO DELETE UPLOADED FILE:",
        error
      );

    }

  }

};


// =====================================================
// GET ALL PRODUCTS
//
// GET /api/products
// GET /api/products?date=2026-10-05
//
// Customer-facing product route
// =====================================================

router.get(
  "/",
  async (
    req,
    res
  ) => {

    try {

      const db =
        getDatabase(req);


      const requestedDate =
        req.query.date ||
        new Date()
          .toISOString()
          .split("T")[0];


      // ===============================================
      // VALIDATE DATE
      // ===============================================

      if (
        !/^\d{4}-\d{2}-\d{2}$/.test(
          requestedDate
        )
      ) {

        return res.status(400).json({

          success:
            false,

          message:
            "Invalid schedule date. Use YYYY-MM-DD.",

        });

      }


      // ===============================================
      // GET PRODUCTS
      // ===============================================

      const [
        products
      ] = await db.query(
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


          COALESCE(
            psc.maximum_quantity,
            0
          ) AS maximum_quantity,


          COALESCE(
            psc.is_disabled,
            0
          ) AS product_date_disabled,


          COALESCE(
            (
              SELECT
                SUM(
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
          ) AS reserved_quantity,


          (
            SELECT
              COUNT(*)

            FROM orders o2

            WHERE
              DATE(
                o2.order_date
              ) = ?

              AND o2.status <>
                'cancelled'
          ) AS reserved_orders,


          COALESCE(
            (
              SELECT
                sc.maximum_orders

              FROM schedule_capacity sc

              WHERE
                sc.schedule_date =
                  ?

              LIMIT 1
            ),
            30
          ) AS maximum_orders,


          COALESCE(
            (
              SELECT
                sc.is_disabled

              FROM schedule_capacity sc

              WHERE
                sc.schedule_date =
                  ?

              LIMIT 1
            ),
            0
          ) AS schedule_disabled


        FROM products p


        LEFT JOIN categories c
          ON c.id =
            p.category_id


        LEFT JOIN
          product_schedule_capacity psc

          ON psc.product_id =
            p.id

          AND psc.schedule_date =
            ?


        ORDER BY
          p.id ASC
        `,
        [

          requestedDate,

          requestedDate,

          requestedDate,

          requestedDate,

          requestedDate,

        ]
      );


      // ===============================================
      // FORMAT PRODUCTS
      // ===============================================

      const formattedProducts =
        products.map(
          (
            product
          ) => {

            const maximumQuantity =
              Number(
                product.maximum_quantity ||
                0
              );


            const reservedQuantity =
              Number(
                product.reserved_quantity ||
                0
              );


            const maximumOrders =
              Number(
                product.maximum_orders ||
                0
              );


            const reservedOrders =
              Number(
                product.reserved_orders ||
                0
              );


            const remainingQuantity =
              maximumQuantity > 0

                ? Math.max(
                    maximumQuantity -
                      reservedQuantity,
                    0
                  )

                : null;


            const remainingOrderSlots =
              Math.max(
                maximumOrders -
                  reservedOrders,
                0
              );


            const productDateDisabled =
              Boolean(
                product.product_date_disabled
              );


            const scheduleDisabled =
              Boolean(
                product.schedule_disabled
              );


            const productLimitReached =
              maximumQuantity > 0 &&
              remainingQuantity === 0;


            const overallCapacityReached =
              remainingOrderSlots === 0;


            const canOrder =
              Boolean(
                product.is_available
              ) &&
              !productDateDisabled &&
              !scheduleDisabled &&
              !productLimitReached &&
              !overallCapacityReached;


            return {

              id:
                Number(
                  product.id
                ),

              category_id:
                Number(
                  product.category_id
                ),

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

              schedule_date:
                requestedDate,

              daily_order_limit:
                Number(
                  product.daily_order_limit ||
                  0
                ),

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

              can_order:
                canOrder,

            };

          }
        );


      // ===============================================
      // SCHEDULE SUMMARY
      // ===============================================

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


      // ===============================================
      // RESPONSE
      // ===============================================

      return res.json({

        success:
          true,

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

        success:
          false,

        message:
          "Failed to load products.",

      });

    }

  }
);


// =====================================================
// GET ACTIVE PRODUCT CATEGORIES
//
// GET /api/products/categories
//
// Used by:
// AdminProducts.jsx
// =====================================================

router.get(
  "/categories",
  async (
    req,
    res
  ) => {

    try {

      const db =
        getDatabase(req);


      const [
        categories
      ] = await db.query(
        `
        SELECT

          id,

          name,

          description,

          is_active

        FROM categories

        WHERE
          is_active = 1

        ORDER BY
          id ASC
        `
      );


      return res.json({

        success:
          true,

        categories:
          categories.map(
            (
              category
            ) => ({

              id:
                Number(
                  category.id
                ),

              name:
                category.name,

              description:
                category.description,

              is_active:
                Boolean(
                  category.is_active
                ),

            })
          ),

      });


    } catch (error) {

      console.error(
        "GET PRODUCT CATEGORIES ERROR:",
        error
      );


      return res.status(500).json({

        success:
          false,

        message:
          "Failed to load product categories.",

      });

    }

  }
);


// =====================================================
// ADMIN — CREATE NEW PRODUCT
//
// POST /api/products
//
// FormData:
//
// category_id
// name
// description
// unit_description
// customizable
// price
// is_available
// image
//
// New image is saved to:
//
// BAKEDROP/src/assets/products
// =====================================================

router.post(
  "/",
  authenticateToken,
  adminOnly,
  uploadNewProduct.single(
    "image"
  ),
  async (
    req,
    res
  ) => {

    try {

      const db =
        getDatabase(req);


      // ===============================================
      // GET FORM DATA
      // ===============================================

      const {

        category_id,

        name,

        description,

        unit_description,

        customizable,

        price,

        is_available,

      } = req.body;


      // ===============================================
      // VALIDATE CATEGORY
      // ===============================================

      const categoryId =
        Number(
          category_id
        );


      if (
        !Number.isInteger(
          categoryId
        ) ||
        categoryId <= 0
      ) {

        deleteUploadedFile(
          req.file
        );


        return res.status(400).json({

          success:
            false,

          message:
            "A valid product category is required.",

        });

      }


      // ===============================================
      // CHECK CATEGORY
      // ===============================================

      const [
        categories
      ] = await db.query(
        `
        SELECT

          id,

          name

        FROM categories

        WHERE
          id = ?

          AND is_active = 1

        LIMIT 1
        `,
        [
          categoryId
        ]
      );


      if (
        categories.length ===
        0
      ) {

        deleteUploadedFile(
          req.file
        );


        return res.status(400).json({

          success:
            false,

          message:
            "Selected category does not exist or is inactive.",

        });

      }


      // ===============================================
      // VALIDATE NAME
      // ===============================================

      const productName =
        String(
          name || ""
        ).trim();


      if (
        !productName
      ) {

        deleteUploadedFile(
          req.file
        );


        return res.status(400).json({

          success:
            false,

          message:
            "Product name is required.",

        });

      }


      // ===============================================
      // VALIDATE DESCRIPTION
      // ===============================================

      const productDescription =
        String(
          description || ""
        ).trim();


      if (
        !productDescription
      ) {

        deleteUploadedFile(
          req.file
        );


        return res.status(400).json({

          success:
            false,

          message:
            "Product description is required.",

        });

      }


      // ===============================================
      // UNIT DESCRIPTION
      // ===============================================

      const productUnitDescription =
        String(
          unit_description || ""
        ).trim();


      // ===============================================
      // PRICE
      // ===============================================

      const productPrice =
        Number(
          price
        );


      if (
        !Number.isFinite(
          productPrice
        ) ||
        productPrice < 0
      ) {

        deleteUploadedFile(
          req.file
        );


        return res.status(400).json({

          success:
            false,

          message:
            "A valid product price is required.",

        });

      }


      // ===============================================
      // IMAGE
      // ===============================================

      if (
        !req.file
      ) {

        return res.status(400).json({

          success:
            false,

          message:
            "Product image is required.",

        });

      }


      // ===============================================
      // CUSTOMIZABLE
      // ===============================================

      const isCustomizable =
        customizable ===
          "true" ||

        customizable ===
          true ||

        customizable ===
          "1" ||

        customizable ===
          1;


      // ===============================================
      // AVAILABILITY
      // ===============================================

      const available =
        is_available ===
          "true" ||

        is_available ===
          true ||

        is_available ===
          "1" ||

        is_available ===
          1;


      // ===============================================
      // IMAGE DATABASE PATH
      // ===============================================

      const imagePath =
        `/src-assets/products/${req.file.filename}`;


      // ===============================================
      // INSERT PRODUCT
      //
      // daily_order_limit remains 0 because
      // your current system uses schedule capacity.
      // ===============================================

      const [
        result
      ] = await db.query(
        `
        INSERT INTO products
        (
          category_id,

          name,

          description,

          price,

          unit_description,

          image,

          customizable,

          daily_order_limit,

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

          ?,

          ?
        )
        `,
        [

          categoryId,

          productName,

          productDescription,

          productPrice,

          productUnitDescription ||
            null,

          imagePath,

          isCustomizable
            ? 1
            : 0,

          0,

          available
            ? 1
            : 0,

        ]
      );


      // ===============================================
      // GET CREATED PRODUCT
      // ===============================================

      const [
        products
      ] = await db.query(
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

          p.created_at,

          p.updated_at

        FROM products p

        LEFT JOIN categories c
          ON c.id =
            p.category_id

        WHERE
          p.id = ?

        LIMIT 1
        `,
        [
          result.insertId
        ]
      );


      if (
        products.length ===
        0
      ) {

        deleteUploadedFile(
          req.file
        );


        return res.status(500).json({

          success:
            false,

          message:
            "Product was created but could not be retrieved.",

        });

      }


      const product =
        products[0];


      // ===============================================
      // RESPONSE
      // ===============================================

      return res.status(201).json({

        success:
          true,

        message:
          "Product created successfully.",

        product: {

          ...product,

          id:
            Number(
              product.id
            ),

          category_id:
            Number(
              product.category_id
            ),

          price:
            Number(
              product.price
            ),

          customizable:
            Boolean(
              product.customizable
            ),

          daily_order_limit:
            Number(
              product.daily_order_limit
            ),

          is_available:
            Boolean(
              product.is_available
            ),

        },

      });


    } catch (error) {

      console.error(
        "CREATE PRODUCT ERROR:",
        error
      );


      // ===============================================
      // DELETE IMAGE IF DATABASE INSERT FAILED
      // ===============================================

      deleteUploadedFile(
        req.file
      );


      return res.status(500).json({

        success:
          false,

        message:
          error.message ||
          "Failed to create product.",

      });

    }

  }
);


// =====================================================
// ADMIN — UPDATE OLD PRODUCT DAILY ORDER LIMIT
//
// PUT /api/products/:id/daily-limit
// =====================================================

router.put(
  "/:id/daily-limit",
  authenticateToken,
  adminOnly,
  async (
    req,
    res
  ) => {

    try {

      const db =
        getDatabase(req);


      const productId =
        Number(
          req.params.id
        );


      const dailyLimit =
        Number(
          req.body.daily_order_limit
        );


      // ===============================================
      // VALIDATE PRODUCT ID
      // ===============================================

      if (
        !Number.isInteger(
          productId
        ) ||
        productId <= 0
      ) {

        return res.status(400).json({

          success:
            false,

          message:
            "Invalid product ID.",

        });

      }


      // ===============================================
      // VALIDATE DAILY LIMIT
      // ===============================================

      if (
        !Number.isInteger(
          dailyLimit
        ) ||
        dailyLimit < 0
      ) {

        return res.status(400).json({

          success:
            false,

          message:
            "Daily order limit must be a whole number greater than or equal to 0.",

        });

      }


      // ===============================================
      // CHECK PRODUCT
      // ===============================================

      const [
        products
      ] = await db.query(
        `
        SELECT

          id,

          name

        FROM products

        WHERE id = ?

        LIMIT 1
        `,
        [
          productId
        ]
      );


      if (
        products.length ===
        0
      ) {

        return res.status(404).json({

          success:
            false,

          message:
            "Product not found.",

        });

      }


      // ===============================================
      // UPDATE
      // ===============================================

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


      // ===============================================
      // RETURN UPDATED PRODUCT
      // ===============================================

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
        [
          productId
        ]
      );


      return res.json({

        success:
          true,

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

        success:
          false,

        message:
          "Failed to update daily order limit.",

      });

    }

  }
);


// =====================================================
// ADMIN — UPLOAD / CHANGE PRODUCT IMAGE
//
// PUT /api/products/:id/image
//
// Existing images continue to be saved to:
//
// backend/uploads/products
// =====================================================

router.put(
  "/:id/image",
  authenticateToken,
  adminOnly,
  upload.single(
    "image"
  ),
  async (
    req,
    res
  ) => {

    try {

      const db =
        getDatabase(req);


      const productId =
        Number(
          req.params.id
        );


      // ===============================================
      // VALIDATE PRODUCT ID
      // ===============================================

      if (
        !Number.isInteger(
          productId
        ) ||
        productId <= 0
      ) {

        deleteUploadedFile(
          req.file
        );


        return res.status(400).json({

          success:
            false,

          message:
            "Invalid product ID.",

        });

      }


      // ===============================================
      // CHECK PRODUCT
      // ===============================================

      const [
        products
      ] = await db.query(
        `
        SELECT

          id,

          name,

          image

        FROM products

        WHERE id = ?

        LIMIT 1
        `,
        [
          productId
        ]
      );


      if (
        products.length ===
        0
      ) {

        deleteUploadedFile(
          req.file
        );


        return res.status(404).json({

          success:
            false,

          message:
            "Product not found.",

        });

      }


      // ===============================================
      // CHECK FILE
      // ===============================================

      if (
        !req.file
      ) {

        return res.status(400).json({

          success:
            false,

          message:
            "Please select an image.",

        });

      }


      const product =
        products[0];


      // ===============================================
      // DELETE OLD UPLOADED IMAGE
      //
      // Only delete images from:
      //
      // backend/uploads/products
      //
      // New frontend images are NOT deleted here.
      // ===============================================

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

          try {

            fs.unlinkSync(
              oldFilePath
            );

          } catch (deleteError) {

            console.error(
              "FAILED TO DELETE OLD PRODUCT IMAGE:",
              deleteError
            );

          }

        }

      }


      // ===============================================
      // NEW IMAGE PATH
      // ===============================================

      const imagePath =
        `/uploads/products/${req.file.filename}`;


      // ===============================================
      // SAVE PATH
      // ===============================================

      await db.query(
        `
        UPDATE products

        SET
          image = ?

        WHERE id = ?
        `,
        [

          imagePath,

          productId,

        ]
      );


      // ===============================================
      // RETURN UPDATED PRODUCT
      // ===============================================

      const [
        updatedProducts
      ] = await db.query(
        `
        SELECT

          id,

          category_id,

          name,

          price,

          image,

          is_available

        FROM products

        WHERE id = ?

        LIMIT 1
        `,
        [
          productId
        ]
      );


      return res.json({

        success:
          true,

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


      // Delete newly uploaded file if
      // database update failed.
      deleteUploadedFile(
        req.file
      );


      return res.status(500).json({

        success:
          false,

        message:
          error.message ||
          "Failed to upload product image.",

      });

    }

  }
);


// =====================================================
// EXPORT
// =====================================================

module.exports = router;
