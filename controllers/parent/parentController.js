const admin = require("../../config/firebase");
const pool = require("../../config/db");

const createFamilyMember = async (req, res) => {
  const {
    idToken,
    parentIdToken,
    name,
    phone_number,
    date_of_birth,
    gender,
    relation,
    home_location,
    door_no,
    floor_no,
    apartment_name,
    landmark,
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
          relation, home_location, door_no, floor_no, apartment_name, landmark,
          image, user_id
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *`;

      const values = [
        parent_id,
        name,
        phone_number,
        date_of_birth || null,
        gender || null,
        relation,
        home_location || null,
        door_no || null,
        floor_no || null,
        apartment_name || null,
        landmark || null,
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
    const user_id = idToken;

    const client = await pool.connect();
    try {
      const query = `
          SELECT 
            parent_id, name, phone_number, date_of_birth, gender,
            relation, home_location,
            door_no, floor_no, apartment_name, landmark,
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

const deleteParent = async (req, res) => {
  const { parent_id } = req.params;
  console.log("Deleting parent with ID:", parent_id);
  if (!parent_id) {
    return res.status(400).json({ success: false, error: "Missing parent_id" });
  }

  try {
    const client = await pool.connect();
    try {
      const query = `DELETE FROM parent WHERE parent_id = $1 RETURNING *`;
      const result = await client.query(query, [parent_id]);

      if (result.rowCount === 0) {
        return res
          .status(404)
          .json({ success: false, error: "Parent not found" });
      }

      return res.status(200).json({ success: true, message: "Parent deleted" });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error in deleteParent:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

const updateParent = async (req, res) => {
  const {
    name,
    phone_number,
    date_of_birth,
    gender,
    relation,
    home_location,
    door_no,
    floor_no,
    apartment_name,
    landmark,
  } = req.body;

  const { parent_id } = req.params;
  const imageFile = req.file;

  if (!parent_id) {
    return res.status(400).json({ success: false, error: "Missing parent_id" });
  }

  try {
    const client = await pool.connect();
    try {
      const query = `
          UPDATE parent SET
            name = $1,
            phone_number = $2,
            date_of_birth = $3,
            gender = $4,
            relation = $5,
            home_location = $6,
            door_no = $7,
            floor_no = $8,
            apartment_name = $9,
            landmark = $10,
            image = COALESCE($11, image)
          WHERE parent_id = $12
          RETURNING *
        `;

      const values = [
        name,
        phone_number,
        date_of_birth || null,
        gender || null,
        relation,
        home_location || null,
        door_no || null,
        floor_no || null,
        apartment_name || null,
        landmark || null,
        imageFile ? imageFile.buffer : null,
        parent_id,
      ];

      const result = await client.query(query, values);

      if (result.rowCount === 0) {
        return res
          .status(404)
          .json({ success: false, error: "Parent not found" });
      }

      return res.status(200).json({ success: true, parent: result.rows[0] });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error in updateParent:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

const getAllParents = async (req, res) => {
  try {
    const client = await pool.connect();
    try {
      const query = `
        SELECT 
          parent_id, name, phone_number, date_of_birth, gender,
          relation, home_location,
          encode(image, 'base64') as image,
          user_id
        FROM parent
      `;
      const result = await client.query(query);

      return res.status(200).json({
        success: true,
        parents: result.rows,
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error in getAllParents:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  createFamilyMember,
  getParentsByUser,
  getAllParents,
  deleteParent,
  updateParent,
};
