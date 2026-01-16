import multer from 'multer';
import path from 'path';
import fs from 'fs';
import config from '../config/index.js';

// Ensure upload directory exists
if (config.storage.type === 'local') {
    if (!fs.existsSync(config.storage.uploadDir)) {
        fs.mkdirSync(config.storage.uploadDir, { recursive: true });
    }
}

// Local Storage Engine
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, config.storage.uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File Filter
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Only images and PDFs are allowed!'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

export default upload;
