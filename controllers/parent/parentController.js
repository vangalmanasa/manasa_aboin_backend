const admin = require("../../config/firebase");
const pool = require("../../config/db");

const createFamilyMember = async (req, res) => {
  const {
    idToken, // user who is adding the family member
    parentIdToken, // newly verified parent identity
    name,
    phone_number,
    date_of_birth,
    gender,
    relation,
    home_location,
  } = req.body;

  const imageFile = req.file;

  if (!idToken || !parentIdToken || !name || !phone_number || !relation) {
    return res.status(400).json({
      success: false,
      error: "Missing required fields",
    });
  }

  try {
    // Decode the user's ID token
    const userDecoded = await admin.auth().verifyIdToken(idToken);
    const user_id = userDecoded.uid;

    // Decode the parent's ID token
    const parentDecoded = await admin.auth().verifyIdToken(parentIdToken);
    const parent_id = parentDecoded.uid;

    const client = await pool.connect();
    try {
      const insertQuery = `
        INSERT INTO parent (
          parent_id, name, phone_number, date_of_birth, gender,
          relation, home_location, image, user_id
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *`;

      const values = [
        parent_id,
        name,
        phone_number,
        date_of_birth || null,
        gender || null,
        relation,
        home_location || null,
        imageFile ? imageFile.buffer : null,
        user_id,
      ];

      const result = await client.query(insertQuery, values);

      return res.status(201).json({ success: true, parent: result.rows[0] });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error in createFamilyMember:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
};

const getParentsByUser = async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({ success: false, error: "Missing idToken" });
  }

  try {
    // Verify and decode the Firebase user ID token
    const decoded = await admin.auth().verifyIdToken(idToken);
    const user_id = decoded.uid;

    const client = await pool.connect();
    try {
      const query = `
          SELECT 
            parent_id, name, phone_number, date_of_birth, gender,
            relation, home_location,
            encode(image, 'base64') as image -- return image as base64
          FROM parent
          WHERE user_id = $1
        `;

      const result = await client.query(query, [user_id]);

      return res.status(200).json({
        success: true,
        parents: result.rows,
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error in getParentsByUser:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  createFamilyMember,
  getParentsByUser,
};
