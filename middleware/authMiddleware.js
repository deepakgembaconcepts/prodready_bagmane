
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'bagmane_secret_key_change_in_prod';

export const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1]; // Bearer <token>

        jwt.verify(token, SECRET_KEY, (err, user) => {
            if (err) {
                return res.status(403).json({ error: 'Token is not valid' });
            }
            req.user = user;
            next();
        });
    } else {
        res.status(401).json({ error: 'You are not authenticated!' });
    }
};

export const authorize = (roles = []) => {
    // roles param can be a single string (e.g. 'Admin') or an array of strings (['Admin', 'User'])
    if (typeof roles === 'string') {
        roles = [roles];
    }

    return (req, res, next) => {
        // req.user is populated by verifyToken
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        if (roles.length) {
            const userRole = req.user.role.toUpperCase();
            const allowedRoles = roles.map(r => r.toUpperCase());

            if (!allowedRoles.includes(userRole)) {
                return res.status(403).json({ error: 'Access denied: You do not have the required role' });
            }
        }

        next();
    };
};
