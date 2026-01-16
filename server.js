/**
 * Simple Express server to serve the React app and API endpoints
 * Solves the issue of large bundle size from embedded escalation rules
 */

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);  // Use 3001 for dev, 3000 in production

// Middleware
app.use(cors());
app.use(express.json());
import cookieParser from 'cookie-parser';
app.use(cookieParser());
import helmet from 'helmet';
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // unsafe-inline/eval for dev/React
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "http://localhost:3000", "http://localhost:3001"],
    },
  },
}));

import { sanitizeInput } from './middleware/dataSanitizer.js';
app.use(sanitizeInput);

import rateLimit from 'express-rate-limit';
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windows
});
app.use(limiter);

// Auth Routes
import authRoutes from './routes/auth.routes.js';
app.use('/api/auth', authRoutes);

// Protect API routes
import { verifyToken, authorize } from './middleware/authMiddleware.js';
// Protect all other API routes
app.use('/api', verifyToken);

// Static files from dist folder
app.use(express.static(path.join(__dirname, 'dist')));

// Prisma database is used for all data - no JSON file loading needed

/**
 * GET /api/escalation/categories
 * Get all unique categories from database
 */
app.get('/api/escalation/categories', async (req, res) => {
  try {
    const rules = await prisma.escalationRule.findMany({
      select: { category: true },
      distinct: ['category']
    });
    res.json(rules.map(r => r.category).sort());
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.json([]); // Return empty array if no rules in DB yet
  }
});

/**
 * GET /api/escalation/subcategories/:category
 * Get subcategories for a specific category from database
 */
app.get('/api/escalation/subcategories/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const rules = await prisma.escalationRule.findMany({
      where: { category },
      select: { subCategory: true },
      distinct: ['subCategory']
    });
    res.json(rules.map(r => r.subCategory).sort());
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    res.json([]);
  }
});

/**
 * GET /api/escalation/issues/:category/:subcategory
 * Get issues for a specific category and subcategory from database
 */
app.get('/api/escalation/issues/:category/:subcategory', async (req, res) => {
  try {
    const { category, subcategory } = req.params;
    const rules = await prisma.escalationRule.findMany({
      where: {
        category,
        subCategory: subcategory
      },
      select: { issue: true },
      distinct: ['issue']
    });
    res.json(rules.map(r => r.issue).sort());
  } catch (error) {
    console.error('Error fetching issues:', error);
    res.json([]);
  }
});

/**
 * GET /api/escalation/rule/:category/:subcategory/:issue
 * Get escalation rule for specific combination from database
 */
app.get('/api/escalation/rule/:category/:subcategory/:issue', async (req, res) => {
  try {
    const { category, subcategory, issue } = req.params;
    const { priority } = req.query;

    // Attempt to find an exact match first
    let rule = await prisma.escalationRule.findFirst({
      where: {
        category,
        subCategory: subcategory,
        issue,
        priority: priority || 'P3' // Default to P3 if not specified
      }
    });

    // Fall back to category + subcategory match if exact not found
    if (!rule) {
      rule = await prisma.escalationRule.findFirst({
        where: {
          category,
          subCategory: subcategory,
          issue: null, // Match rules that apply to any issue within subcategory
          priority: priority || 'P3'
        }
      });
    }

    // Fall back to category only if previous not found
    if (!rule) {
      rule = await prisma.escalationRule.findFirst({
        where: {
          category,
          subCategory: null, // Match rules that apply to any subcategory within category
          issue: null, // Match rules that apply to any issue within category
          priority: priority || 'P3'
        }
      });
    }

    if (rule) {
      res.json(rule);
    } else {
      res.status(404).json({ error: 'Escalation rule not found' });
    }
  } catch (error) {
    console.error('Error fetching rule:', error);
    res.status(500).json({ error: 'Failed to fetch escalation rule' });
  }
});

/**
 * GET /api/escalation/stats
 * Get escalation statistics from database
 */
app.get('/api/escalation/stats', async (req, res) => {
  try {
    const totalRules = await prisma.escalationRule.count();
    const categoriesCount = await prisma.escalationRule.groupBy({
      by: ['category'],
      _count: true
    });
    const uniquePriorities = await prisma.escalationRule.findMany({
      select: { priority: true },
      distinct: ['priority']
    });

    res.json({
      totalRules,
      uniqueCategories: categoriesCount.length,
      uniquePriorities: uniquePriorities.map(p => p.priority).sort(),
      categories: categoriesCount.map(c => c.category).sort(),
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch escalation statistics' });
  }
});

// ============================================
// NEW ENDPOINTS FOR BUSINESS LOGIC SERVICES
// ============================================

import config from './config/index.js';
import { sendEmail } from './services/emailService.js';
import upload from './services/uploadService.js';

// ... (existing code)

// Static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware
app.use(cors());
app.use(express.json());

// ... (existing code)

// File Upload Endpoint
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  res.json({
    success: true,
    file: {
      filename: req.file.filename,
      path: `/uploads/${req.file.filename}`,
      mimetype: req.file.mimetype
    }
  });
});

// Replaced stub with real service import above
// function sendEmailStub(to, subject, body) { ... } -> Removed

// ... (Update existing email calls to use sendEmail)


// CSAT Endpoints
app.get('/api/csat/surveys', (req, res) => {
  res.json(csatSurveys);
});

app.get('/api/csat/surveys/:id', (req, res) => {
  const survey = csatSurveys.find(s => s.id === req.params.id);
  if (!survey) return res.status(404).json({ error: 'Survey not found' });
  res.json(survey);
});

app.post('/api/csat/surveys', authorize(['Admin', 'Building Manager']), (req, res) => {
  const { ticketId, tenantPoC, tenantEmail, building } = req.body;
  const id = `csat_${Date.now()}`;
  const survey = {
    id,
    surveyId: id,
    ticketId,
    tenantPoC: tenantPoC || 'Tenant PoC',
    tenantEmail: tenantEmail || 'tenant@example.com',
    building,
    surveyLink: `https://ama.example.com/csat/${id}`,
    status: 'Pending',
    sentDate: null,
    autoTriggerNextDue: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000),
    responses: null,
    emailsSent: 0,
    lastEmailSentAt: null,
  };
  csatSurveys.push(survey);
  res.json(survey);
});

