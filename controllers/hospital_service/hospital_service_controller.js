const pool = require("../../config/db");

// Create hospital service
const createHospitalService = async (req, res) => {
  try {
    const {
      parent_id,
      hospital_name,
      hospital_location,
      purpose,
      pickup_date,
      pickup_time,
      pickup_location,
      no_of_persons,
      cab_type,
      service_hours,
      personal_request,
      claiming_insurance,
      needs_assistant,
    } = req.body;

    const images = req.files?.map((file) => file.buffer) || [];

    const result = await pool.query(
      `INSERT INTO hospital_service_bookings (
        parent_id, hospital_name, hospital_location, purpose,
        pickup_date, pickup_time, pickup_location, no_of_persons,
        cab_type, service_hours, personal_request,
        claiming_insurance, needs_assistant, images
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
      RETURNING *`,
      [
        parent_id,
        hospital_name,
        hospital_location,
        purpose,
        pickup_date,
        pickup_time,
        pickup_location,
        no_of_persons,
        cab_type,
        service_hours,
        personal_request,
        claiming_insurance,
        needs_assistant,
        images,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Hospital service created successfully",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("Error in createHospitalService:", err.message);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

// Get hospital service by ID
const getHospitalServiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT * FROM hospital_services WHERE hospital_service_id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("Error in getHospitalServiceById:", err.message);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

// Update hospital service (any field)
const updateHospitalService = async (req, res) => {
  try {
    const { id } = req.params;
    const fields = [];
    const values = [];
    let index = 1;

    for (const [key, value] of Object.entries(req.body)) {
      fields.push(`${key} = $${index++}`);
      values.push(value);
    }

    if (req.files?.length > 0) {
      fields.push(`images = $${index++}`);
      values.push(req.files.map((file) => file.buffer));
    }

    if (fields.length === 0) {
      return res
        .status(400)
        .json({ success: false, error: "No fields to update" });
    }

    values.push(id); // Add id for WHERE clause

    const query = `
      UPDATE hospital_services
      SET ${fields.join(", ")}
      WHERE hospital_service_id = $${index}
      RETURNING *`;

    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Service not found" });
    }

    res.json({
      success: true,
      message: "Hospital service updated",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("Error in updateHospitalService:", err.message);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

// Delete hospital service
const deleteHospitalService = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `DELETE FROM hospital_services WHERE hospital_service_id = $1 RETURNING *`,
      [id]
    );

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Service not found" });
    }

    res.json({
      success: true,
      message: "Hospital service deleted",
    });
  } catch (err) {
    console.error("Error in deleteHospitalService:", err.message);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

module.exports = {
  createHospitalService,
  getHospitalServiceById,
  updateHospitalService,
  deleteHospitalService,
};
