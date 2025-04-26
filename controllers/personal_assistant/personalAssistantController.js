const pool = require("../../config/db");

// Create Personal Assistant
const createPersonalAssistant = async (req, res) => {
  const client = await pool.connect();
  try {
    const {
      full_name,
      phone_number,
      email,
      current_status,
      current_service_start_time,
      estimated_service_end_time,
    } = req.body;

    const photo = req.file;

    await client.query("BEGIN");

    const insertQuery = `
      INSERT INTO personal_assistants (
        full_name,
        phone_number,
        email,
        current_status,
        current_service_start_time,
        estimated_service_end_time,
        photo
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING personal_assistant_id
    `;

    const result = await client.query(insertQuery, [
      full_name,
      phone_number,
      email,
      current_status || "free",
      current_service_start_time || null,
      estimated_service_end_time || null,
      photo ? photo.buffer : null,
    ]);

    await client.query("COMMIT");

    res.status(201).json({
      success: true,
      message: "Personal Assistant created successfully.",
      personal_assistant_id: result.rows[0].personal_assistant_id,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error in createPersonalAssistant:", error.message);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    client.release();
  }
};

// Get Personal Assistant by ID
const getPersonalAssistantById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT * FROM personal_assistants WHERE personal_assistant_id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("Error in getPersonalAssistantById:", err.message);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

// Update Personal Assistant
const updatePersonalAssistant = async (req, res) => {
  try {
    const { id } = req.params;
    const fields = [];
    const values = [];
    let index = 1;

    for (const [key, value] of Object.entries(req.body)) {
      fields.push(`${key} = $${index++}`);
      values.push(value);
    }

    if (req.file) {
      fields.push(`photo = $${index++}`);
      values.push(req.file.buffer);
    }

    if (fields.length === 0) {
      return res
        .status(400)
        .json({ success: false, error: "No fields to update" });
    }

    values.push(id);

    const query = `
      UPDATE personal_assistants
      SET ${fields.join(", ")}
      WHERE personal_assistant_id = $${index}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    res.json({
      success: true,
      message: "Updated successfully",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("Error in updatePersonalAssistant:", err.message);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

// Delete Personal Assistant
const deletePersonalAssistant = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `DELETE FROM personal_assistants WHERE personal_assistant_id = $1 RETURNING *`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    res.json({ success: true, message: "Deleted successfully" });
  } catch (err) {
    console.error("Error in deletePersonalAssistant:", err.message);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

module.exports = {
  createPersonalAssistant,
  getPersonalAssistantById,
  updatePersonalAssistant,
  deletePersonalAssistant,
};
