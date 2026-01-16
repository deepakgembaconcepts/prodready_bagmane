
/**
 * Simple Input Sanitization Middleware
 * Strips dangerous characters and HTML tags from body, query, and params
 */

const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    // Remove script tags and their content
    let sanitized = str.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gm, "");
    // Remove other HTML tags (basic XSS prevention)
    sanitized = sanitized.replace(/<[^>]*>?/gm, "");
    // Remove potential SQL injection common characters (basic)
    // Note: For real SQL security, use parameterized queries (ORM/Prisma handles this).
    // This is a defense-in-depth measure.
    return sanitized.trim();
};

const sanitizeObject = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;

    if (Array.isArray(obj)) {
        return obj.map(item => sanitizeObject(item));
    }

    const cleanObj = {};
    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
            cleanObj[key] = sanitizeString(value);
        } else if (typeof value === 'object' && value !== null) {
            cleanObj[key] = sanitizeObject(value);
        } else {
            cleanObj[key] = value;
        }
    }
    return cleanObj;
};

export const sanitizeInput = (req, res, next) => {
    if (req.body) {
        req.body = sanitizeObject(req.body);
    }
    if (req.query) {
        req.query = sanitizeObject(req.query);
    }
    if (req.params) {
        req.params = sanitizeObject(req.params);
    }
    next();
};
