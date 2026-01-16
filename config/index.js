import dotenv from 'dotenv';
dotenv.config();

export default {
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3001', 10),
    jwt: {
        secret: process.env.JWT_SECRET || 'default_dev_secret',
        expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    },
    email: {
        host: process.env.SMTP_HOST || 'smtp.ethereal.email',
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        user: process.env.SMTP_USER || 'ethereal_user',
        pass: process.env.SMTP_PASS || 'ethereal_pass',
        from: process.env.EMAIL_FROM || 'noreply@bagmane.com',
    },
    storage: {
        type: process.env.STORAGE_TYPE || 'local', // 'local' or 's3'
        uploadDir: process.env.UPLOAD_DIR || 'uploads/',
    },
};
