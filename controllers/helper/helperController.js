const pool = require("../../config/db");

const createHelper = async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      age,
      gender,
      address,
      skills,
      experience,
      current_status,
      current_service_start_time,
      estimated_service_end_time,
    } = req.body;

    const query = `
      INSERT INTO helpers (
        name, phone, email, age, gender, address, skills, experience,
        current_status, current_service_start_time, estimated_service_end_time
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      RETURNING *`;

    const values = [
      name,
      phone,
      email,
      age,
      gender,
      address,
      skills,
      experience,
      current_status || "free",
      current_service_start_time,
      estimated_service_end_time,
    ];

    const result = await pool.query(query, values);

    res.status(201).json({
      success: true,
      message: "Helper created successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("❌ Error creating helper:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

const getHelperById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "SELECT * FROM helpers WHERE helper_id = $1",
      [id]
    );

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Helper not found" });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("❌ Error fetching helper:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

const updateHelper = async (req, res) => {
  try {
    const { id } = req.params;
    const fields = [];
    const values = [];
    let index = 1;

    for (const [key, value] of Object.entries(req.body)) {
      fields.push(`${key} = $${index++}`);
      values.push(value);
    }

    values.push(id);

    const query = `
      UPDATE helpers
      SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP
      WHERE helper_id = $${index}
      RETURNING *`;

    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Helper not found" });
    }

    res.json({
      success: true,
      message: "Helper updated successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("❌ Error updating helper:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

const deleteHelper = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "DELETE FROM helpers WHERE helper_id = $1 RETURNING *",
      [id]
    );

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Helper not found" });
    }

    res.json({ success: true, message: "Helper deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting helper:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

const getFreeHelpers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT helper_id, name FROM helpers WHERE current_status = 'free'`
    );

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("❌ Error fetching free helpers:", error.message);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

module.exports = {
  createHelper,
  getHelperById,
  updateHelper,
  deleteHelper,
  getFreeHelpers,
};
