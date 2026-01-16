import nodemailer from 'nodemailer';
import config from '../config/index.js';

let transporter;

if (config.env === 'production' || config.email.host !== 'smtp.ethereal.email') {
    transporter = nodemailer.createTransport({
        host: config.email.host,
        port: config.email.port,
        secure: config.email.port === 465, // true for 465, false for other ports
        auth: {
            user: config.email.user,
            pass: config.email.pass,
        },
    });
} else {
    // Use Ethereal for dev if no real SMTP provided
    // In a real scenario, we might auto-generate a test account here
    transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
            user: 'test_user',
            pass: 'test_pass'
        }
    });
}

export const sendEmail = async (to, subject, text, html) => {
    try {
        const info = await transporter.sendMail({
            from: config.email.from,
            to,
            subject,
            text,
            html,
        });
        console.log(`📧 Email sent: ${info.messageId}`);
        if (config.env !== 'production') {
            console.log(`   Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
        }
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending email:', error);
        // Fallback to stub logging if SMTP fails in dev
        console.log(`📧 (Fallback) Email → ${to}\n   Subject: ${subject}\n   Body: ${text?.substring(0, 100)}...`);
        return { success: false, error: error.message };
    }
};
