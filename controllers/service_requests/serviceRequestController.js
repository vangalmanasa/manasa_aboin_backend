const pool = require("../../config/db");

const createServiceRequest = async (req, res) => {
  try {
    const {
      user_id,
      service_name,
      service_reference_id,
      payment_status = "pending",
    } = req.body;

    if (!user_id || !service_name || !service_reference_id) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      });
    }

    const result = await pool.query(
      `INSERT INTO service_requests (
          user_id, service_name, service_reference_id, payment_status
        ) VALUES ($1, $2, $3, $4)
        RETURNING *`,
      [user_id, service_name, service_reference_id, payment_status]
    );

    res.status(201).json({
      success: true,
      message: "Service request created successfully",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("Error in createServiceRequest:", err.message);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

// Get all service requests for a user
const getAllServiceRequests = async (req, res) => {
  try {
    const { userId } = req.params;

    console.log("📨 Fetching all service requests for user:", userId);
    const query = `
        SELECT 
          sr.*,
          hb.*
        FROM service_requests sr
        LEFT JOIN hospital_service_bookings hb
          ON sr.service_name = 'hospital_service'
          AND sr.service_reference_id::INTEGER = hb.hospital_service_id
        WHERE sr.user_id = $1
        
      `;

    const result = await pool.query(query, [userId]);

    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error("❌ Error in getAllServiceRequests:", err.message);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

// Delete a service request
const deleteServiceRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const result = await pool.query(
      `DELETE FROM service_requests WHERE request_id = $1 RETURNING *`,
      [requestId]
    );

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Request not found" });
    }

    res.json({ success: true, message: "Service request deleted" });
  } catch (err) {
    console.error("Error in deleteServiceRequest:", err.message);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

module.exports = {
  createServiceRequest,
  getAllServiceRequests,
  deleteServiceRequest,
};
