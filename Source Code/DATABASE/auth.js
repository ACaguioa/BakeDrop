const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const db = require("../config/db");

const router = express.Router();

/* =====================================================
   JWT HELPER
===================================================== */

function createToken(user) {
  return jwt.sign(
    {
      id: user.id,
      role: user.role,
      email: user.email
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d"
    }
  );
}


/* =====================================================
   GOOGLE PASSPORT STRATEGY
===================================================== */

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL
    },

    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;

        const first_name =
          profile.name?.givenName ||
          profile.displayName?.split(" ")[0] ||
          "Google";

        const last_name =
          profile.name?.familyName ||
          "";

        if (!email) {
          return done(
            null,
            false,
            {
              message:
                "Google account does not have an email address."
            }
          );
        }

        /* ---------------------------------------------
           CHECK IF USER ALREADY EXISTS
        --------------------------------------------- */

        const [existingUsers] = await db.query(
          `SELECT
            id,
            first_name,
            last_name,
            email,
            password_hash,
            role,
            auth_provider,
            is_active
           FROM users
           WHERE email = ?`,
          [email]
        );


        /* ---------------------------------------------
           EXISTING USER
        --------------------------------------------- */

        if (existingUsers.length > 0) {
          const user = existingUsers[0];

          if (!user.is_active) {
            return done(
              null,
              false,
              {
                message:
                  "This account has been deactivated."
              }
            );
          }

          /*
            If the account was created using email/password,
            don't automatically convert it to Google.
          */

          if (user.auth_provider === "local") {
            return done(
              null,
              false,
              {
                message:
                  "An account with this email already exists. Please use email and password to log in."
              }
            );
          }

          return done(null, user);
        }


        /* ---------------------------------------------
           CREATE NEW GOOGLE USER
        --------------------------------------------- */

        const [result] = await db.query(
          `INSERT INTO users
          (
            first_name,
            last_name,
            email,
            password_hash,
            auth_provider,
            phone
          )
          VALUES (?, ?, ?, NULL, 'google', NULL)`,
          [
            first_name,
            last_name,
            email
          ]
        );

        const newUser = {
          id: result.insertId,
          first_name,
          last_name,
          email,
          role: "customer",
          auth_provider: "google",
          is_active: 1
        };

        return done(null, newUser);

      } catch (error) {
        console.error(
          "Google authentication error:",
          error
        );

        return done(error, null);
      }
    }
  )
);


/* =====================================================
   SIGNUP
===================================================== */

router.post("/signup", async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      password,
      phone
    } = req.body || {};

    if (
      !first_name ||
      !last_name ||
      !email ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message:
          "First name, last name, email, and password are required."
      });
    }

    const [existingUser] = await db.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Email is already registered."
      });
    }

    const passwordHash = await bcrypt.hash(
      password,
      10
    );

    const [result] = await db.query(
      `INSERT INTO users
      (
        first_name,
        last_name,
        email,
        password_hash,
        auth_provider,
        phone
      )
      VALUES (?, ?, ?, ?, 'local', ?)`,
      [
        first_name,
        last_name,
        email,
        passwordHash,
        phone || null
      ]
    );

    res.status(201).json({
      success: true,
      message: "Account created successfully.",
      user_id: result.insertId
    });

  } catch (error) {
    console.error(
      "Signup error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Something went wrong while creating the account."
    });
  }
});


/* =====================================================
   LOGIN
===================================================== */

router.post("/login", async (req, res) => {
  try {
    const {
      email,
      password
    } = req.body || {};

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail.endsWith("@gmail.com")) {
      return res.status(400).json({
        success: false,
        message: "Please use a valid Gmail address."
      });
}

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Email and password are required."
      });
    }

    const [users] = await db.query(
      `SELECT
        id,
        first_name,
        last_name,
        email,
        password_hash,
        role,
        auth_provider
       FROM users
       WHERE email = ?
       AND is_active = TRUE`,
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password."
      });
    }

    const user = users[0];

    if (user.auth_provider !== "local") {
      return res.status(401).json({
        success: false,
        message:
          "Please use Google Login for this account."
      });
    }

    const passwordMatch =
      await bcrypt.compare(
        password,
        user.password_hash
      );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password."
      });
    }

    const token = createToken(user);

    res.json({
      success: true,
      message: "Login successful.",
      token,
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error(
      "Login error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Something went wrong while logging in."
    });
  }
});


/* =====================================================
   GOOGLE LOGIN
===================================================== */

router.get(
  "/google",
  passport.authenticate(
    "google",
    {
      scope: [
        "profile",
        "email"
      ],
      session: false
    }
  )
);


/* =====================================================
   GOOGLE CALLBACK
===================================================== */

router.get(
  "/google/callback",

  passport.authenticate(
    "google",
    {
      failureRedirect:
        "http://localhost:5173/login?google=failed",
      session: false
    }
  ),

  (req, res) => {
    try {
      const user = req.user;

      const token = createToken(user);

      const userData = encodeURIComponent(
        JSON.stringify({
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          role: user.role
        })
      );

      res.redirect(
        `http://localhost:5173/login?token=${token}&user=${userData}`
      );

    } catch (error) {
      console.error(
        "Google callback error:",
        error
      );

      res.redirect(
        "http://localhost:5173/login?google=failed"
      );
    }
  }
);


module.exports = router;