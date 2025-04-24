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
            hb.*, 
            pt.*
          FROM service_requests sr
          LEFT JOIN hospital_service_bookings hb
            ON sr.service_name = 'hospital_service'
            AND sr.service_reference_id::INTEGER = hb.hospital_service_id
          LEFT JOIN parent pt
            ON hb.parent_id = pt.parent_id
          WHERE sr.user_id = $1  AND sr.service_name = 'hospital_service'
        `;

    const result = await pool.query(query, [userId]);
    console.log(result.rows);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error("❌ Error in getAllServiceRequests:", err.message);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

const getAllHospitalServiceRequestsForAllUsers = async (req, res) => {
  try {
    console.log("📨 Fetching all hospital service requests for all users");

    const query = `
      SELECT 
        sr.request_id,
        sr.user_id,
        sr.service_name,
        sr.service_reference_id,
        sr.payment_status,
        hb.hospital_service_id,
        pt.parent_id,
        u.first_name AS user_first_name,
        u.last_name AS user_last_name,
        u.email AS user_email,
        hb.booking_date AS hospital_booking_date
      FROM service_requests sr
      LEFT JOIN hospital_service_bookings hb
        ON sr.service_name = 'hospital_service'
        AND sr.service_reference_id::INTEGER = hb.hospital_service_id
      LEFT JOIN parent pt
        ON hb.parent_id = pt.parent_id
      LEFT JOIN user u  
        ON sr.user_id = 47qQjcmwXTgxfZkJ7cti8PuxjUA3  
      WHERE sr.service_name = 'hospital_service'
    `;

    const result = await pool.query(query);
    console.log(result.rows);

    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error(
      "❌ Error in getAllHospitalServiceRequestsForAllUsers:",
      err.message
    );
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

const getAllPropertyCareServiceRequests = async (req, res) => {
  try {
    const { userId } = req.params;

    console.log(
      "🏡 Fetching all property care service requests for user:",
      userId
    );

    const query = `
      SELECT 
        sr.*, 
        pcb.*
      FROM service_requests sr
      LEFT JOIN property_care_bookings pcb
        ON sr.service_name = 'property_care_service'
        AND sr.service_reference_id::INTEGER = pcb.property_care_id
      WHERE sr.user_id = $1
        AND sr.service_name = 'property_care_service'
    `;

    const result = await pool.query(query, [userId]);
    console.log("🚀 Result of property care service requests:", result.rows);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error(
      "❌ Error in getAllPropertyCareServiceRequests:",
      err.message
    );
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

const getAllhelperServiceRequests = async (req, res) => {
  try {
    const { userId } = req.params;

    console.log(
      "🏡 Fetching all property care service requests for user:",
      userId
    );

    const query = `
      SELECT 
        sr.*, 
        hsb.*
      FROM service_requests sr
      LEFT JOIN helper_service_bookings hsb
        ON sr.service_name = 'helper_service'
        AND sr.service_reference_id::INTEGER = hsb.helper_service_id
      WHERE sr.user_id = $1
        AND sr.service_name = 'helper_service'
    `;

    const result = await pool.query(query, [userId]);
    console.log("🚀 Result of helper service requests:", result.rows);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error(
      "❌ Error in getAllPropertyCareServiceRequests:",
      err.message
    );
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

const getAllSpecialRequestServiceRequests = async (req, res) => {
  try {
    const { userId } = req.params;

    const query = `
      SELECT 
        sr.*, 
        srsb.*
      FROM service_requests sr
      LEFT JOIN special_request_service_bookings srsb
        ON sr.service_name = 'special_requests'
        AND sr.service_reference_id::INTEGER = srsb.special_request_service_id
      WHERE sr.user_id = $1
        AND sr.service_name = 'special_requests'
    `;

    const result = await pool.query(query, [userId]);
    console.log("🚀 Result of helper special requests:", result.rows);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error(
      "❌ Error in getAllSpecialRequestServiceRequests:",
      err.message
    );
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

const getAllCombinedServiceRequests = async (req, res) => {
  try {
    const query = `
      SELECT 
        sr.request_id, sr.user_id, sr.service_name, sr.service_reference_id, 
        sr.payment_status, hb.hospital_service_id, pt.parent_id, 
        NULL as extra, 'hospital_service' as service_type
      FROM service_requests sr
      LEFT JOIN hospital_service_bookings hb
        ON sr.service_name = 'hospital_service' AND sr.service_reference_id::INTEGER = hb.hospital_service_id
      LEFT JOIN parent pt ON hb.parent_id = pt.parent_id
      WHERE sr.service_name = 'hospital_service'

      UNION ALL

      SELECT 
        sr.request_id, sr.user_id, sr.service_name, sr.service_reference_id, 
        sr.payment_status, pcb.property_care_id, NULL as parent_id, 
        NULL as extra, 'property_care_service' as service_type
      FROM service_requests sr
      LEFT JOIN property_care_bookings pcb
        ON sr.service_name = 'property_care_service' AND sr.service_reference_id::INTEGER = pcb.property_care_id
      WHERE sr.service_name = 'property_care_service'

      UNION ALL

      SELECT 
        sr.request_id, sr.user_id, sr.service_name, sr.service_reference_id, 
        sr.payment_status, hsb.helper_service_id, NULL as parent_id, 
        NULL as extra, 'helper_service' as service_type
      FROM service_requests sr
      LEFT JOIN helper_service_bookings hsb
        ON sr.service_name = 'helper_service' AND sr.service_reference_id::INTEGER = hsb.helper_service_id
      WHERE sr.service_name = 'helper_service'

      UNION ALL

      SELECT 
        sr.request_id, sr.user_id, sr.service_name, sr.service_reference_id, 
        sr.payment_status, srsb.special_request_service_id, NULL as parent_id, 
        NULL as extra, 'special_requests' as service_type
      FROM service_requests sr
      LEFT JOIN special_request_service_bookings srsb
        ON sr.service_name = 'special_requests' AND sr.service_reference_id::INTEGER = srsb.special_request_service_id
      WHERE sr.service_name = 'special_requests'
    `;

    const result = await pool.query(query);

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (err) {
    console.error("❌ Error in getAllCombinedServiceRequests:", err.message);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

module.exports = {
  createServiceRequest,
  getAllServiceRequests,
  getAllPropertyCareServiceRequests,
  getAllhelperServiceRequests,
  getAllSpecialRequestServiceRequests,
  deleteServiceRequest,
  getAllCombinedServiceRequests,
  getAllHospitalServiceRequestsForAllUsers,
};
