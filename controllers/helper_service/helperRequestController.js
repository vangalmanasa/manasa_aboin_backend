const pool = require("../../config/db");
const admin = require("../../config/firebase");

const createHelperServiceBookingWithRequest = async (req, res) => {
  const client = await pool.connect();
  try {
    const idToken = String(req.body.user_id);
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const user_id = decodedToken.uid;

    const {
      personal_request,
      service_address,
      latitude,
      longitude,
      service_date,
      service_time,
      service_hours,
      for_person_name,
      for_person_phone,

      // Razorpay payment data
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      amount,
      currency,
      payment_method,
    } = req.body;

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount)) {
      throw new Error("Amount is missing or invalid.");
    }

    await client.query("BEGIN");

    // Insert into helper_service_bookings
    const helperServiceInsertQuery = `
      INSERT INTO helper_service_bookings (
        user_id,
        personal_request,
        service_address,
        latitude,
        longitude,
        service_date,
        service_time,
        service_hours,
        for_person_name,
        for_person_phone
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
      ) RETURNING helper_service_id
    `;

    const result = await client.query(helperServiceInsertQuery, [
      user_id,
      personal_request,
      service_address,
      latitude,
      longitude,
      service_date,
      service_time,
      service_hours,
      for_person_name,
      for_person_phone,
    ]);

    const helperServiceId = result.rows[0].helper_service_id;

    // Insert into service_requests
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
      "helper_service",
      helperServiceId,
      "success",
    ]);

    const request_id = serviceRequestResult.rows[0].request_id;

    // Insert into payments
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

    res.status(201).json({
      success: true,
      message: "Helper Service booking and payment recorded successfully.",
      helper_service_id: helperServiceId,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Error in createHelperServiceBookingWithRequest:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Internal Server Error",
    });
  } finally {
    client.release();
  }
};

const updateHelperServiceBooking = async (req, res) => {
  const client = await pool.connect();
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
      return res.status(400).json({
        success: false,
        error: "No fields to update",
      });
    }

    values.push(id); // for WHERE clause

    const query = `
        UPDATE helper_service_bookings
        SET ${fields.join(", ")}
        WHERE helper_service_id = $${index}
        RETURNING *;
      `;

    await client.query("BEGIN");
    const result = await client.query(query, values);
    await client.query("COMMIT");

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Helper Service Booking not found",
      });
    }

    res.json({
      success: true,
      message: "Helper Service Booking updated successfully",
      data: result.rows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Error in updateHelperServiceBooking:", error.message);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  } finally {
    client.release();
  }
};

module.exports = {
  createHelperServiceBookingWithRequest,
  updateHelperServiceBooking,
};
