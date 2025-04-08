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

module.exports = { signup, login };