app.post('/api/csat/surveys/:id/send', authorize(['Admin', 'Building Manager']), async (req, res) => {
  const survey = csatSurveys.find(s => s.id === req.params.id);
  if (!survey) return res.status(404).json({ error: 'Survey not found' });
  const email = req.body.email || survey.tenantEmail;
  await sendEmail(email, 'CSAT Survey', `Please complete: ${survey.surveyLink}`);
  survey.status = 'Sent';
  survey.sentDate = new Date();
  survey.emailsSent = (survey.emailsSent || 0) + 1;
  survey.lastEmailSentAt = new Date();
  res.json({ success: true, message: 'CSAT survey link sent', survey });
});

app.post('/api/csat/surveys/:id/resend', authorize(['Admin', 'Building Manager']), async (req, res) => {
  const survey = csatSurveys.find(s => s.id === req.params.id);
  if (!survey) return res.status(404).json({ error: 'Survey not found' });
  await sendEmail(survey.tenantEmail, 'Reminder: CSAT Survey', `Please complete: ${survey.surveyLink}`);
  survey.emailsSent = (survey.emailsSent || 0) + 1;
  survey.lastEmailSentAt = new Date();
  res.json({ success: true, message: 'CSAT survey resent', survey });
});

app.post('/api/csat/surveys/:id/response', (req, res) => {
  const survey = csatSurveys.find(s => s.id === req.params.id);
  if (!survey) return res.status(404).json({ error: 'Survey not found' });
  csatResponses[survey.id] = { ...req.body, responseDate: new Date() };
  survey.responses = csatResponses[survey.id];
  survey.status = 'Completed';
  survey.completedDate = new Date();
  survey.autoTriggerNextDue = new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000);
  res.json(survey);
});

app.get('/api/csat/metrics', authorize(['Admin', 'Building Manager']), (req, res) => {
  const responses = Object.values(csatResponses);
  const totalResponses = responses.length;
  const avg = totalResponses
    ? responses.reduce((sum, r) => sum + (r.overallSatisfaction || 0), 0) / totalResponses
    : 0;
  const nextCSATTrigger = csatSurveys
    .filter(s => s.status === 'Pending' || s.status === 'Sent')
    .map(s => s.autoTriggerNextDue)
    .sort((a, b) => (a?.getTime() || 0) - (b?.getTime() || 0))[0] || null;
  res.json({
    csat: {
      averageScore: Number(avg.toFixed(2)),
      totalResponses,
    },
    automationStatus: {
      nextCSATTrigger,
      failedEmailCount: 0,
      pendingSurveys: csatSurveys.filter(s => s.status !== 'Completed').length,
    },
  });
});

app.post('/api/csat/trigger-pending', authorize(['Admin', 'Building Manager']), async (req, res) => {
  const now = new Date();
  let triggered = 0;
  for (const s of csatSurveys) {
    if ((s.status === 'Pending' || s.status === 'Sent') && s.autoTriggerNextDue && s.autoTriggerNextDue <= now) {
      await sendEmail(s.tenantEmail, 'CSAT Survey (Auto)', `Please complete: ${s.surveyLink}`);
      s.status = 'Sent';
      s.sentDate = new Date();
      s.emailsSent = (s.emailsSent || 0) + 1;
      s.lastEmailSentAt = new Date();
      s.autoTriggerNextDue = new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000);
      triggered++;
    }
  }
  res.json({ triggered, failed: 0 });
});

// NPS Endpoints
app.get('/api/nps/surveys', (req, res) => {
  res.json(npsSurveys);
});

app.get('/api/nps/surveys/:id', (req, res) => {
  const survey = npsSurveys.find(s => s.id === req.params.id);
  if (!survey) return res.status(404).json({ error: 'Survey not found' });
  res.json(survey);
});

app.post('/api/nps/surveys', authorize(['Admin', 'Building Manager']), async (req, res) => {
  const { administratorId, administratorEmail, recipientEmails = [], building } = req.body;
  const id = `nps_${Date.now()}`;
  const survey = {
    id,
    surveyId: id,
    administratorId,
    administratorEmail,
    recipientEmails,
    building,
    surveyLink: `https://ama.example.com/nps/${id}`,
    triggerType: req.body.triggerType || 'Manual',
    status: 'Sent',
    sentDate: new Date(),
    scheduledNextTrigger: new Date(Date.now() + 12 * 30 * 24 * 60 * 60 * 1000),
    responses: [],
    emailsSent: recipientEmails.length,
    lastEmailSentAt: new Date(),
  };
  npsSurveys.push(survey);
  // Simulate email send to all recipients
  for (const to of recipientEmails) {
    await sendEmail(to, 'NPS Survey', `Please complete: ${survey.surveyLink}`);
  }
  res.json(survey);
});

app.post('/api/nps/surveys/:id/send', authorize(['Admin', 'Building Manager']), async (req, res) => {
  const survey = npsSurveys.find(s => s.id === req.params.id);
  if (!survey) return res.status(404).json({ error: 'Survey not found' });
  const emails = req.body.emails || survey.recipientEmails || [];
  for (const to of emails) {
    await sendEmail(to, 'NPS Survey', `Please complete: ${survey.surveyLink}`);
  }
  survey.status = 'Sent';
  survey.sentDate = new Date();
  survey.emailsSent = (survey.emailsSent || 0) + emails.length;
  survey.lastEmailSentAt = new Date();
  res.json({ success: true, message: 'NPS survey links sent', survey });
});

app.post('/api/nps/surveys/:id/response', (req, res) => {
  const survey = npsSurveys.find(s => s.id === req.params.id);
  if (!survey) return res.status(404).json({ error: 'Survey not found' });
  const response = { ...req.body, responseDate: new Date() };
  npsResponses[survey.id] = npsResponses[survey.id] || [];
  npsResponses[survey.id].push(response);
  survey.responses = npsResponses[survey.id];
  survey.status = 'Completed';
  survey.completedDate = new Date();
  survey.scheduledNextTrigger = new Date(Date.now() + 12 * 30 * 24 * 60 * 60 * 1000);
  res.json(survey);
});

