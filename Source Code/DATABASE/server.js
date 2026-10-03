const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./config/db");

const passport = require("passport");

// Routes
const authRoutes = require("./routes/auth");
const addressRoutes = require("./routes/addresses");
const adminRoutes = require("./routes/admin");
const geocodeRoutes = require("./routes/geocode");
const orderRoutes = require("./routes/orders");
const productRoutes = require("./routes/products");
const paymongoRoutes = require("./routes/paymongo");
const riderRoutes = require("./routes/riderRoutes");
  

const chatRoutes = require("./routes/chat");

const flashDealRoutes = require("./routes/flashDealRoutes");
  

// Middleware
const authenticateToken = require("./middleware/authMiddleware");
const adminOnly = require("./middleware/adminMiddleware");

const app = express();



// =====================================================
// DATABASE
// =====================================================

app.locals.db = db;


// =====================================================
// GLOBAL MIDDLEWARE
// =====================================================

app.use(cors());



// =====================================================
// JSON BODY PARSER
// =====================================================

app.use(express.json());

app.use(passport.initialize());


// =====================================================
// API ROUTES
// =====================================================

app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/geocode", geocodeRoutes);

app.use("/api/admin/riders", riderRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/addresses", addressRoutes);


app.use("/api/chat", chatRoutes);

app.use(
  "/api/flash-deals",
  flashDealRoutes
);

// PayMongo checkout creation
app.use("/api/paymongo", paymongoRoutes);




// =====================================================
// TEST ROUTES
// =====================================================

app.get("/", (req, res) => {
  res.json({
    message: "BakeDrop backend is running!"
  });
});


app.get("/api/test-db", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT 1 AS result");

    res.json({
      success: true,
      message: "MySQL connection successful!",
      result: rows[0].result
    });

  } catch (error) {
    console.error("Database error:", error);

    res.status(500).json({
      success: false,
      message: "MySQL connection failed.",
      error: error.message
    });
  }
});


app.get(
  "/api/admin-test",
  authenticateToken,
  adminOnly,
  (req, res) => {
    res.json({
      success: true,
      message: "Admin access granted!",
      user: req.user
    });
  }
);


app.get(
  "/api/protected-test",
  authenticateToken,
  (req, res) => {
    res.json({
      success: true,
      message: "JWT authentication is working!",
      user: req.user
    });
  }
);


// =====================================================
// ERROR HANDLER
// =====================================================

app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err);

  res.status(500).json({
    success: false,
    message: "Internal server error.",
    error: err.message
  });
});


// =====================================================
// START SERVER
// =====================================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`BakeDrop server running on port ${PORT}`);
});