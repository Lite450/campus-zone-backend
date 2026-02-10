const sgMail = require('@sendgrid/mail');

// Initialize with API Key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const getHtmlTemplate = (title, bodyContent, isUrgent = false) => {
  const headerColor = isUrgent ? '#ef4444' : '#6366f1'; 
  return `
    <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
      <div style="background-color: ${headerColor}; padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">Campus Soon</h1>
        <p style="color: rgba(255,255,255,0.8); margin: 5px 0 0;">${title}</p>
      </div>
      <div style="padding: 30px; background: white; color: #1e293b; line-height: 1.6;">
        ${bodyContent}
      </div>
      <div style="background: #f8fafc; padding: 20px; text-align: center; color: #64748b; font-size: 12px;">
        © 2026 Campus Soon Ecosystem. All rights reserved.
      </div>
    </div>
  `;
};

const sendEmail = async (toEmails, subject, htmlContent) => {
  try {
    const recipients = Array.isArray(toEmails) ? toEmails : [toEmails];
    
    // SendGrid handles mass mailing (BCC/Personalizations) very well
    const msg = {
      to: recipients,
      from: process.env.EMAIL_USER, // Must be verified in SendGrid
      subject: subject,
      html: htmlContent,
    };

    await sgMail.send(msg);
    console.log(`📧 SUCCESS: API-based email delivered to ${recipients.length} users.`);
  } catch (error) {
    console.error("❌ SENDGRID ERROR:", error.response ? error.response.body : error.message);
  }
};

module.exports = {
  sendBroadcastEmail: async (emails, title, message) => {
    const html = getHtmlTemplate(title, `<p style="font-size: 16px;">${message}</p>`);
    await sendEmail(emails, `📢 Campus Notice: ${title}`, html);
  },

  sendAssignmentEmail: async (emails, teacherName, topic, date) => {
    const html = getHtmlTemplate('New Assignment', `
      <h3 style="color: #6366f1;">${topic}</h3>
      <p><strong>Teacher:</strong> ${teacherName}</p>
      <p><strong>Deadline:</strong> ${date}</p>
    `);
    await sendEmail(emails, `📝 Assignment: ${topic}`, html);
  },

  sendSOSEmail: async (emails, driverName, reason, mapLink) => {
    const html = getHtmlTemplate('🚨 SOS ALERT', `
      <h2 style="color: #ef4444;">Emergency Reported</h2>
      <p><strong>Driver:</strong> ${driverName}</p>
      <p><strong>Status:</strong> ${reason}</p>
      <a href="${mapLink}" style="display:inline-block; padding:12px 20px; background:#ef4444; color:white; text-decoration:none; border-radius:8px; font-weight:bold;">Track Bus Location</a>
    `, true);
    await sendEmail(emails, `🚨 SOS: Emergency Alert`, html);
  }
};