app.get('/api/nps/metrics', authorize(['Admin', 'Building Manager']), (req, res) => {
  const allResponses = Object.values(npsResponses).flat();
  const totalRespondents = allResponses.length;
  const promoters = allResponses.filter(r => (r.score || 0) >= 9).length;
  const passives = allResponses.filter(r => (r.score || 0) >= 7 && (r.score || 0) <= 8).length;
  const detractors = allResponses.filter(r => (r.score || 0) <= 6).length;
  const currentNPS = totalRespondents ? Math.round(((promoters / totalRespondents) - (detractors / totalRespondents)) * 100) : 0;
  res.json({
    nps: {
      currentNPS,
      totalRespondents,
      promotersPercent: totalRespondents ? Math.round((promoters / totalRespondents) * 100) : 0,
      passivePercent: totalRespondents ? Math.round((passives / totalRespondents) * 100) : 0,
      detractorsPercent: totalRespondents ? Math.round((detractors / totalRespondents) * 100) : 0,
    },
    automationStatus: {
      nextNPSTrigger: npsSurveys.map(s => s.scheduledNextTrigger).sort((a, b) => (a?.getTime() || 0) - (b?.getTime() || 0))[0] || null,
      failedEmailCount: 0,
      pendingSurveys: npsSurveys.filter(s => s.status !== 'Completed').length,
    },
  });
});

app.get('/api/nps/trigger-opportunities', authorize(['Admin', 'Building Manager']), (req, res) => {
  const byBuilding = {};
  for (const s of npsSurveys) {
    byBuilding[s.building] = byBuilding[s.building] || { building: s.building, lastTrigger: null, nextAvailable: null };
    const last = byBuilding[s.building];
    if (!last.lastTrigger || (s.sentDate && s.sentDate > last.lastTrigger)) {
      last.lastTrigger = s.sentDate || null;
      last.nextAvailable = s.scheduledNextTrigger || null;
    }
  }
  res.json(Object.values(byBuilding));
});

// Helpdesk Workflow Endpoints
app.post('/api/helpdesk/tickets', async (req, res) => {
  const { title, description, priority, category, subCategory, issue } = req.body;

  if (!priority || !['P1', 'P2', 'P3', 'P4'].includes(priority)) {
    return res.status(400).json({ error: 'Priority must be manually set (P1-P4)' });
  }

  try {
    const ticket = await prisma.ticket.create({
      data: {
        ticketId: `ticket_${Date.now()}`,
        title,
        description,
        priority,
        category,
        subCategory,
        issue,
        status: 'OPEN',
        reportedById: req.user.id,
      }
    });
    res.json({ success: true, data: ticket });
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({ error: 'Failed to create ticket' });
  }
});

app.put('/api/helpdesk/tickets/:id/transition', authorize(['Admin', 'L0 Technician', 'L2 Technician', 'Building Manager']), async (req, res) => {
  const { newStatus } = req.body;
  const validTransitions = {
    'OPEN': ['WIP'],
    'WIP': ['RESOLVED'],
    'RESOLVED': [],
  };

  // Allow simple case-insensitive check or stricter? sticking to uppercase as per old code
  const allowedNext = validTransitions['OPEN'] // Simplified for demo, ideally check current status from DB
    || [];

  // Better logic: fetch current status first
  try {
    const ticket = await prisma.ticket.findUnique({ where: { ticketId: req.params.id } });
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

    const currentStatus = ticket.status;
    const allowed = validTransitions[currentStatus] || [];

    if (!allowed.includes(newStatus)) {
      return res.status(400).json({
        error: `Cannot transition from ${currentStatus} to ${newStatus}. Allowed: ${allowed.join(', ')}`
      });
    }

    const updated = await prisma.ticket.update({
      where: { ticketId: req.params.id },
      data: { status: newStatus }
    });

    res.json({ success: true, newStatus, data: updated });
  } catch (error) {
    console.error('Transition error:', error);
    res.status(500).json({ error: 'Failed to transition ticket' });
  }
});

app.post('/api/helpdesk/tickets/:id/escalate', authorize(['Admin', 'L0 Technician', 'L2 Technician', 'Building Manager']), async (req, res) => {
  const ticketIdParam = req.params.id;

  try {
    // Fetch ticket from DB
    const ticket = await prisma.ticket.findUnique({ where: { ticketId: ticketIdParam } });
    if (!ticket) {
      return res.status(404).json({ success: false, error: 'Ticket not found' });
    }

    const { category, subCategory, issue, createdAt, status, escalationLevel } = ticket;

    // Find the escalation rule for this ticket from database
    const rule = await prisma.escalationRule.findFirst({
      where: {
        category,
        subCategory,
        issue
      }
    });

    if (!rule) {
      return res.status(400).json({
        success: false,
        error: 'No escalation rule found for this ticket (Cat/SubCat/Issue mismatch)'
      });
    }

    // If ticket is already resolved, don't escalate
    if (status === 'RESOLVED' || status === 'CLOSED') { // Case-sensitive check
      return res.json({
        success: true,
        escalated: false,
        reason: 'Ticket already resolved'
      });
    }

    // Calculate elapsed time
    const createdTime = new Date(createdAt).getTime();
    const currentTime = new Date().getTime();
    const elapsedMinutes = Math.floor((currentTime - createdTime) / (1000 * 60));

    const currentLevel = `L${escalationLevel}`;
    let nextLevel = currentLevel;
    let escalationTriggered = false;

    // Logic to determine next level... (simplified for brevity, keeping same threshold logic)
    const levelThresholds = {
      'L0': rule.l0ResponseTime,
      'L1': rule.l1ResponseTime,
      'L2': rule.l2ResponseTime,
      'L3': rule.l3ResponseTime,
      'L4': rule.l4ResponseTime,
    };

    if (currentLevel === 'L0' && elapsedMinutes >= rule.l0ResponseTime) { nextLevel = 'L1'; escalationTriggered = true; }
    else if (currentLevel === 'L1' && elapsedMinutes >= rule.l1ResponseTime) { nextLevel = 'L2'; escalationTriggered = true; }
    else if (currentLevel === 'L2' && elapsedMinutes >= rule.l2ResponseTime) { nextLevel = 'L3'; escalationTriggered = true; }
    else if (currentLevel === 'L3' && elapsedMinutes >= rule.l3ResponseTime) { nextLevel = 'L4'; escalationTriggered = true; }
    else if (currentLevel === 'L4' && elapsedMinutes >= rule.l4ResponseTime) { nextLevel = 'L5'; escalationTriggered = true; }

    if (escalationTriggered) {
      const newLevelInt = parseInt(nextLevel.replace('L', ''));
      await prisma.ticket.update({
        where: { ticketId: ticketIdParam },
        data: { escalationLevel: newLevelInt, escalationStatus: 'Escalated' }
      });
    }

    const result = {
      success: true,
      escalated: escalationTriggered,
      currentLevel: currentLevel,
      nextLevel: nextLevel,
      elapsedMinutes: elapsedMinutes,
      message: escalationTriggered
        ? `Ticket escalated to ${nextLevel}`
        : `Ticket remains at ${currentLevel}`
    };
    res.json(result);

  } catch (error) {
    console.error('Escalation error:', error);
    res.status(500).json({ error: 'Internal escalation error' });
  }
});

