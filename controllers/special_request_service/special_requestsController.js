const pool = require("../../config/db");

const createSpecialRequestsServiceBookingWithRequest = async (req, res) => {
  const client = await pool.connect();
  try {
    const idToken = String(req.body.user_id);
    const user_id = idToken;

    const {
      special_request,
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

    const specialRequestServiceInsertQuery = `
      INSERT INTO special_request_service_bookings (
        user_id,
        special_request,
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
      ) RETURNING special_request_service_id
    `;

    const result = await client.query(specialRequestServiceInsertQuery, [
      user_id,
      special_request,
      service_address,
      latitude,
      longitude,
      service_date,
      service_time,
      service_hours,
      for_person_name,
      for_person_phone,
    ]);

    const specialRequestServiceId = result.rows[0].special_request_service_id;

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
      "special_requests",
      specialRequestServiceId,
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
      message:
        "Special Request Service booking and payment recorded successfully.",
      special_request_service_id: specialRequestServiceId,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Error in specialRequestServiceBooking", error);
    res.status(500).json({
      success: false,
      error: error.message || "Internal Server Error",
    });
  } finally {
    client.release();
  }
};

const updateSpecialRequestServiceBooking = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params; // special_request_service_id
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
      UPDATE special_request_service_bookings
      SET ${fields.join(", ")}
      WHERE special_request_service_id = $${index}
      RETURNING *;
    `;

    await client.query("BEGIN");
    const result = await client.query(query, values);
    await client.query("COMMIT");

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Special Request Service Booking not found",
      });
    }

    res.json({
      success: true,
      message: "Special Request Service Booking updated successfully",
      data: result.rows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(
      "❌ Error in updateSpecialRequestServiceBooking:",
      error.message
    );
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  } finally {
    client.release();
  }
};

module.exports = {
  createSpecialRequestsServiceBookingWithRequest,
  updateSpecialRequestServiceBooking,
};
