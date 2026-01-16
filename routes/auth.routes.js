import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

const SECRET_KEY = process.env.JWT_SECRET || 'bagmane_secret_key_change_in_prod';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'bagmane_refresh_secret_key';

// Tokens storage (for demo purposes, real app might use Redis or DB with invalidation)
let refreshTokens = [];

// POST /login
router.post('/login', async (req, res) => {
    const { email: rawEmail, password } = req.body;
    const email = rawEmail.toLowerCase();

    try {
        // Find user
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Validate password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Generate tokens
        // Payload excludes sensitive data
        const payload = {
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name
        };

        const accessToken = jwt.sign(payload, SECRET_KEY, { expiresIn: '15m' });
        const refreshToken = jwt.sign(payload, REFRESH_SECRET, { expiresIn: '7d' });

        refreshTokens.push(refreshToken);

        // Send Refresh Token as HTTPOnly Cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // true in https
            sameSite: 'Strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        // Return Access Token and User Info
        res.json({
            accessToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                permissions: JSON.parse(user.permissions || '[]')
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        // Prisma client initialized above - no need to load JSON file
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /refresh
router.post('/refresh', (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) return res.status(401).json({ error: 'Refresh Token Required' });
    if (!refreshTokens.includes(refreshToken)) return res.status(403).json({ error: 'Invalid Refresh Token' });

    jwt.verify(refreshToken, REFRESH_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid Token' });

        // Generate new Access Token
        const payload = {
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name
        };

        const accessToken = jwt.sign(payload, SECRET_KEY, { expiresIn: '15m' });
        res.json({ accessToken });
    });
});

// POST /logout
router.post('/logout', (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    refreshTokens = refreshTokens.filter(t => t !== refreshToken);

    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out successfully' });
});

export default router;