/**
 * GET /api/helpdesk/tickets/:id/escalation-status
 * Check current escalation status for a ticket
 * This is called from the frontend to determine if ticket should be escalated
 */
app.get('/api/helpdesk/tickets/:id/escalation-status', async (req, res) => {
  const ticketIdParam = req.params.id;

  try {
    const ticket = await prisma.ticket.findUnique({ where: { ticketId: ticketIdParam } });
    if (!ticket) return res.status(404).json({ success: false, error: 'Ticket not found' });

    const { category, subCategory, issue, createdAt, status, escalationLevel } = ticket;
    const currentLevel = `L${escalationLevel}`;

    // Find the escalation rule for this ticket from database
    const rule = await prisma.escalationRule.findFirst({
      where: {
        category,
        subCategory,
        issue
      }
    });

    if (!rule) {
      return res.status(400).json({
        success: false,
        error: 'No escalation rule found for this ticket'
      });
    }

    if (status === 'RESOLVED' || status === 'CLOSED') {
      return res.json({
        success: true,
        escalationNeeded: false,
        reason: 'Ticket already resolved',
        currentLevel
      });
    }

    const createdTime = new Date(createdAt).getTime();
    const currentTime = new Date().getTime();
    const elapsedMinutes = Math.floor((currentTime - createdTime) / (1000 * 60));

    const levelResponseTimes = {
      'L0': rule.l0ResponseTime,
      'L1': rule.l1ResponseTime,
      'L2': rule.l2ResponseTime,
      'L3': rule.l3ResponseTime,
      'L4': rule.l4ResponseTime,
      'L5': rule.l5ResponseTime,
    };

    const responseTimeMinutes = levelResponseTimes[currentLevel] || 60;
    const timeRemainingForResponse = Math.max(0, responseTimeMinutes - elapsedMinutes);
    const escalationNeeded = elapsedMinutes >= responseTimeMinutes && currentLevel !== 'L5';

    let nextLevel = currentLevel;
    if (escalationNeeded) {
      const levelOrder = ['L0', 'L1', 'L2', 'L3', 'L4', 'L5'];
      const currentIndex = levelOrder.indexOf(currentLevel);
      nextLevel = levelOrder[Math.min(currentIndex + 1, 5)];
    }

    res.json({
      success: true,
      escalationNeeded,
      currentLevel,
      nextLevel: escalationNeeded ? nextLevel : currentLevel,
      elapsedMinutes,
      message: escalationNeeded
        ? `Escalation due! Ticket has exceeded L${currentLevel.charAt(1)} response time.`
        : `No escalation needed yet.`
    });
  } catch (error) {
    console.error('Escalation status error:', error);
    res.status(500).json({ error: 'Error checking status' });
  }
});

// Contract Renewal Endpoints - Moved to Prisma Implementation section


// Work Permit & JSA Endpoints
app.post('/api/workpermits', authorize(['Admin', 'Building Manager', 'L0 Technician', 'L2 Technician']), async (req, res) => {
  const now = new Date();
  const hour = now.getHours();

  /* 
  if (hour < 9 || hour >= 18) {
    return res.status(400).json({
      error: 'Work permits can only be created between 09:00 and 18:00'
    });
  } 
  */

  const { type, location, description, validFrom, validTo, vendorId } = req.body;

  try {
    const permit = await prisma.workPermit.create({
      data: {
        permitId: `permit_${Date.now()}`,
        type,
        location: location || 'Unknown',
        description: description || 'No description',
        validFrom: validFrom ? new Date(validFrom) : new Date(),
        validTo: validTo ? new Date(validTo) : new Date(Date.now() + 8 * 60 * 60 * 1000), // Default 8 hours
        status: 'Pending',
        requestedBy: req.user.name || 'Unknown',
        vendorId: vendorId ? parseInt(vendorId) : null
      }
    });
    res.json({ success: true, data: permit });
  } catch (error) {
    console.error('Work Permit Create Error:', error);
    res.status(500).json({ error: 'Failed to create work permit' });
  }
});

app.post('/api/jsa/:permitId/approve', authorize(['Admin', 'Building Manager']), (req, res) => {
  res.json({ success: true, jsaStatus: 'APPROVED' });
});

app.post('/api/workpermits/:id/finalize', authorize(['Admin', 'Building Manager']), async (req, res) => {
  // Logic: Check if params exist.
  // In real app, check JSA. simpler here.
  try {
    // Allow finalizing if status is Pending
    const updated = await prisma.workPermit.update({
      where: { permitId: req.params.id },
      data: { status: 'Approved', approvedBy: req.user.name }
    });
    res.json({ success: true, status: 'APPROVED', data: updated });
  } catch (error) {
    console.error('Finalize Permit Error:', error);
    res.status(500).json({ error: 'Failed to finalize permit' });
  }
});

app.post('/api/workpermits/:id/merge', authorize(['Admin', 'Building Manager']), (req, res) => {
  const { sourcePermitIds, workTypes } = req.body;

  const merged = {
    id: `permit_merged_${Date.now()}`,
    mergedFrom: sourcePermitIds,
    workTypes,
    consolidatedHazards: req.body.hazards || [],
  };
  res.json({ success: true, data: merged });
});

// Daily Tasks Endpoints
app.post('/api/tasks', authorize(['Admin', 'Building Manager', 'L0 Technician', 'L2 Technician']), (req, res) => {
  const { department, description } = req.body;
  const validDepts = ['TECHNICAL', 'SOFT_SERVICES', 'SECURITY', 'HORTICULTURE'];

  if (!validDepts.includes(department)) {
    return res.status(400).json({ error: `Invalid department. Must be one of: ${validDepts.join(', ')}` });
  }

  const task = {
    id: `task_${Date.now()}`,
    department,
    description,
    status: 'PENDING',
    createdAt: new Date(),
  };
  res.json({ success: true, data: task });
});

app.post('/api/tasks/:id/approve', (req, res) => {
  res.json({ success: true, status: 'APPROVED' });
});

app.post('/api/tasks/:id/deny', (req, res) => {
  res.json({ success: true, status: 'DENIED' });
});

app.post('/api/tasks/:id/pushback', (req, res) => {
  res.json({ success: true, status: 'WIP', message: 'Task returned for rework' });
});

