const nodemailer = require('nodemailer');

// 1. Configure Transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// 2. Standard HTML Template Design
const getHtmlTemplate = (title, bodyContent, isUrgent = false) => {
  const headerColor = isUrgent ? '#d9534f' : '#4a90e2'; // Red for SOS, Blue for others
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: ${headerColor}; padding: 20px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 24px;">Campus Soon</h1>
        <p style="margin: 5px 0 0; font-size: 14px;">${title}</p>
      </div>
      <div style="padding: 20px; background-color: #ffffff; color: #333333; line-height: 1.6;">
        ${bodyContent}
      </div>
      <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 12px; color: #888888;">
        <p>This is an automated notification from the Campus Soon Digital Ecosystem.</p>
        <p>Please do not reply to this email.</p>
      </div>
    </div>
  `;
};

// 3. Generic Send Function
const sendEmail = async (toEmails, subject, htmlContent) => {
  if (!toEmails || toEmails.length === 0) return;

  const mailOptions = {
    from: `"Campus Soon Admin" <${process.env.EMAIL_USER}>`,
    to: toEmails, // Pass array of emails
    subject: subject,
    html: htmlContent
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent to ${toEmails.length} recipients.`);
  } catch (error) {
    console.error("❌ Email Sending Failed:", error);
  }
};

module.exports = {
  // A. Admin Broadcast
  sendBroadcastEmail: async (emails, title, message) => {
    const html = getHtmlTemplate(title, `<p>${message}</p>`);
    await sendEmail(emails, `📢 Notice: ${title}`, html);
  },

  // B. Teacher Assignment
  sendAssignmentEmail: async (emails, teacherName, topic, date) => {
    const html = getHtmlTemplate('New Assignment Uploaded', `
      <h3>${topic}</h3>
      <p><strong>Teacher:</strong> ${teacherName}</p>
      <p><strong>Submission Date:</strong> ${date}</p>
      <p>Please check your student dashboard for full details.</p>
    `);
    await sendEmail(emails, `📝 Assignment: ${topic}`, html);
  },

  // C. Exam Timetable
  sendTimetableEmail: async (emails, teacherName, semester) => {
    const html = getHtmlTemplate('Exam Timetable Published', `
      <p><strong>Teacher:</strong> ${teacherName}</p>
      <p>The exam schedule for <strong>${semester}</strong> has been released.</p>
      <p>Please login to the app to view the specific dates and times.</p>
    `);
    await sendEmail(emails, `📅 Exam Schedule: ${semester}`, html);
  },

  // D. SOS Alert (Urgent)
  sendSOSEmail: async (emails, driverName, reason, googleMapLink) => {
    const html = getHtmlTemplate('🚨 SOS EMERGENCY ALERT', `
      <h2 style="color: #d9534f;">Emergency Reported</h2>
      <p><strong>Driver:</strong> ${driverName}</p>
      <p><strong>Reason:</strong> ${reason}</p>
      <p>The driver has initiated an SOS alert. Please stay calm.</p>
      <p><a href="${googleMapLink}" style="background-color: #d9534f; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">View Live Location</a></p>
    `, true);
    await sendEmail(emails, `🚨 SOS: Emergency on Bus`, html);
  }
};