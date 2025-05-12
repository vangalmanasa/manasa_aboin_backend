const pool = require("../../config/db");
const admin = require("../../config/firebase");

const createHospitalServiceWithServiceRequest = async (req, res) => {
  const client = await pool.connect();
  try {
    const idToken = String(req.body.user_id);

    const user_id = idToken;
    console.log("✅ Firebase user ID:", user_id);
    const {
      parent_id,
      service_hours,
      pickup_date,
      pickup_time,
      pickup_location,
      hospital_name,
      hospital_location,
      no_of_persons,
      opting_cab_service,
      cab_type,
      needs_assistant,
      claiming_insurance,
      droplatitude,
      droplongitude,
      pickuplatitude,
      pickuplongitude,

      // Razorpay payment data
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      amount,
      currency,
      payment_method,
    } = req.body;

    // Parse amount from string to float
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount)) {
      throw new Error("Amount is missing or invalid.");
    }

    const finalCabType =
      opting_cab_service === "false" || !opting_cab_service ? null : cab_type;

    const imageFile = req.file;

    await client.query("BEGIN");

    console.log("📦 Inserting hospital_service_bookings...");
    const hospitalInsertQuery = `
        INSERT INTO hospital_service_bookings (
          user_id,
          parent_id,
          service_hours,
          pickup_date,
          pickup_time,
          pickup_location,
          hospital_name,
          hospital_location,
          no_of_persons,
          opting_cab_service,
          cab_type,
          needs_assistant,
          claiming_insurance,
          droplatitude,
          droplongitude,
          pickuplatitude,
          pickuplongitude,
          images
        ) VALUES (
         $1, $2, $3, $4, $5, $6, $7, 
      $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18
        ) RETURNING hospital_service_id
      `;

    const hospitalResult = await client.query(hospitalInsertQuery, [
      user_id,
      parent_id,
      service_hours,
      pickup_date,
      pickup_time,
      pickup_location,
      hospital_name,
      hospital_location,
      no_of_persons,
      opting_cab_service,
      finalCabType,
      needs_assistant,
      claiming_insurance,
      droplatitude,
      droplongitude,
      pickuplatitude,
      pickuplongitude,
      imageFile ? imageFile.buffer : null,
    ]);

    if (hospitalResult.rowCount === 0) {
      throw new Error("Failed to insert hospital service booking.");
    }

    const hospitalServiceId = hospitalResult.rows[0].hospital_service_id;
    console.log("✅ Hospital service ID:", hospitalServiceId);

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
      "hospital_service",
      hospitalServiceId,
      "success",
    ]);

    const request_id = serviceRequestResult.rows[0].request_id;

    console.log("💰 Inserting into payments...");
    const paymentInsertQuery = `
        INSERT INTO payments (
          razorpay_payment_id,
          razorpay_order_id,
          razorpay_signature,
          service_request_id,
          amount,
          currency,
          status,
          payment_method
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8
        )
      `;

    await client.query(paymentInsertQuery, [
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      request_id,
      parsedAmount,
      currency || "INR",
      "success",
      payment_method || "razorpay",
    ]);

    await client.query("COMMIT");

    console.log("✅ Transaction committed successfully.");
    res.status(201).json({
      success: true,
      message: "Booking and payment recorded successfully.",
      hospital_service_id: hospitalServiceId,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(
      "❌ Error in createHospitalServiceWithServiceRequest:",
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
  createHospitalServiceWithServiceRequest,
  getHospitalServiceById,
  updateHospitalService,
  deleteHospitalService,
};
