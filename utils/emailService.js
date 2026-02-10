const { Resend } = require('resend');

// Initialize Resend with your API Key from Render/Env
const resend = new Resend(process.env.RESEND_API_KEY);

const getHtmlTemplate = (title, bodyContent, isUrgent = false) => {
  const headerColor = isUrgent ? '#d9534f' : '#6366f1'; 
  return `
    <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 12px; overflow: hidden;">
      <div style="background-color: ${headerColor}; padding: 30px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 26px;">Campus Soon</h1>
        <p style="margin: 5px 0 0; font-size: 14px; opacity: 0.9;">${title}</p>
      </div>
      <div style="padding: 30px; color: #333; line-height: 1.6; font-size: 15px;">
        ${bodyContent}
      </div>
      <div style="background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #eee;">
        <p>Campus Soon Digital Ecosystem • Automated Notification</p>
      </div>
    </div>
  `;
};


const sendEmail = async (toEmails, subject, htmlContent) => {
  try {
    // 1. Ensure it is an array and remove duplicates again just in case
    let emailList = Array.isArray(toEmails) ? toEmails : [toEmails];
    emailList = [...new Set(emailList.filter(e => typeof e === 'string' && e.includes('@')))];

    if (emailList.length === 0) return;

    /* 
      IMPORTANT FOR PROJECT TESTING:
      If you are on Resend Free Tier, you can ONLY send to your own email.
      To show this working in your presentation:
      Go to your DB and change 2-3 student emails to YOUR OWN Gmail address.
    */

    const { data, error } = await resend.emails.send({
      from: 'Campus Soon <onboarding@resend.dev>',
      to: emailList, // Resend accepts an array of strings here
      subject: subject,
      html: htmlContent,
    });

    if (error) {
      // This will catch the 422 error if you try to send to an unverified email
      console.error("❌ RESEND REJECTED DATA:", error.message);
      return;
    }

    console.log(`📧 SUCCESS: Broadcast delivered to ${emailList.length} users.`);
  } catch (err) {
    console.error("❌ CRITICAL EMAIL ERROR:", err.message);
  }
};


module.exports = {
  sendBroadcastEmail: async (emails, title, message) => {
    const html = getHtmlTemplate(title, `<p>${message}</p>`);
    await sendEmail(emails, `📢 Campus Notice: ${title}`, html);
  },

  sendAssignmentEmail: async (emails, teacherName, topic, date) => {
    const html = getHtmlTemplate('New Assignment Uploaded', `
      <h3>${topic}</h3>
      <p><strong>Teacher:</strong> ${teacherName}</p>
      <p><strong>Deadline:</strong> ${date}</p>
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
      <div style="text-align: center; margin-top: 20px;">
        <a href="${googleMapLink}" style="background-color: #d9534f; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">View Live Location</a>
      </div>
    `, true);
    await sendEmail(emails, `🚨 SOS: Emergency on Bus`, html);
  }
};