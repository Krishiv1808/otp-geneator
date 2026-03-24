const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');
const otpGenerator = require('otp-generator');
require('dotenv').config();

const app = express();
console.log("EMAIL:", process.env.EMAIL);
console.log("PASSWORD:", process.env.PASSWORD);
// Middleware
app.use(express.json());

// Serve frontend
app.use(express.static(path.join(__dirname, 'public')));

// Temporary OTP store
let otpStore = {};

// Email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD
  }
});

// Send OTP
app.post('/send-otp', async (req, res) => {
  const { email } = req.body;

  const otp = otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false,
    specialChars: false
  });

  otpStore[email] = otp;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: 'OTP Verification',
      text: `Your OTP is: ${otp}`
    });

    res.json({ success: true });
  } catch (err) {
  console.error("OTP ERROR:", err);
  console.error(err);
  res.json({ success: false, error: err.message });
}
});

// Verify OTP
app.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;

  if (otpStore[email] === otp) {
    delete otpStore[email];
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});

// Start server (Render compatible)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
