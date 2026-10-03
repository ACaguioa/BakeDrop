const express = require("express");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        message: "Message is required.",
      });
    }

    res.json({
      reply: "BakeDrop AI received your message.",
    });

  } catch (error) {
    console.error("Chat error:", error);

    res.status(500).json({
      message: "Something went wrong.",
    });
  }
});

module.exports = router;