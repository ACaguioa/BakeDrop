const express = require("express");

const router = express.Router();

const authenticateToken =
  require("../middleware/authMiddleware");

const adminOnly =
  require("../middleware/adminMiddleware");


/* =====================================================
   GET ALL RIDERS
===================================================== */

router.get(
  "/",
  authenticateToken,
  adminOnly,
  async (req, res) => {
    try {
      const db = req.app.locals.db;

      const [riders] = await db.query(`
        SELECT
          id,
          name,
          phone,
          is_active,
          created_at,
          updated_at
        FROM riders
        ORDER BY
          is_active DESC,
          name ASC
      `);

      return res.json({
        success: true,
        riders
      });

    } catch (error) {
      console.error(
        "GET RIDERS ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Failed to load riders."
      });
    }
  }
);


/* =====================================================
   ADD RIDER
===================================================== */

router.post(
  "/",
  authenticateToken,
  adminOnly,
  async (req, res) => {
    try {
      const db = req.app.locals.db;

      const {
        name,
        phone
      } = req.body;

      const cleanName =
        String(name || "").trim();

      const cleanPhone =
        String(phone || "").trim();

      if (!cleanName) {
        return res.status(400).json({
          success: false,
          message:
            "Rider name is required."
        });
      }

      if (!cleanPhone) {
        return res.status(400).json({
          success: false,
          message:
            "Rider phone number is required."
        });
      }

      const [result] = await db.query(
        `
        INSERT INTO riders
        (
          name,
          phone,
          is_active
        )
        VALUES (?, ?, TRUE)
        `,
        [
          cleanName,
          cleanPhone
        ]
      );

      const [riders] = await db.query(
        `
        SELECT
          id,
          name,
          phone,
          is_active,
          created_at,
          updated_at
        FROM riders
        WHERE id = ?
        LIMIT 1
        `,
        [result.insertId]
      );

      return res.status(201).json({
        success: true,
        message:
          "Rider added successfully.",
        rider: riders[0]
      });

    } catch (error) {
      console.error(
        "ADD RIDER ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to add rider."
      });
    }
  }
);


/* =====================================================
   GET ORDERS FOR RIDER ASSIGNMENT
   ONLY OUT FOR DELIVERY
===================================================== */

router.get(
  "/orders",
  authenticateToken,
  adminOnly,
  async (req, res) => {
    try {
      const db = req.app.locals.db;

      const [orders] = await db.query(`
        SELECT
          o.id,
          o.order_number,
          o.user_id,

          CONCAT_WS(
            ' ',
            u.first_name,
            u.last_name
          ) AS customer_name,

          DATE_FORMAT(
            o.order_date,
            '%Y-%m-%d'
          ) AS order_date,

          o.order_time,
          o.delivery_address,
          o.total_amount,
          o.status,
          o.rider_id,

          r.name AS rider_name,
          r.phone AS rider_phone

        FROM orders o

        LEFT JOIN users u
          ON u.id = o.user_id

        LEFT JOIN riders r
          ON r.id = o.rider_id

        WHERE o.status = 'out_for_delivery'

        ORDER BY
          o.order_date ASC,
          o.order_time ASC,
          o.id ASC
      `);

      return res.json({
        success: true,
        orders
      });

    } catch (error) {
      console.error(
        "GET RIDER ASSIGNMENT ORDERS ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to load delivery orders."
      });
    }
  }
);


/* =====================================================
   UPDATE RIDER
===================================================== */

