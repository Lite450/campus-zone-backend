const { Resend } = require('resend');

// Initialize Resend with API Key
const resend = new Resend(process.env.RESEND_API_KEY);

// 1. Standard HTML Template Design (Preserved)
const getHtmlTemplate = (title, bodyContent, isUrgent = false) => {
  const headerColor = isUrgent ? '#d9534f' : '#6366f1'; // Red for SOS, Indigo for others

  return `
    <div style="font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
      <div style="background-color: ${headerColor}; padding: 30px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 26px; letter-spacing: 1px;">Campus Zone</h1>
        <p style="margin: 5px 0 0; font-size: 14px; opacity: 0.9;">${title}</p>
      </div>
      <div style="padding: 30px; background-color: #ffffff; color: #333333; line-height: 1.6; font-size: 15px;">
        ${bodyContent}
      </div>
      <div style="background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #888888; border-top: 1px solid #eeeeee;">
        <p style="margin-bottom: 5px;"><strong>Campus Zone Digital Ecosystem</strong></p>
        <p style="margin-top: 0;">This is an automated notification. Please do not reply.</p>
      </div>
    </div>
  `;
};

// 2. Optimized Send Function via Resend API
const sendEmail = async (toEmails, subject, htmlContent) => {
  if (!toEmails || (Array.isArray(toEmails) && toEmails.length === 0)) return;

  const recipients = Array.isArray(toEmails) ? toEmails : [toEmails];

  try {
    // IMPORTANT: Resend requires a verified domain to send FROM custom emails.
    // If you don't have a domain yet, use 'onboarding@resend.dev' for testing.
    // Once verified, change this to: `Campus Zone <notifications@yourdomain.com>`
    const fromEmail = 'Campus Zone <onboarding@resend.dev>';

    // For testing without a domain, you can ONLY send to your verified email (e.g., your gmail).
    // Sending to random users will throw a 403 error until you verify a domain.

    const data = await resend.emails.send({
      from: fromEmail,
      to: process.env.EMAIL_USER, // Send to Admin/Self mainly for testing/safety
      bcc: recipients,            // BCC everyone else (Bulk sending)
      subject: subject,
      html: htmlContent,
    });

    if (data.error) {
      console.error("❌ Resend API Error:", data.error);
    } else {
      console.log(`📧 SUCCESS: Email sent via Resend. ID: ${data.data.id}`);
    }
  } catch (error) {
    console.error("❌ Resend Execution Error:", error.message);
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
      <h3 style="color: #6366f1; margin-top: 0;">${topic}</h3>
      <p><strong>Teacher:</strong> ${teacherName}</p>
      <p><strong>Submission Deadline:</strong> ${date}</p>
      <p>Please check your student dashboard for full details and instructions.</p>
    `);
    await sendEmail(emails, `📝 Assignment: ${topic}`, html);
  },

  // C. Exam Timetable
  sendTimetableEmail: async (emails, teacherName, semester) => {
    const html = getHtmlTemplate('Exam Timetable Published', `
      <p><strong>Academic Advisor:</strong> ${teacherName}</p>
      <p>The examination schedule for <strong>${semester}</strong> has been officially released.</p>
      <p>Please login to the <strong>Campus Zone</strong> app to view specific dates, hall timings, and subjects.</p>
    `);
    await sendEmail(emails, `📅 Exam Schedule: ${semester}`, html);
  },

  // D. SOS Alert (Urgent)
  sendSOSEmail: async (emails, driverName, reason, googleMapLink) => {
    const html = getHtmlTemplate('🚨 SOS EMERGENCY ALERT', `
      <div style="border: 2px solid #d9534f; padding: 20px; border-radius: 10px;">
        <h2 style="color: #d9534f; margin-top: 0;">Emergency Reported</h2>
        <p><strong>Bus Driver:</strong> ${driverName}</p>
        <p><strong>Reason:</strong> ${reason}</p>
        <p>An SOS alert has been triggered for your bus route. Please stay calm and follow emergency protocols.</p>
        <div style="text-align: center; margin-top: 25px;">
           <a href="${googleMapLink}" style="background-color: #d9534f; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">View Live Bus Location</a>
        </div>
      </div>
    `, true);
    await sendEmail(emails, `🚨 URGENT: Emergency SOS on Bus`, html);
  }
};