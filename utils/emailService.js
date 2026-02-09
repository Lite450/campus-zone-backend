const nodemailer = require('nodemailer');

// 1. Optimized Cloud Transporter for Render/Cloud platforms
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465, // Port 465 is more stable on Render than 587
  secure: true, // true for 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  pool: true, // Keeps connection open for large broadcasts
  maxConnections: 5,
  maxMessages: 100,
  connectionTimeout: 20000, // 20 seconds (fixes ETIMEDOUT)
  greetingTimeout: 20000,
  socketTimeout: 20000
});

// 2. Standard HTML Template Design
const getHtmlTemplate = (title, bodyContent, isUrgent = false) => {
  const headerColor = isUrgent ? '#d9534f' : '#6366f1'; 
  
  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
      <div style="background-color: ${headerColor}; padding: 30px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 26px; letter-spacing: 1px;">Campus Soon</h1>
        <p style="margin: 5px 0 0; font-size: 14px; opacity: 0.9;">${title}</p>
      </div>
      <div style="padding: 30px; background-color: #ffffff; color: #333333; line-height: 1.6; font-size: 15px;">
        ${bodyContent}
      </div>
      <div style="background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #888888; border-top: 1px solid #eeeeee;">
        <p style="margin-bottom: 5px;">This is an automated notification from the <strong>Campus Soon</strong> Digital Ecosystem.</p>
        <p style="margin-top: 0;">Please do not reply directly to this email.</p>
      </div>
    </div>
  `;
};

// 3. Optimized Send Function
const sendEmail = async (toEmails, subject, htmlContent) => {
  if (!toEmails || toEmails.length === 0) return;

  // Convert array to comma-separated string if necessary
  const recipients = Array.isArray(toEmails) ? toEmails.join(', ') : toEmails;

  const mailOptions = {
    from: `"Campus Soon Admin" <${process.env.EMAIL_USER}>`,
    to: recipients, 
    subject: subject,
    html: htmlContent
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent successfully to ${Array.isArray(toEmails) ? toEmails.length : 1} recipients.`);
  } catch (error) {
    console.error("❌ Nodemailer Error:", error.message);
    // Don't throw error to prevent backend crash during background sends
  }
};

module.exports = {
  // A. Admin Broadcast
  sendBroadcastEmail: async (emails, title, message) => {
    const html = getHtmlTemplate(title, `<p style="font-size: 16px;">${message}</p>`);
    await sendEmail(emails, `📢 Notice: ${title}`, html);
  },

  // B. Teacher Assignment
  sendAssignmentEmail: async (emails, teacherName, topic, date) => {
    const html = getHtmlTemplate('New Assignment Uploaded', `
      <h3 style="color: #6366f1;">${topic}</h3>
      <p><strong>Teacher:</strong> ${teacherName}</p>
      <p><strong>Submission Deadline:</strong> ${date}</p>
      <p>Please log in to your student dashboard to view instructions and upload your work.</p>
    `);
    await sendEmail(emails, `📝 New Assignment: ${topic}`, html);
  },

  // C. Exam Timetable
  sendTimetableEmail: async (emails, teacherName, semester) => {
    const html = getHtmlTemplate('Exam Timetable Published', `
      <p><strong>Academic Advisor:</strong> ${teacherName}</p>
      <p>The examination schedule for <strong>${semester}</strong> has been officially released.</p>
      <p>Check the Campus Soon app to see your specific dates, subjects, and hall timings.</p>
    `);
    await sendEmail(emails, `📅 Exam Schedule Released: ${semester}`, html);
  },

  // D. SOS Alert (Urgent)
  sendSOSEmail: async (emails, driverName, reason, googleMapLink) => {
    const html = getHtmlTemplate('🚨 SOS EMERGENCY ALERT', `
      <div style="border: 2px solid #d9534f; padding: 20px; border-radius: 10px;">
        <h2 style="color: #d9534f; margin-top: 0;">Emergency Reported</h2>
        <p><strong>Bus Driver:</strong> ${driverName}</p>
        <p><strong>Status:</strong> ${reason}</p>
        <p>An SOS alert has been triggered for your bus route. Emergency protocols have been initiated.</p>
        <div style="text-align: center; margin-top: 25px;">
           <a href="${googleMapLink}" style="background-color: #d9534f; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">View Live Bus Location</a>
        </div>
      </div>
    `, true);
    await sendEmail(emails, `🚨 URGENT SOS: Emergency Alert on Bus`, html);
  }
};