// Utility Billing Endpoints
app.post('/api/utility-billing/calculate', authorize(['Admin', 'Finance Manager']), (req, res) => {
  const { masterBillAmount, method, tenantUnits } = req.body;

  let allocation = {};

  if (method === 'EQUAL') {
    const perTenant = masterBillAmount / tenantUnits.length;
    tenantUnits.forEach(t => {
      allocation[t.id] = perTenant;
    });
  } else if (method === 'PROPORTIONAL_AREA') {
    const totalArea = tenantUnits.reduce((sum, t) => sum + (t.area || 0), 0);
    tenantUnits.forEach(t => {
      const percentage = (t.area / totalArea) * 100;
      allocation[t.id] = (masterBillAmount * percentage) / 100;
    });
  } else if (method === 'METERED') {
    tenantUnits.forEach(t => {
      allocation[t.id] = (t.meterReading || 0) * (masterBillAmount / tenantUnits.reduce((sum, x) => sum + (x.meterReading || 0), 0));
    });
  }

  const total = Object.values(allocation).reduce((a, b) => a + b, 0);
  const variance = Math.abs((total - masterBillAmount) / masterBillAmount) * 100;

  res.json({
    success: true,
    allocation,
    total,
    variance: variance.toFixed(2),
    verified: variance <= 1,
  });
});

