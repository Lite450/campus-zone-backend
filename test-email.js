require('dotenv').config();
const emailService = require('./utils/emailService');

const email = process.env.EMAIL_USER; // Send to self by default

if (!email) {
    console.error('❌ EMAIL_USER environment variable is not set.');
    process.exit(1);
}

console.log(`Attempting to send test email to ${email}...`);

emailService.sendGenericEmail(
    email,
    'CLI Test Email',
    '<p>This is a test email sent from the command line script.</p>'
).then(() => {
    console.log('✅ Test email sent successfully.');
    process.exit(0);
}).catch(err => {
    console.error('❌ Failed to send test email:', err);
    process.exit(1);
});
