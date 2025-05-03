const pool = require("../../config/db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const signup = async (req, res) => {
  const {
    phone_number,
    first_name,
    last_name,
    email,
    password,
    date_of_birth,
    gender,
    occupation,
    location,
    user_image,
  } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO admin
        (phone_number, first_name, last_name, email, password, date_of_birth, gender, occupation, location, user_image)
       VALUES
        ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [
        phone_number,
        first_name,
        last_name,
        email,
        hashedPassword,
        date_of_birth,
        gender,
        occupation,
        location,
        user_image,
      ]
    );

    const user = result.rows[0];

    const tokenPayload = {
      user_id: user.user_id,
      phone_number: user.phone_number,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      date_of_birth: user.date_of_birth,
      gender: user.gender,
      occupation: user.occupation,
      location: user.location,
      user_image: user.user_image,
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    console.log(res, token);
    res.status(201).json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Signup failed." });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const userResult = await pool.query(
      `SELECT * FROM admin WHERE email = $1`,
      [email]
    );
    const user = userResult.rows[0];

    if (!user) {
      return res.status(400).json({ error: "Invalid email or password." });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(400).json({ error: "Invalid email or password." });
    }

    const tokenPayload = {
      user_id: user.user_id,
      phone_number: user.phone_number,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      date_of_birth: user.date_of_birth,
      gender: user.gender,
      occupation: user.occupation,
      location: user.location,
      user_image: user.user_image,
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Login failed." });
  }
};

const assignDriverAndAssistant = async (req, res) => {
  const hospital_service_id = req.params.id || req.body.hospital_service_id;
  const { driver_id, personal_assistant_id } = req.body;

  try {
    // Start building query dynamically
    const fields = [];
    const values = [];
    let idx = 1;

    if (driver_id !== undefined) {
      fields.push(`driver_id = $${idx++}`);
      values.push(driver_id);
    }

    if (personal_assistant_id !== undefined) {
      fields.push(`personal_assistant_id = $${idx++}`);
      values.push(personal_assistant_id);
    }

    if (fields.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No fields provided to update" });
    }

    values.push(hospital_service_id); // Last one is always ID

    const result = await pool.query(
      `UPDATE hospital_service_bookings SET ${fields.join(
        ", "
      )} WHERE hospital_service_id = $${idx} RETURNING *`,
      values
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Hospital service not found",
      });
    }

    res.json({
      success: true,
      message: "Updated successfully",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("❌ Error updating:", err.message);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

const assignHelperToHelperService = async (req, res) => {
  const { helper_service_id, helper_id } = req.body;

  if (!helper_service_id || !helper_id) {
    return res.status(400).json({
      success: false,
      message: "helper_service_id and helper_id are required",
    });
  }

  try {
    const result = await pool.query(
      `UPDATE helper_service_bookings
       SET helper_id = $1
       WHERE helper_service_id = $2
       RETURNING *`,
      [helper_id, helper_service_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Helper service booking not found",
      });
    }

    res.json({
      success: true,
      message: "Helper assigned successfully",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("❌ Error assigning helper:", err.message);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

const assignHelperToSpecialService = async (req, res) => {
  const { special_request_service_id, helper_id } = req.body;

  if (!special_request_service_id || !helper_id) {
    return res.status(400).json({
      success: false,
      message: "helper_service_id and helper_id are required",
    });
  }

  try {
    const result = await pool.query(
      `UPDATE special_request_service_bookings
       SET helper_id = $1
       WHERE special_request_service_id = $2
       RETURNING *`,
      [helper_id, special_request_service_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Helper service booking not found",
      });
    }

    res.json({
      success: true,
      message: "Helper assigned successfully",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("❌ Error assigning helper:", err.message);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};
const assignAgentToPropertyBooking = async (req, res) => {
  const booking_id = req.params.id; // Get from URL param
  const { agent_id } = req.body;

  if (!booking_id || !agent_id) {
    return res.status(400).json({
      success: false,
      message: "booking_id (from URL) and agent_id (from body) are required",
    });
  }

  try {
    const result = await pool.query(
      `UPDATE property_care_bookings
       SET realstate_assistant_id = $1
       WHERE property_care_id = $2
       RETURNING *`,
      [agent_id, booking_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Property booking not found",
      });
    }

    res.json({
      success: true,
      message: "Agent assigned successfully",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("❌ Error assigning agent:", err.message);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

module.exports = {
  signup,
  login,
  assignDriverAndAssistant,
  assignHelperToSpecialService,
  assignHelperToHelperService,
  assignAgentToPropertyBooking,
};
