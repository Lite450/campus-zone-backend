const nodemailer = require('nodemailer');

// 1. Optimized Cloud Transporter for Render
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465, // Use 465 (SSL) instead of 587
  secure: true, // true for 465
  auth: {
    user: process.env.EMAIL_USER,
    // Automatically removes spaces if you forgot to remove them in .env
    pass: process.env.EMAIL_PASS.replace(/\s+/g, '') 
  },
  // Critical for Render: Increase timeouts
  connectionTimeout: 30000, // 30 seconds
  greetingTimeout: 30000,
  socketTimeout: 30000,
  pool: true // Use pooling for better performance in broadcasts
});

// 2. Standard HTML Template Design
const getHtmlTemplate = (title, bodyContent, isUrgent = false) => {
  const headerColor = isUrgent ? '#d9534f' : '#6366f1'; 
  return `
    <div style="font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden;">
      <div style="background-color: ${headerColor}; padding: 25px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 24px;">Campus Soon</h1>
        <p style="margin: 5px 0 0; font-size: 14px; opacity: 0.9;">${title}</p>
      </div>
      <div style="padding: 30px; background-color: #ffffff; color: #333333; line-height: 1.6;">
        ${bodyContent}
      </div>
      <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 11px; color: #888888; border-top: 1px solid #eeeeee;">
        <p>Campus Soon Digital Ecosystem • Automated Notification</p>
      </div>
    </div>
  `;
};

// 3. Generic Send Function
const sendEmail = async (toEmails, subject, htmlContent) => {
  if (!toEmails || (Array.isArray(toEmails) && toEmails.length === 0)) {
    console.log("⚠️ No recipients found. Skipping email.");
    return;
  }

  const mailOptions = {
    from: `"Campus Soon Admin" <${process.env.EMAIL_USER}>`,
    to: Array.isArray(toEmails) ? toEmails.join(', ') : toEmails,
    subject: subject,
    html: htmlContent
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent to ${Array.isArray(toEmails) ? toEmails.length : 1} recipients.`);
  } catch (error) {
    console.error("❌ Email Sending Failed:", error.message);
    // Don't throw error to prevent your main broadcast API from failing completely
  }
};

module.exports = {
  sendBroadcastEmail: async (emails, title, message) => {
    const html = getHtmlTemplate(title, `<p style="font-size:16px;">${message}</p>`);
    await sendEmail(emails, `📢 Campus Notice: ${title}`, html);
  },

  sendAssignmentEmail: async (emails, teacherName, topic, date) => {
    const html = getHtmlTemplate('New Assignment Uploaded', `
      <p><strong>Topic:</strong> ${topic}</p>
      <p><strong>Teacher:</strong> ${teacherName}</p>
      <p><strong>Deadline:</strong> ${date}</p>
      <p>Please log in to your dashboard for details.</p>
    `);
    await sendEmail(emails, `📝 Assignment: ${topic}`, html);
  },

  sendTimetableEmail: async (emails, teacherName, semester) => {
    const html = getHtmlTemplate('Exam Timetable Published', `
      <p>The exam schedule for <strong>${semester}</strong> has been released by ${teacherName}.</p>
    `);
    await sendEmail(emails, `📅 Exam Schedule: ${semester}`, html);
  },

  sendSOSEmail: async (emails, driverName, reason, googleMapLink) => {
    const html = getHtmlTemplate('🚨 SOS EMERGENCY ALERT', `
      <h2 style="color: #d9534f;">Emergency Reported</h2>
      <p><strong>Driver:</strong> ${driverName}</p>
      <p><strong>Status:</strong> ${reason}</p>
      <p><a href="${googleMapLink}" style="background-color: #d9534f; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px; display: inline-block;">View Live Bus Location</a></p>
    `, true);
    await sendEmail(emails, `🚨 SOS: Emergency Alert`, html);
  }
};