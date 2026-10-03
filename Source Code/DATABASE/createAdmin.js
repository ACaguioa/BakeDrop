const bcrypt = require("bcrypt");
const db = require("./config/db");

async function createAdmin() {
  try {
    const passwordHash = await bcrypt.hash("Admin1234!", 10);

    const [result] = await db.query(
      `INSERT INTO users
      (first_name, last_name, email, password_hash, auth_provider, role)
      VALUES (?, ?, ?, ?, 'local', 'admin')`,
      [
        "BakeDrop",
        "Admin",
        "admin@bakedrop.com",
        passwordHash
      ]
    );

    console.log("Admin account created!");
    console.log("Admin ID:", result.insertId);

  } catch (error) {
    console.error("Error creating admin:", error);
  } finally {
    await db.end();
  }
}

createAdmin();