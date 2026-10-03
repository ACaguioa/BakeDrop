const express = require("express");

const router = express.Router();

let lastRequestTime = 0;

// =====================================================
// SEARCH ADDRESS
// =====================================================

router.get("/search", async (req, res) => {
  try {
    const query = String(
      req.query.q || ""
    ).trim();

    if (query.length < 3) {
      return res.status(400).json({
        message:
          "Please enter at least 3 characters.",
      });
    }

    // Keep requests approximately 1 second apart
    const now = Date.now();

    const difference =
      now - lastRequestTime;

    if (difference < 1000) {
      await new Promise((resolve) =>
        setTimeout(
          resolve,
          1000 - difference
        )
      );
    }

    lastRequestTime = Date.now();

    const searchParams =
      new URLSearchParams({
        q: query,
        format: "jsonv2",
        addressdetails: "1",
        limit: "5",
        countrycodes: "ph",
      });

    const url =
      `https://nominatim.openstreetmap.org/search?${searchParams.toString()}`;

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent":
          "BakeDrop/1.0 (Capstone Project)",
      },
    });

    if (!response.ok) {
      return res.status(502).json({
        message:
          "Address search service is unavailable.",
      });
    }

    const results =
      await response.json();

    return res.json({
      results,
    });

  } catch (error) {
    console.error(
      "GEOCODE ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to search address.",
    });
  }
});

module.exports = router;