router.put(
  "/:id",
  authenticateToken,
  adminOnly,
  async (req, res) => {
    try {
      const db = req.app.locals.db;

      const riderId =
        Number(req.params.id);

      const {
        name,
        phone,
        is_active
      } = req.body;

      const cleanName =
        String(name || "").trim();

      const cleanPhone =
        String(phone || "").trim();

      if (
        !Number.isInteger(riderId) ||
        riderId <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid rider ID."
        });
      }

      if (!cleanName) {
        return res.status(400).json({
          success: false,
          message:
            "Rider name is required."
        });
      }

      if (!cleanPhone) {
        return res.status(400).json({
          success: false,
          message:
            "Rider phone number is required."
        });
      }

      await db.query(
        `
        UPDATE riders
        SET
          name = ?,
          phone = ?,
          is_active = ?
        WHERE id = ?
        `,
        [
          cleanName,
          cleanPhone,
          is_active ? 1 : 0,
          riderId
        ]
      );

      const [riders] = await db.query(
        `
        SELECT
          id,
          name,
          phone,
          is_active,
          created_at,
          updated_at
        FROM riders
        WHERE id = ?
        LIMIT 1
        `,
        [riderId]
      );

      if (riders.length === 0) {
        return res.status(404).json({
          success: false,
          message:
            "Rider not found."
        });
      }

      return res.json({
        success: true,
        message:
          "Rider updated successfully.",
        rider: riders[0]
      });

    } catch (error) {
      console.error(
        "UPDATE RIDER ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to update rider."
      });
    }
  }
);


/* =====================================================
   ASSIGN / REASSIGN / UNASSIGN RIDER
===================================================== */

router.put(
  "/orders/:orderId/assign",
  authenticateToken,
  adminOnly,
  async (req, res) => {
    try {
      const db = req.app.locals.db;

      const orderId =
        Number(req.params.orderId);

      const riderId =
        req.body.rider_id === null ||
        req.body.rider_id === "" ||
        typeof req.body.rider_id ===
          "undefined"
          ? null
          : Number(req.body.rider_id);

      if (
        !Number.isInteger(orderId) ||
        orderId <= 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid order ID."
        });
      }

      if (
        riderId !== null &&
        (
          !Number.isInteger(riderId) ||
          riderId <= 0
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid rider ID."
        });
      }


      /* =============================================
         CHECK ORDER
      ============================================= */

      const [orders] = await db.query(
        `
        SELECT
          id,
          status
        FROM orders
        WHERE id = ?
        LIMIT 1
        `,
        [orderId]
      );

      if (orders.length === 0) {
        return res.status(404).json({
          success: false,
          message:
            "Order not found."
        });
      }

      if (
        orders[0].status !==
        "out_for_delivery"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Riders can only be assigned to orders that are out for delivery."
        });
      }


      /* =============================================
         CHECK RIDER
      ============================================= */

      if (riderId !== null) {
        const [riders] =
          await db.query(
            `
            SELECT
              id,
              name,
              phone,
              is_active
            FROM riders
            WHERE id = ?
            LIMIT 1
            `,
            [riderId]
          );

        if (riders.length === 0) {
          return res.status(404).json({
            success: false,
            message:
              "Rider not found."
          });
        }

        if (!riders[0].is_active) {
          return res.status(400).json({
            success: false,
            message:
              "This rider is inactive and cannot be assigned."
          });
        }
      }


      /* =============================================
         UPDATE ORDER
      ============================================= */

      await db.query(
        `
        UPDATE orders
        SET rider_id = ?
        WHERE id = ?
        `,
        [
          riderId,
          orderId
        ]
      );


      /* =============================================
         RETURN UPDATED ORDER
      ============================================= */

      const [updatedOrders] =
        await db.query(
          `
          SELECT
            o.id,
            o.order_number,
            o.rider_id,

            r.name AS rider_name,
            r.phone AS rider_phone

          FROM orders o

          LEFT JOIN riders r
            ON r.id = o.rider_id

          WHERE o.id = ?
          LIMIT 1
          `,
          [orderId]
        );

      return res.json({
        success: true,

        message:
          riderId === null
            ? "Rider assignment removed."
            : "Rider assigned successfully.",

        order:
          updatedOrders[0]
      });

    } catch (error) {
      console.error(
        "ASSIGN RIDER ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to assign rider."
      });
    }
  }
);


module.exports = router;