const pool = require("../../config/db");

const createRealEstateAgent = async (req, res) => {
  const client = await pool.connect();
  try {
    const {
      name,
      phone,
      email,
      experience_years,
      agency_name,
      specialization,
      current_status,
      current_service_start_time,
      estimated_service_end_time,
    } = req.body;

    const imageFile = req.file;

    const result = await client.query(
      `INSERT INTO real_estate_agents (
        name, phone, email, experience_years, agency_name, specialization,
        current_status, current_service_start_time, estimated_service_end_time, image
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING agent_id`,
      [
        name,
        phone,
        email,
        experience_years,
        agency_name,
        specialization,
        current_status,
        current_service_start_time,
        estimated_service_end_time,
        imageFile ? imageFile.buffer : null,
      ]
    );

    res.status(201).json({
      success: true,
      agent_id: result.rows[0].agent_id,
    });
  } catch (err) {
    console.error("❌ Error in createRealEstateAgent:", err.message);
    res.status(500).json({ success: false, error: err.message });
  } finally {
    client.release();
  }
};

const getRealEstateAgentById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT * FROM real_estate_agents WHERE agent_id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Agent not found" });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("Error in getRealEstateAgentById:", err.message);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

const updateRealEstateAgent = async (req, res) => {
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
      fields.push(`image = $${index++}`);
      values.push(req.file.buffer);
    }

    if (fields.length === 0) {
      return res
        .status(400)
        .json({ success: false, error: "No fields to update" });
    }

    values.push(id);

    const query = `
      UPDATE real_estate_agents
      SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP
      WHERE agent_id = $${index}
      RETURNING *`;

    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Agent not found" });
    }

    res.json({
      success: true,
      message: "Agent updated",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("Error in updateRealEstateAgent:", err.message);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

const deleteRealEstateAgent = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `DELETE FROM real_estate_agents WHERE agent_id = $1 RETURNING *`,
      [id]
    );

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Agent not found" });
    }

    res.json({ success: true, message: "Agent deleted" });
  } catch (err) {
    console.error("Error in deleteRealEstateAgent:", err.message);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

const getAllRealEstateAgents = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT agent_id, name FROM real_estate_agents ORDER BY name ASC`
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error("Error in getAllRealEstateAgents:", err.message);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

module.exports = {
  createRealEstateAgent,
  getRealEstateAgentById,
  updateRealEstateAgent,
  deleteRealEstateAgent,
  getAllRealEstateAgents,
};
