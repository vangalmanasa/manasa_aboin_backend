const pool = require("../../config/db");

const createDriver = async (req, res) => {
  const client = await pool.connect();
  try {
    const {
      first_name,
      last_name,
      phone_number,
      email,
      profile_picture,
      license_number,
      license_expiry_date,
      vehicle_number,
      vehicle_model,
      vehicle_type,
      current_status,
      current_ride_start_time,
      estimated_ride_end_time,
      last_known_lat,
      last_known_lng,
    } = req.body;

    const query = `
      INSERT INTO driver (
        first_name, last_name, phone_number, email, profile_picture,
        license_number, license_expiry_date, vehicle_number, vehicle_model, vehicle_type,
        current_status, current_ride_start_time, estimated_ride_end_time,
        last_known_lat, last_known_lng
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9, $10,
        $11, $12, $13,
        $14, $15
      ) RETURNING *;
    `;

    const result = await client.query(query, [
      first_name,
      last_name,
      phone_number,
      email,
      profile_picture,
      license_number,
      license_expiry_date,
      vehicle_number,
      vehicle_model,
      vehicle_type,
      current_status || "free",
      current_ride_start_time,
      estimated_ride_end_time,
      last_known_lat,
      last_known_lng,
    ]);

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("❌ Error in createDriver:", error.message);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    client.release();
  }
};

// Get driver details by ID
const getDriverById = async (req, res) => {
  try {
    console.log("Fetching driver by ID...");
    const { id } = req.params;
    const result = await pool.query(`SELECT * FROM driver WHERE id = $1`, [id]);

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Driver not found" });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("❌ Error in getDriverById:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update driver details
const updateDriver = async (req, res) => {
  try {
    const { id } = req.params;
    const fields = [];
    const values = [];
    let index = 1;

    for (const [key, value] of Object.entries(req.body)) {
      fields.push(`${key} = $${index++}`);
      values.push(value);
    }

    if (fields.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No fields to update" });
    }

    values.push(id);
    const query = `
      UPDATE driver SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${index} RETURNING *
    `;

    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Driver not found" });
    }

    res.json({
      success: true,
      message: "Driver updated",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("❌ Error in updateDriver:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete driver
const deleteDriver = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `DELETE FROM driver WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Driver not found" });
    }

    res.json({ success: true, message: "Driver deleted" });
  } catch (error) {
    console.error("❌ Error in deleteDriver:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

const getFreeDrivers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, first_name, last_name FROM driver WHERE current_status = 'free'`
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("❌ Error in getFreeDrivers:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  createDriver,
  getDriverById,
  updateDriver,
  deleteDriver,
  getFreeDrivers,
};
