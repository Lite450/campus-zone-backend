const express = require('express');
const router = express.Router();
const emailService = require('../utils/emailService');

// POST /api/test-email
router.post('/test-email', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ success: false, error: 'Email is required in request body.' });
    }

    try {
        console.log(`🧪 Attempting to send test email to: ${email}`);

        await emailService.sendGenericEmail(
            email,
            'Test Email from Campus Zone',
            '<h1>It Works!</h1><p>Your <strong>Nodemailer</strong> configuration is correct and ready for Vercel.</p>'
        );

        res.status(200).json({ success: true, message: 'Test email sent successfully.' });
    } catch (error) {
        console.error('❌ Test email failed:', error);
        res.status(500).json({ success: false, error: 'Failed to send email.', details: error.message });
    }
});

module.exports = router;
