const pool = require("../../config/db");
const admin = require("../../config/firebase");

const createPropertyCareBookingWithServiceRequest = async (req, res) => {
  const client = await pool.connect();
  try {
    const idToken = String(req.body.user_id);
    console.log("🔐 Decoding Firebase ID token...");

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const user_id = decodedToken.uid;
    console.log("✅ Firebase user ID:", user_id);

    const {
      first_name,
      last_name,
      phone,
      email,
      address,
      document_type,
      property_type,
      survey_no,
      property_status,
      property_size,
      property_location,
      guardian_name,
      guardian_phone,
    } = req.body;

    // Handle file uploads
    const documentImage = req.files?.document_image?.[0]?.buffer || null;
    const proofFileImage = req.files?.proof_file_image?.[0]?.buffer || null;
    const images = req.files?.images?.[0]?.buffer || null;

    await client.query("BEGIN");

    console.log("📦 Inserting property_care_bookings...");
    const propertyCareInsertQuery = `
      INSERT INTO property_care_bookings (
        user_id,
        first_name,
        last_name,
        phone,
        email,
        address,
        document_type,
        document_image,
        property_type,
        survey_no,
        property_status,
        property_size,
        property_location,
        guardian_name,
        guardian_phone,
        proof_file_image,
        images
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8::BYTEA[], $9, $10, $11, $12, $13, $14, $15, $16::BYTEA[], $17
      ) RETURNING property_care_id
    `;

    const propertyCareResult = await client.query(propertyCareInsertQuery, [
      user_id,
      first_name,
      last_name,
      phone,
      email,
      address,
      document_type,
      documentImage ? [documentImage] : [],
      property_type,
      survey_no,
      property_status,
      property_size,
      property_location,
      guardian_name,
      guardian_phone,
      proofFileImage ? [proofFileImage] : [],
      images,
    ]);

    if (propertyCareResult.rowCount === 0) {
      throw new Error("Failed to insert property care booking.");
    }

    const propertyCareId = propertyCareResult.rows[0].property_care_id;
    console.log("✅ Property care ID:", propertyCareId);

    console.log("📨 Inserting into service_requests...");
    const serviceRequestQuery = `
      INSERT INTO service_requests (
        user_id,
        service_name,
        service_reference_id,
        payment_status
      ) VALUES ($1, $2, $3, $4)
      RETURNING request_id
    `;

    const serviceRequestResult = await client.query(serviceRequestQuery, [
      user_id,
      "property_care_service",
      propertyCareId,
      "success",
    ]);

    const request_id = serviceRequestResult.rows[0].request_id;

    await client.query("COMMIT");

    console.log("✅ Transaction committed successfully.");
    res.status(201).json({
      success: true,
      message: "Booking recorded successfully.",
      property_care_id: propertyCareId,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(
      "❌ Error in createPropertyCareBookingWithServiceRequest:",
      error
    );
    res.status(500).json({
      success: false,
      error: error.message || "Internal Server Error",
    });
  } finally {
    client.release();
  }
};

// Get property care service by ID
const getPropertyCareBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT * FROM property_care_bookings WHERE property_care_id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("Error in getPropertyCareBookingById:", err.message);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

const getPropertyCareBookingByUserId = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT * FROM property_care_bookings WHERE user_id = $1`,
      [id]
    );
    console.log("🚀 Fetching property care bookings for user:", id);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error("Error in getPropertyCareBookingById:", err.message);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

// Update property care service (any field)
const updatePropertyCareBooking = async (req, res) => {
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
      UPDATE property_care_bookings
      SET ${fields.join(", ")}
      WHERE property_care_id = $${index}
      RETURNING *`;

    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    res.json({
      success: true,
      message: "Property care service updated",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("Error in updatePropertyCareBooking:", err.message);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

// Delete property care service
const deletePropertyCareBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `DELETE FROM property_care_bookings WHERE property_care_id = $1 RETURNING *`,
      [id]
    );

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    res.json({
      success: true,
      message: "Property care service deleted",
    });
  } catch (err) {
    console.error("Error in deletePropertyCareBooking:", err.message);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

module.exports = {
  createPropertyCareBookingWithServiceRequest,
  getPropertyCareBookingById,
  getPropertyCareBookingByUserId,
  updatePropertyCareBooking,
  deletePropertyCareBooking,
};