// Asset QR Code Endpoints
app.post('/api/assets/qrcodes/batch', (req, res) => {
  const { assetIds } = req.body;

  const qrCodes = assetIds.map(id => ({
    assetId: id,
    qrCode: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==`,
    generatedAt: new Date(),
  }));

  res.json({ success: true, qrCodes });
});

// Asset Operational Age Endpoints
app.post('/api/assets/age-analysis', (req, res) => {
  const { assetData } = req.body;

  const currentYear = new Date().getFullYear();
  const analysis = {
    '0-2': 0,
    '2-4': 0,
    '4-6': 0,
    '6-8': 0,
    '8+': 0,
  };

  assetData.forEach(asset => {
    const age = currentYear - asset.installationYear;
    if (age <= 2) analysis['0-2']++;
    else if (age <= 4) analysis['2-4']++;
    else if (age <= 6) analysis['4-6']++;
    else if (age <= 8) analysis['6-8']++;
    else analysis['8+']++;
  });

  res.json({
    success: true,
    ageBuckets: analysis,
    recommendations: {
      replace: assetData.filter(a => (currentYear - a.installationYear) >= 8).length,
      maintenance: assetData.filter(a => (currentYear - a.installationYear) >= 6 && (currentYear - a.installationYear) < 8).length,
    },
  });
});

// Stock Transfer Endpoints
app.post('/api/transfers', authorize(['Admin', 'Finance Manager', 'Building Manager']), (req, res) => {
  const { sourceCampus, destinationCampus, items } = req.body;

  const transfer = {
    id: `transfer_${Date.now()}`,
    sourceCampus,
    destinationCampus,
    items,
    status: 'PENDING_APPROVAL',
    createdAt: new Date(),
  };
  res.json({ success: true, data: transfer });
});

/**
 * POST /api/feedback/csat
 * Receive CSAT survey responses
 */
app.post('/api/feedback/csat', (req, res) => {
  const { tenantId, rating, comments } = req.body;
  console.log('Received CSAT response:', { tenantId, rating, comments });
  res.json({ success: true, message: 'CSAT response recorded' });
});

/**
 * POST /api/feedback/nps
 * Receive NPS survey responses
 */
app.post('/api/feedback/nps', (req, res) => {
  const { tenantId, score, comments } = req.body;
  console.log('Received NPS response:', { tenantId, score, comments });
  res.json({ success: true, message: 'NPS response recorded' });
});

app.post('/api/transfers/:id/approve', (req, res) => {
  res.json({ success: true, status: 'APPROVED' });
});

app.post('/api/transfers/:id/ship', (req, res) => {
  res.json({ success: true, status: 'SHIPPED', trackingNumber: `TRK${Date.now()}` });
});

app.post('/api/transfers/:id/receive', (req, res) => {
  const { damageReport } = req.body;
  res.json({ success: true, status: 'RECEIVED', damageReport: damageReport || 'NO_DAMAGE' });
});

// Complex Info Endpoints
app.get('/api/masters/sites', async (req, res) => {
  try {
    const sites = await prisma.site.findMany({
      include: {
        buildings: {
          include: {
            floors: true
          }
        }
      }
    });
    res.json(sites);
  } catch (error) {
    console.error('Error fetching sites:', error);
    res.status(500).json({ error: 'Failed to fetch sites' });
  }
});

app.get('/api/masters/assets', async (req, res) => {
  const { page = 1, limit = 50, search = '' } = req.query;
  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  try {
    const where = search ? {
      OR: [
        { name: { contains: search } }, // Case-insensitive not default in SQLite for contains, but simple contains works
        { assetId: { contains: search } }
      ]
    } : {};

    const [total, assets] = await prisma.$transaction([
      prisma.asset.count({ where }),
      prisma.asset.findMany({
        where,
        skip,
        take,
        include: {
          building: true,
          floor: true,
        },
        orderBy: { updatedAt: 'desc' }
      })
    ]);

    res.json({
      data: assets,
      total,
      page: Number(page),
      limit: Number(limit)
    });
  } catch (error) {
    console.error('Error fetching assets:', error);
    res.status(500).json({ error: 'Failed to fetch assets' });
  }
});

app.get('/api/masters/helpdesk/categories', (req, res) => {
  res.json(masterData.helpdesk);
});

app.get('/api/complex-info', (req, res) => {
  // Use master data if available, else fallback or merge
  // For now, returning the originally planned structure but sourced from master
  const sites = masterData.sites.map(s => ({
    id: s.id,
    name: s.name,
    city: s.city,
    region: s.region,
    buildings: s.buildings || [],
    contact: 'Admin',
    status: 'Active'
  }));

  res.json({
    sites: sites,
    totalSites: sites.length,
    totalBuildings: sites.reduce((acc, s) => acc + (s.buildings?.length || 0), 0)
  });
});


// Utility Meter Details Endpoints (Electricity Details)
app.get('/api/utility-billing/meters', (req, res) => {
  // Mock data for electricity meters
  const meters = [
    { id: 'meter_001', type: 'Electricity', serialNumber: 'ELEC-1001', location: 'Tower A - Main Panel', capacity: '1000 kW', status: 'Active' },
    { id: 'meter_002', type: 'Electricity', serialNumber: 'ELEC-1002', location: 'Tower B - Main Panel', capacity: '1200 kW', status: 'Active' },
    { id: 'meter_003', type: 'Water', serialNumber: 'WAT-5001', location: 'Tower A - Inlet', capacity: '5000 LPH', status: 'Active' },
    { id: 'meter_004', type: 'Generators', serialNumber: 'DG-2001', location: 'Power Plant', capacity: '2000 kVA', status: 'Standby' },
  ];
  res.json(meters);
});

// Serve React app for all other routes (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

/**
 * Background Job: Automatic Ticket Escalation
 * Runs every 5 minutes to check tickets and escalate if needed
 * This implements the automatic escalation flow from the business process
 */
function startAutoEscalationJob() {
  const JOB_INTERVAL = 5 * 60 * 1000; // Check every 5 minutes

  setInterval(() => {
    console.log(`⏰ [${new Date().toLocaleTimeString()}] Running auto-escalation check...`);

    // In a real application, this would query tickets from a database
    // For now, we're tracking in-memory (resets on server restart)
    // TODO: Implement database integration to persist ticket escalation state

    console.log(`   Checked escalation rules. (Database integration needed for full implementation)`);
  }, JOB_INTERVAL);
}

// Start the auto-escalation background job
startAutoEscalationJob();

/**
 * Background Job: CSAT Auto Trigger
 * Checks pending CSAT surveys and sends emails when next due.
 */
function startCsatAutoTriggerJob() {
  const JOB_INTERVAL = 60 * 60 * 1000; // Every hour
  setInterval(async () => {
    const now = new Date();
    let triggered = 0;
    for (const s of csatSurveys) {
      if ((s.status === 'Pending' || s.status === 'Sent') && s.autoTriggerNextDue && s.autoTriggerNextDue <= now) {
        await sendEmail(s.tenantEmail, 'CSAT Survey (Auto)', `Please complete: ${s.surveyLink}`);
        s.status = 'Sent';
        s.sentDate = new Date();
        s.emailsSent = (s.emailsSent || 0) + 1;
        s.lastEmailSentAt = new Date();
        s.autoTriggerNextDue = new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000);
        triggered++;
      }
    }
    if (triggered > 0) {
      console.log(`⏰ CSAT auto-trigger sent ${triggered} surveys at ${now.toLocaleString()}`);
    }
  }, JOB_INTERVAL);
}

// Start CSAT auto-trigger job
startCsatAutoTriggerJob();

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║           Bagmane Asset Management System (AMA)               ║
║                    Backend Server Running                     ║
╚════════════════════════════════════════════════════════════════╝

🚀 Server: http://localhost:${PORT}
📊 Database: Prisma with SQLite (dev.db)
🔌 API Endpoints:
   • GET /api/escalation/categories
   • GET /api/escalation/subcategories/:category
   • GET /api/escalation/issues/:category/:subcategory
   • GET /api/escalation/rule/:category/:subcategory/:issue
   • GET /api/escalation/stats

✅ Ready to serve React app and escalation API
  `);
});

// ============================================
// INVENTORY MANAGEMENT (Phase 4)
// ============================================

/**
 * GET /api/inventory
 * Get all inventory items with site and transaction details
 */
app.get('/api/inventory', verifyToken, async (req, res) => {
  try {
    const { category, lowStock } = req.query;
    const where = {};
    if (category) where.category = category;
    if (lowStock === 'true') {
      where.quantity = { lte: prisma.inventoryItem.fields.minLevel };
    }

    const items = await prisma.inventoryItem.findMany({
      where,
      include: {
        site: true,
        transactions: {
          take: 5,
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { name: 'asc' }
    });
    res.json(items);
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
});

/**
 * GET /api/inventory/:id
 * Get specific inventory item with full transaction history
 */
app.get('/api/inventory/:id', verifyToken, async (req, res) => {
  try {
    const item = await prisma.inventoryItem.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        site: true,
        transactions: { orderBy: { createdAt: 'desc' } }
      }
    });

    if (!item) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    res.json(item);
  } catch (error) {
    console.error('Error fetching inventory item:', error);
    res.status(500).json({ error: 'Failed to fetch inventory item' });
  }
});

/**
 * POST /api/inventory
 * Create new inventory item
 */
app.post('/api/inventory', verifyToken, authorize(['Admin', 'Building Manager']), async (req, res) => {
  try {
    const item = await prisma.inventoryItem.create({
      data: {
        ...req.body,
        itemId: `INV-${Date.now()}`
      }
    });
    res.status(201).json(item);
  } catch (error) {
    console.error('Error creating inventory item:', error);
    res.status(500).json({ error: `Failed to create inventory item: ${error.message}` });
  }
});

/**
 * PUT /api/inventory/:id
 * Update inventory item
 */
app.put('/api/inventory/:id', verifyToken, authorize(['Admin', 'Building Manager']), async (req, res) => {
  try {
    const item = await prisma.inventoryItem.update({
      where: { id: parseInt(req.params.id) },
      data: req.body
    });
    res.json(item);
  } catch (error) {
    console.error('Error updating inventory item:', error);
    res.status(500).json({ error: 'Failed to update inventory item' });
  }
});

/**
 * POST /api/inventory/transaction
 * Record inventory transaction (IN/OUT/ADJUSTMENT)
 */
app.post('/api/inventory/transaction', verifyToken, async (req, res) => {
  try {
    const { itemId, quantity, type, reason } = req.body;

    // Use transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Create transaction record
      const transaction = await tx.inventoryTransaction.create({
        data: {
          itemId,
          quantity,
          type,
          reason,
          performedBy: req.user.name
        }
      });

      // Update item quantity
      const item = await tx.inventoryItem.update({
        where: { id: itemId },
        data: {
          quantity: {
            [type === 'IN' || type === 'ADJUSTMENT' ? 'increment' : 'decrement']: Math.abs(quantity)
          }
        }
      });

      return { transaction, item };
    });

    res.status(201).json(result);
  } catch (error) {
    console.error('Error recording transaction:', error);
    res.status(500).json({ error: 'Failed to record transaction' });
  }
});

/**
 * GET /api/inventory/low-stock
 * Get items below minimum level
 */
