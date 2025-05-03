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
        u.user_id,
        u.first_name AS user_first_name,
        u.last_name AS user_last_name,
        u.gender AS user_gender,
        u.occupation AS user_occupation,
        u.location AS user_location,
        u.email AS user_email,
        u.date_of_birth AS user_date_of_birth,
        u.phone_number AS user_phone_number,
        u.user_image,

        p.parent_id,
        p.name AS parent_name,
        p.phone_number AS parent_phone_number,
        p.date_of_birth AS parent_date_of_birth,
        p.gender AS parent_gender,
        p.relation AS parent_relation,
        p.home_location AS parent_home_location,
        p.image AS parent_image,

        hsb.hospital_service_id,
        hsb.hospital_name,
        hsb.hospital_location,
        hsb.purpose,
        hsb.needs_assistant,
        hsb.pickup_date,
        hsb.pickup_time,
        hsb.pickup_location,
        hsb.no_of_persons,
        hsb.cab_type,
        hsb.service_hours,
        hsb.personal_request,
        hsb.claiming_insurance,
        hsb.images AS hospital_images,
        hsb.created_at AS hospital_booking_created_at,
        hsb.user_id AS booked_by_user_id,
        hsb.pickuplatitude,
        hsb.pickuplongitude,
        hsb.droplatitude,
        hsb.droplongitude
      FROM
        hospital_service_bookings hsb
      JOIN
        "user" u ON hsb.user_id = u.user_id
      JOIN
        parent p ON hsb.parent_id = p.parent_id
      WHERE
        hsb.user_id = p.user_id;
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

const getAllPropertyCareServiceRequestsForAllUsers = async (req, res) => {
  try {
    console.log("🏡 Fetching all property care service requests for all users");

    const query = `
      SELECT *
      FROM service_requests sr
      JOIN "user" u ON sr.user_id = u.user_id
      JOIN property_care_bookings pcb 
        ON sr.service_name = 'property_care_service'
        AND sr.service_reference_id::INT = pcb.property_care_id
      WHERE sr.service_name = 'property_care_service'
    `;

    const result = await pool.query(query);
    console.log("✅ Property care service requests result:", result.rows);

    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error(
      "❌ Error in getAllPropertyCareServiceRequestsForAllUsers:",
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
  getAllPropertyCareServiceRequestsForAllUsers,
};
