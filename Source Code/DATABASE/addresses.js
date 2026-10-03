const express = require("express");
const router = express.Router();

const db = require("../config/db");
const authenticateToken = require("../middleware/authMiddleware");


// =====================================================
// GET SAVED ADDRESSES
// =====================================================

router.get(
  "/",
  authenticateToken,
  async (req, res) => {
    try {

      const userId = req.user.id;

      const [addresses] = await db.query(
        `
        SELECT
          id,
          label,
          recipient_name,
          phone,
          address_line,
          city,
          province,
          latitude,
          longitude
        FROM user_addresses
        WHERE user_id = ?
        ORDER BY id DESC
        `,
        [userId]
      );

      res.json({
        success: true,
        addresses
      });

    } catch (error) {

      console.error("Get addresses error:", error);

      res.status(500).json({
        success: false,
        message: "Failed to load saved addresses."
      });

    }
  }
);


// =====================================================
// ADD SAVED ADDRESS
// =====================================================

router.post(
  "/",
  authenticateToken,
  async (req, res) => {
    try {

      const userId = req.user.id;

      const {
        label,
        recipient_name,
        phone,
        address_line,
        city,
        province,
        latitude,
        longitude
      } = req.body;


      // =========================
      // VALIDATION
      // =========================

      if (
        !recipient_name ||
        !phone ||
        !address_line ||
        !city ||
        !province
      ) {
        return res.status(400).json({
          success: false,
          message: "Please complete all required address information."
        });
      }


      // =========================
      // INSERT ADDRESS
      // =========================

      const [result] = await db.query(
        `
        INSERT INTO user_addresses (
          user_id,
          label,
          recipient_name,
          phone,
          address_line,
          city,
          province,
          latitude,
          longitude
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          userId,
          label || null,
          recipient_name,
          phone,
          address_line,
          city,
          province,
          latitude ?? null,
          longitude ?? null
        ]
      );


      // =========================
      // GET CREATED ADDRESS
      // =========================

      const [addresses] = await db.query(
        `
        SELECT
          id,
          label,
          recipient_name,
          phone,
          address_line,
          city,
          province,
          latitude,
          longitude
        FROM user_addresses
        WHERE id = ?
        `,
        [result.insertId]
      );


      res.status(201).json({
        success: true,
        message: "Address saved successfully.",
        address: addresses[0]
      });

    } catch (error) {

      console.error("Save address error:", error);

      res.status(500).json({
        success: false,
        message: "Failed to save address."
      });

    }
  }
);


module.exports = router;