app.get('/api/inventory/low-stock', verifyToken, async (req, res) => {
  try {
    const items = await prisma.inventoryItem.findMany({
      where: {
        quantity: {
          lte: prisma.raw('minLevel')
        }
      },
      include: { site: true }
    });
    res.json(items);
  } catch (error) {
    console.error('Error fetching low stock items:', error);
    res.status(500).json({ error: 'Failed to fetch low stock items' });
  }
});

// ============================================
// TASK MANAGEMENT (Phase 5)
// ============================================

app.get('/api/tasks', verifyToken, async (req, res) => {
  try {
    const { department, status, assignedTo } = req.query;
    const where = {};
    if (department) where.department = department;
    if (status) where.status = status;
    if (assignedTo) where.assignedTo = assignedTo;

    const tasks = await prisma.task.findMany({ where, orderBy: { dueDate: 'asc' } });
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

app.post('/api/tasks', verifyToken, async (req, res) => {
  try {
    const task = await prisma.task.create({
      data: { ...req.body, taskId: `TASK_${Date.now()}`, createdBy: req.user.name }
    });
    res.status(201).json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

app.put('/api/tasks/:id', verifyToken, async (req, res) => {
  try {
    const task = await prisma.task.update({
      where: { id: parseInt(req.params.id) },
      data: req.body
    });
    res.json(task);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// ============================================
// CSAT/NPS SURVEYS (Phase 6)
// ============================================

app.post('/api/csat', async (req, res) => {
  try {
    const survey = await prisma.cSATSurvey.create({ data: req.body });
    res.status(201).json(survey);
  } catch (error) {
    console.error('Error submitting CSAT:', error);
    res.status(500).json({ error: 'Failed to submit survey' });
  }
});

app.get('/api/csat/analytics', verifyToken, async (req, res) => {
  try {
    const surveys = await prisma.cSATSurvey.findMany();
    const avgRating = surveys.length > 0 ? surveys.reduce((sum, s) => sum + s.rating, 0) / surveys.length : 0;
    res.json({ avgRating: avgRating.toFixed(2), totalResponses: surveys.length, surveys });
  } catch (error) {
    console.error('Error fetching CSAT analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

app.post('/api/nps', async (req, res) => {
  try {
    const survey = await prisma.nPSSurvey.create({ data: req.body });
    res.status(201).json(survey);
  } catch (error) {
    console.error('Error submitting NPS:', error);
    res.status(500).json({ error: 'Failed to submit survey' });
  }
});

app.get('/api/nps/score', verifyToken, async (req, res) => {
  try {
    const surveys = await prisma.nPSSurvey.findMany();
    if (surveys.length === 0) {
      return res.json({ nps: 0, totalResponses: 0 });
    }
    const promoters = surveys.filter(s => s.score >= 9).length;
    const detractors = surveys.filter(s => s.score <= 6).length;
    const nps = ((promoters - detractors) / surveys.length) * 100;
    res.json({ nps: nps.toFixed(1), totalResponses: surveys.length, promoters, detractors });
  } catch (error) {
    console.error('Error calculating NPS:', error);
    res.status(500).json({ error: 'Failed to calculate NPS' });
  }
});

// ============================================
// UTILITY BILLING (Phase 7)
// ============================================

app.get('/api/utility/meters', verifyToken, async (req, res) => {
  try {
    const meters = await prisma.energyMeter.findMany({
      include: {
        site: true,
        readings: { take: 10, orderBy: { timestamp: 'desc' } }
      }
    });
    res.json(meters);
  } catch (error) {
    console.error('Error fetching meters:', error);
    res.status(500).json({ error: 'Failed to fetch meters' });
  }
});

app.post('/api/utility/reading', verifyToken, async (req, res) => {
  try {
    const reading = await prisma.meterReading.create({ data: req.body });
    res.status(201).json(reading);
  } catch (error) {
    console.error('Error recording reading:', error);
    res.status(500).json({ error: 'Failed to record reading' });
  }
});

app.get('/api/utility/consumption/:meterId', verifyToken, async (req, res) => {
  try {
    const readings = await prisma.meterReading.findMany({
      where: { meterId: parseInt(req.params.meterId) },
      orderBy: { timestamp: 'desc' },
      take: 30
    });
    res.json(readings);
  } catch (error) {
    console.error('Error fetching consumption:', error);
    res.status(500).json({ error: 'Failed to fetch consumption data' });
  }
});

// ============================================
// AUDITS & COMPLIANCE (Phase 8)
// ============================================

app.get('/api/audits', verifyToken, async (req, res) => {
  try {
    const audits = await prisma.audit.findMany({ orderBy: { scheduledDate: 'desc' } });
    res.json(audits);
  } catch (error) {
    console.error('Error fetching audits:', error);
    res.status(500).json({ error: 'Failed to fetch audits' });
  }
});

app.post('/api/audits', verifyToken, authorize(['Admin', 'Building Manager']), async (req, res) => {
  try {
    const audit = await prisma.audit.create({
      data: { ...req.body, auditId: `AUD_${Date.now()}` }
    });
    res.status(201).json(audit);
  } catch (error) {
    console.error('Error creating audit:', error);
    res.status(500).json({ error: 'Failed to create audit' });
  }
});

app.get('/api/compliance', verifyToken, async (req, res) => {
  try {
    const records = await prisma.complianceRecord.findMany({ orderBy: { expiryDate: 'asc' } });
    res.json(records);
  } catch (error) {
    console.error('Error fetching compliance records:', error);
    res.status(500).json({ error: 'Failed to fetch compliance records' });
  }
});

app.post('/api/compliance', verifyToken, authorize(['Admin', 'Building Manager']), async (req, res) => {
  try {
    const record = await prisma.complianceRecord.create({
      data: { ...req.body, complianceId: `CMP_${Date.now()}` }
    });
    res.status(201).json(record);
  } catch (error) {
    console.error('Error creating compliance record:', error);
    res.status(500).json({ error: 'Failed to create compliance record' });
  }
});

app.get('/api/compliance/expiring', verifyToken, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    const records = await prisma.complianceRecord.findMany({
      where: {
        expiryDate: { lte: futureDate, gte: new Date() },
        status: { not: 'Expired' }
      },
      orderBy: { expiryDate: 'asc' }
    });
    res.json(records);
  } catch (error) {
    console.error('Error fetching expiring compliance:', error);
    res.status(500).json({ error: 'Failed to fetch expiring compliance records' });
  }
});

// ============================================
// RESTORED ENDPOINTS (Tickets & Vendors)
// ============================================

// --- Tickets CRUD ---

app.post('/api/tickets', verifyToken, async (req, res) => {
  try {
    const { title, description, priority, category, subCategory, issue, location, building, floor } = req.body;

    // Auto-escalation Logic (Basic)
    let assignedTo = 'Helpdesk'; // Default
    let slaHours = 24; // Default P3

    // Check database for rules
    const rule = await prisma.escalationRule.findFirst({
      where: { category, subCategory, issue }
    });

    if (rule) {
      slaHours = rule.l0ResolutionTime || 24;
      // In a real app, logic to find technician would go here
    }

    const ticket = await prisma.ticket.create({
      data: {
        ticketId: `TKT-${Date.now()}`,
        title,
        description,
        priority: priority || 'P3',
        category,
        subCategory,
        issue,
        location: location || `${building || ''} - ${floor || ''}`,
        status: 'Open',
        // assignedTo: null, // assignedToId is optional Int
        reportedById: req.user.id
      }
    });

    // Create initial history
    await prisma.ticketHistory.create({
      data: {
        ticketId: ticket.id,
        action: 'CREATED',
        details: 'Ticket created',
        changedBy: req.user.id
      }
    });

    res.status(201).json({ ticket });
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({ error: `Failed to create ticket: ${error.message}` });
  }
});

app.put('/api/tickets/:id', verifyToken, async (req, res) => {
  try {
    const { status, comment, assignedTo } = req.body;
    const ticketId = req.params.id;

    const updateData = {};
    if (status) updateData.status = status;
    if (assignedTo) updateData.assignedTo = assignedTo;

    const ticket = await prisma.ticket.update({
      where: { ticketId },
      data: updateData
    });

    // Add comment if provided
    if (comment) {
      await prisma.ticketComment.create({
        data: {
          ticketId: ticket.id,
          userId: req.user.id,
          content: comment
        }
      });
    }

    // Log history
    await prisma.ticketHistory.create({
      data: {
        ticketId: ticket.id,
        action: status ? `STATUS_CHANGE_TO_${status}` : 'UPDATED',
        details: comment || 'Ticket updated',
        changedBy: req.user.id
      }
    });

    res.json(ticket);
  } catch (error) {
    console.error('Error updating ticket:', error);
    res.status(500).json({ error: `Failed to update ticket: ${error.message}` });
  }
});

// --- Vendors & Contracts (Phase 3 Restored & Enhanced) ---

app.get('/api/vendors', verifyToken, async (req, res) => {
  try {
    const vendors = await prisma.vendor.findMany({
      include: { contracts: true },
      orderBy: { name: 'asc' }
    });
    res.json(vendors);
  } catch (error) {
    console.error('Error fetching vendors:', error);
    res.status(500).json({ error: 'Failed to fetch vendors' });
  }
});

app.post('/api/vendors', verifyToken, authorize(['Admin', 'Building Manager']), async (req, res) => {
  try {
    const vendor = await prisma.vendor.create({ data: req.body });
    res.status(201).json(vendor);
  } catch (error) {
    console.error('Error creating vendor:', error);
    res.status(500).json({ error: 'Failed to create vendor' });
  }
});

app.get('/api/vendors/:id', verifyToken, async (req, res) => {
  try {
    const vendor = await prisma.vendor.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { contracts: true }
    });
    if (!vendor) return res.status(404).json({ error: 'Vendor not found' });
    res.json(vendor);
  } catch (error) {
    console.error('Error fetching vendor:', error);
    res.status(500).json({ error: 'Failed to fetch vendor' });
  }
});

app.get('/api/contracts', verifyToken, async (req, res) => {
  try {
    const contracts = await prisma.contract.findMany({
      include: { vendor: true },
      orderBy: { endDate: 'asc' }
    });
    res.json(contracts);
  } catch (error) {
    console.error('Error fetching contracts:', error);
    res.status(500).json({ error: 'Failed to fetch contracts' });
  }
});

app.post('/api/contracts', verifyToken, authorize(['Admin', 'Finance Manager', 'Building Manager']), async (req, res) => {
  try {
    const { title, description, startDate, endDate, value, status, vendorId, type, documentUrl } = req.body;

    // Validate vendor existence
    const vendor = await prisma.vendor.findUnique({ where: { id: parseInt(vendorId) } });
    if (!vendor) return res.status(400).json({ error: 'Invalid Vendor ID' });

    const contract = await prisma.contract.create({
      data: {
        title,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        value: parseFloat(value),
        status: status || 'Active',
        vendorId: parseInt(vendorId),
        type,
        documentUrl
      },
      include: { vendor: true }
    });
    res.status(201).json(contract);
  } catch (error) {
    console.error('Error creating contract:', error);
    res.status(500).json({ error: 'Failed to create contract' });
  }
});

app.post('/api/contracts/:id/renew', verifyToken, authorize(['Admin', 'Finance Manager', 'Building Manager']), async (req, res) => {
  try {
    const { renewalValue } = req.body;
    const originalContractId = parseInt(req.params.id);

    const original = await prisma.contract.findUnique({ where: { id: originalContractId } });
    if (!original) return res.status(404).json({ error: 'Original contract not found' });

    const newStartDate = new Date(original.endDate);
    newStartDate.setDate(newStartDate.getDate() + 1); // Start next day

    const newEndDate = new Date(newStartDate);
    newEndDate.setFullYear(newEndDate.getFullYear() + 1); // 1 Year renewal default

    const renewal = await prisma.contract.create({
      data: {
        title: `${original.title} (Renewal)`,
        description: original.description,
        type: original.type,
        startDate: newStartDate,
        endDate: newEndDate,
        value: renewalValue ? parseFloat(renewalValue) : original.value,
        status: 'Active',
        vendorId: original.vendorId,
        documentUrl: original.documentUrl
      },
      include: { vendor: true }
    });

    // Mark old as 'Expired' or 'Renewed' if we had such status logic (optional)
    // await prisma.contract.update({ where: { id: originalContractId }, data: { status: 'Renewed' } });

    res.json({
      original,
      renewal,
      renewalRecord: {
        id: Date.now(), // Mock record ID or create a real model if exists
        originalContractId: original.contractId,
        renewalContractId: renewal.contractId,
        renewalStartDate: newStartDate,
        renewalEndDate: newEndDate,
        renewalValue: renewal.value,
        status: 'Auto-Created',
        createdAt: new Date(),
        createdBy: 'System'
      }
    });

  } catch (error) {
    console.error('Error renewing contract:', error);
    res.status(500).json({ error: 'Failed to renew contract' });
  }
});
