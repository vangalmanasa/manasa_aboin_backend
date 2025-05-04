const admin = require("../../config/firebase");
const pool = require("../../config/db");

// Verify Firebase ID Token and store user (signup/login)
const verifyUser = async (req, res) => {
  const { idToken, phoneNumber } = req.body;

  if (!idToken || !phoneNumber) {
    return res.status(400).json({
      success: false,
      error: "Missing idToken or phoneNumber",
    });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const user_id = decodedToken.uid;

    const client = await pool.connect();
    try {
      // Check if user already exists
      const userCheck = await client.query(
        'SELECT * FROM "user" WHERE user_id = $1',
        [user_id]
      );

      if (userCheck.rows.length === 0) {
        await client.query(
          'INSERT INTO "user" (user_id, phone_number) VALUES ($1, $2)',
          [user_id, phoneNumber]
        );
        console.log(`✅ New user inserted: ${user_id}`);
      } else {
        console.log(`ℹ️ User already exists: ${user_id}`);
      }

      return res.status(200).json({
        success: true,
        user_id,
        message: "User verified and saved.",
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("❌ Error in verifyUser:", error.message);
    return res.status(400).json({
      success: false,
      error: error.message || "Unknown error occurred",
    });
  }
};

const checkUserDetails = async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({ success: false, error: "Missing idToken" });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const user_id = decodedToken.uid;

    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT first_name, last_name, email, date_of_birth, gender, occupation 
         FROM "user" 
         WHERE user_id = $1`,
        [user_id]
      );

      if (result.rows.length === 0) {
        return res.json({ exists: false });
      }

      const user = result.rows[0];
      const allFieldsExist = Object.values(user).every((val) => val !== null);

      return res.json({ exists: allFieldsExist });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error in checkUserDetails:", error);
    return res.status(400).json({ success: false, error: error.message });
  }
};

// Store additional user details
const saveUserDetails = async (req, res) => {
  const {
    idToken,
    first_name,
    last_name,
    gender,
    occupation,
    location,
    email,
    date_of_birth,
  } = req.body;

  const user_image = req.file?.buffer; // 📸 Get image buffer

  if (!idToken) {
    return res.status(400).json({ success: false, error: "Missing idToken" });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const user_id = decodedToken.uid;

    const fields = [];
    const values = [];
    let index = 1;

    if (first_name) {
      fields.push(`first_name = $${index++}`);
      values.push(first_name);
    }
    if (last_name) {
      fields.push(`last_name = $${index++}`);
      values.push(last_name);
    }
    if (gender) {
      fields.push(`gender = $${index++}`);
      values.push(gender);
    }
    if (occupation) {
      fields.push(`occupation = $${index++}`);
      values.push(occupation);
    }
    if (location) {
      fields.push(`location = $${index++}`);
      values.push(location);
    }
    if (email) {
      fields.push(`email = $${index++}`);
      values.push(email);
    }
    if (date_of_birth) {
      fields.push(`date_of_birth = $${index++}`);
      values.push(date_of_birth);
    }
    if (user_image) {
      fields.push(`user_image = $${index++}`);
      values.push(user_image);
    }

    if (fields.length === 0) {
      return res
        .status(400)
        .json({ success: false, error: "No updatable fields provided" });
    }

    values.push(user_id);

    const query = `
      UPDATE "user"
      SET ${fields.join(", ")}
      WHERE user_id = $${index}
      RETURNING *`;

    const client = await pool.connect();
    try {
      const result = await client.query(query, values);
      if (result.rowCount === 0) {
        return res
          .status(404)
          .json({ success: false, error: "User not found" });
      }

      return res.json({
        success: true,
        message: "User details updated successfully",
        user: result.rows[0],
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error in saveUserDetails:", error);
    return res.status(400).json({ success: false, error: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query(`SELECT * FROM "user"`);
    client.release();
    return res.status(200).json({
      success: true,
      users: result.rows,
    });
  } catch (error) {
    console.error("Error fetching all users:", error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
};

const getUserProfile = async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({ success: false, error: "Missing idToken" });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const user_id = decodedToken.uid;

    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT user_id, phone_number, first_name, last_name, email, date_of_birth, gender, occupation, location, user_image
         FROM "user"
         WHERE user_id = $1`,
        [user_id]
      );

      if (result.rows.length === 0) {
        return res
          .status(404)
          .json({ success: false, error: "User not found" });
      }

      const user = result.rows[0];

      // Convert binary image to base64 string (if exists)
      if (user.user_image) {
        user.user_image = Buffer.from(user.user_image).toString("base64");
      }

      return res.status(200).json({ success: true, user });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error in getUserProfile:", error);
    return res.status(400).json({ success: false, error: error.message });
  }
};

module.exports = {
  verifyUser,
  saveUserDetails,
  getAllUsers,
  checkUserDetails,
  getUserProfile,
};
