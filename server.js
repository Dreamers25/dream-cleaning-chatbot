require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

// Email configuration
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
   pass: process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS 
  }
});

// Quote endpoint
app.post('/api/quote', async (req, res) => {
  try {
    const quoteData = req.body;
    
    console.log('📋 Quote request received:', quoteData);
    
    // Send email notification
    await sendQuoteEmail(quoteData);
    
    res.json({
      success: true,
      message: 'Quote received successfully'
    });
    
  } catch (error) {
    console.error('❌ Quote error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to process quote'
    });
  }
});

// Email function
async function sendQuoteEmail(data) {
  const emailHTML = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; color: #333; }
    .header { background: #1e3a8a; color: white; padding: 20px; border-radius: 10px 10px 0 0; }
    .content { padding: 20px; background: #f9f9f9; }
    .section { margin: 15px 0; padding: 15px; background: white; border-radius: 5px; }
    .label { font-weight: bold; color: #1e3a8a; }
  </style>
</head>
<body>
  <div class="header">
    <h2>🧹 NEW QUOTE REQUEST</h2>
    <p>Dream Cleaning Team</p>
  </div>
  <div class="content">
    <div class="section">
      <p><span class="label">Service Category:</span> ${data.service_category || 'N/A'}</p>
      <p><span class="label">Specific Service:</span> ${data.service_type || 'N/A'}</p>
    </div>
    <div class="section">
      <p><span class="label">Property Type:</span> ${data.property_type || 'N/A'}</p>
      <p><span class="label">Property Size:</span> ${data.property_size || 'N/A'}</p>
      <p><span class="label">Postcode:</span> ${data.property_postcode || 'N/A'}</p>
    </div>
    <div class="section">
      <p><span class="label">Timing:</span> ${data.cleaning_timing || 'N/A'}</p>
      <p><span class="label">Preferred Date:</span> ${data.preferred_date || 'N/A'}</p>
    </div>
    <div class="section">
      <p><span class="label">Name:</span> ${data.lead_name || 'N/A'}</p>
      <p><span class="label">Email:</span> <a href="mailto:${data.lead_email}">${data.lead_email || 'N/A'}</a></p>
      <p><span class="label">Phone:</span> <a href="tel:${data.lead_phone}">${data.lead_phone || 'N/A'}</a></p>
    </div>
    <p style="color: #888; font-size: 12px; text-align: center;">Received: ${new Date().toLocaleString('en-GB')}</p>
  </div>
</body>
</html>
  `;

  const mailOptions = {
    from: '"Dream Cleaning Bot" <' + process.env.EMAIL_USER + '>',
    to: process.env.ADMIN_EMAIL,
    subject: `NEW LEAD: ${data.lead_name || 'Unknown'} - ${data.service_category || 'Service'} in ${data.property_postcode || 'Unknown'}`,
    html: emailHTML
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully to', process.env.ADMIN_EMAIL);
  } catch (error) {
    console.error('❌ Email error:', error.message);
  }
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'quote-collection'
  });
});

// Start server
app.listen(PORT, () => {
  console.log('\n' + '='.repeat(50));
  console.log('🚀 Dream Cleaning Quote System');
  console.log('='.repeat(50));
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log('📝 Collecting quotes and sending emails');
  console.log('='.repeat(50) + '\n');
});