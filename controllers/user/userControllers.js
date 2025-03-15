const admin = require("../../config/firebase").default;
const pool = require("../../config/db").default;

// Function to verify Firebase OTP and store user
const verifyUser = async (req, res) => {
  const { idToken, phoneNumber } = req.body;

  if (!idToken || !phoneNumber) {
    return res.status(400).json({ success: false, error: "Missing idToken or phoneNumber" });
  }

  try {
    // Verify Firebase ID Token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // Store User in PostgreSQL
    const client = await pool.connect();

    try {
      // Check if user already exists
      const checkUser = await client.query("SELECT * FROM users WHERE uid = $1", [uid]);

      if (checkUser.rows.length === 0) {
        await client.query("INSERT INTO users (uid, phone_number) VALUES ($1, $2)", [uid, phoneNumber]);
      }

      res.json({ success: true, uid });
    } finally {
      client.release();
    }
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Function to store additional user details
const saveUserDetails = async (req, res) => {
  const { idToken, firstName, lastName, sender, occupation, location, email, dob, service_id } = req.body;

  if (!idToken || !firstName || !lastName || !sender || !occupation || !location || !email || !dob) {
    return res.status(400).json({ success: false, error: "Missing required fields" });
  }

  try {
    // Verify Firebase ID Token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // Save user details in PostgreSQL
    const client = await pool.connect();
    try {
      await client.query(
        `INSERT INTO users (uid, first_name, last_name, sender, occupation, location, email, dob, service_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (uid) DO UPDATE SET 
           first_name = EXCLUDED.first_name,
           last_name = EXCLUDED.last_name,
           sender = EXCLUDED.sender,
           occupation = EXCLUDED.occupation,
           location = EXCLUDED.location,
           email = EXCLUDED.email,
           dob = EXCLUDED.dob;`, 
        [uid, firstName, lastName, sender, occupation, location, email, dob, service_id || null]
      );

      res.json({ success: true, uid });
    } finally {
      client.release();
    }
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Export functions
module.exports = { verifyUser, saveUserDetails };
