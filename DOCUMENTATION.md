# Bagmane Asset Management System - Documentation Index

## Primary Documentation

### 📚 **KT & Handover Guide** (READ THIS FIRST!)
📄 **File:** `KT_HANDOVER_GUIDE.md`  
📌 **Size:** 27 KB  
📋 **Contents:**
- Executive summary of the system
- Complete technology stack breakdown
- Architecture overview and data flow
- All 18+ modules explained in detail
- Development guidelines and best practices
- **IMPORTANT:** React vs React Native decision and migration roadmap
- Deployment instructions
- Troubleshooting guide
- React Native migration phases (Q1 2026 - Q1 2027)

**👉 Start here if you're new to the project**

---

## README File
📄 **File:** `README.md`  
📌 **Quick project overview**

---

## Code Documentation

### Key Source Files to Review
1. **`types.ts`** - All TypeScript type definitions
2. **`App.tsx`** - Main application structure
3. **`hooks/useMockData.ts`** - State management pattern
4. **`server.js`** - Backend API implementation
5. **`components/Dashboard.tsx`** - Entry point component

### Module Documentation
See `KT_HANDOVER_GUIDE.md` sections:
- **Section 3:** Asset Management
- **Section 4:** Ticketing & Helpdesk (with 96 escalation rules)
- **Section 5:** Work Permits & Safety
- **Section 6:** Inventory Management
- **Section 7:** Vendor & Contract Management
- **Section 8:** Preventive Maintenance
- **Section 9:** Compliance & Auditing
- **Section 10:** ESG & Utility Management
- **Section 11:** User & Site Management
- **Section 12:** Communication Modules
- **Section 13:** Transition & Facilities

---

## 📡 API ENDPOINTS - COMPLETE REFERENCE

### Server Configuration
- **Backend Port:** 3001 (development)
- **Frontend Port:** 3000 (development)
- **Base URL:** `http://localhost:3001`
- **CORS:** Enabled for all origins
- **Data Format:** JSON

---

### 🎯 ESCALATION RULES ENDPOINTS

#### 1. **Get All Categories**
```
GET /api/escalation/categories
Response: Array of category names (sorted)
Example: ["Technical", "Soft Services", "Security Services", "Horticulture", "Transport", "Admin"]
```

#### 2. **Get Subcategories for Category**
```
GET /api/escalation/subcategories/:category
Params: category (string)
Response: Array of subcategories
Example: Technical → ["Electrical", "HVAC", "PHE", "Civil", "EHS"]
```

#### 3. **Get Issues for Category/Subcategory**
```
GET /api/escalation/issues/:category/:subcategory
Params: category, subcategory (strings)
Response: Array of issue descriptions
```

#### 4. **Get Escalation Rule**
```
GET /api/escalation/rule/:category/:subcategory/:issue
Params: category, subcategory, issue (strings)
Response: Rule object with priority, escalation levels, and SLA
Example: { priority: "P2", responsibleGroup: "Technical Team", sla: "4 hours" }
```

#### 5. **Get Escalation Statistics**
```
GET /api/escalation/stats
Response: Object with stats
{
  totalRules: 96,
  uniqueCategories: 6,
  uniquePriorities: 4,
  categories: [...]
}
```

---

### 📋 CSAT (CUSTOMER SATISFACTION) ENDPOINTS

#### 6. **Get All CSAT Surveys**
```
GET /api/csat/surveys
Response: Array of CSAT survey objects
```

#### 7. **Get Specific CSAT Survey**
```
GET /api/csat/surveys/:id
Params: id (survey ID)
Response: Single survey object
```

#### 8. **Create CSAT Survey**
```
POST /api/csat/surveys
Body: { ticketId, tenantPoC, tenantEmail, building }
Response: Created survey object with unique survey ID
```

#### 9. **Send CSAT Survey**
```
POST /api/csat/surveys/:id/send
Body: { email? } (optional email override)
Response: { success: true, message: "...", survey }
```

#### 10. **Resend CSAT Survey**
```
POST /api/csat/surveys/:id/resend
Response: Increments emailsSent counter and resends
```

#### 11. **Submit CSAT Response**
```
POST /api/csat/surveys/:id/response
Body: { overallSatisfaction, comments, rating }
Response: Updated survey with completed status
```

#### 12. **Get CSAT Metrics**
```
GET /api/csat/metrics
Response: {
  csat: { averageScore: 8.5, totalResponses: 45 },
  automationStatus: { nextCSATTrigger: "...", pendingSurveys: 3 }
}
```

#### 13. **Trigger Pending CSAT Surveys**
```
POST /api/csat/trigger-pending
Response: { triggered: 5, failed: 0 }
```

---

### ⭐ NPS (NET PROMOTER SCORE) ENDPOINTS

#### 14. **Get All NPS Surveys**
```
GET /api/nps/surveys
Response: Array of NPS survey objects
```

#### 15. **Get Specific NPS Survey**
```
GET /api/nps/surveys/:id
Params: id (survey ID)
Response: Single survey object
```

#### 16. **Create NPS Survey**
```
POST /api/nps/surveys
Body: { ticketId, tenantPoC, tenantEmail, building }
Response: Created survey object
```

#### 17. **Send NPS Survey**
```
POST /api/nps/surveys/:id/send
Body: { email? } (optional email override)
Response: { success: true, survey }
```

#### 18. **Submit NPS Response**
```
POST /api/nps/surveys/:id/response
Body: { npsScore: 7-10, feedback }
Response: Updated survey
```

#### 19. **Get NPS Metrics**
```
GET /api/nps/metrics
Response: {
  nps: { score: 45, promoters: 20, passives: 15, detractors: 10 },
  automationStatus: { opportunities: 5 }
}
```

#### 20. **Get NPS Opportunities**
```
GET /api/nps/trigger-opportunities
Response: Array of detractors and passive respondents for follow-up
```

---

### 🎫 HELPDESK TICKET ENDPOINTS

#### 21. **Create Ticket**
```
POST /api/helpdesk/tickets
Body: {
  title, description, category, subCategory, issue,
  priority, assignedTo, building, tenantEmail
}
Response: Ticket object with escalationStatus
```

#### 22. **Transition Ticket Status**
```
PUT /api/helpdesk/tickets/:id/transition
Params: id (ticket ID)
Body: { status: "In Progress" | "Completed" | "On Hold" | "Cancelled" }
Response: Updated ticket with audit trail
```

#### 23. **Escalate Ticket**
```
POST /api/helpdesk/tickets/:id/escalate
Body: { reason, escalateTo, notes }
Response: Ticket with escalation history and updated SLA
```

#### 24. **Get Ticket Escalation Status**
```
GET /api/helpdesk/tickets/:id/escalation-status
Response: {
  currentLevel: 2,
  escalationChain: [...],
  slaStatus: "At Risk",
  timeToViolation: "2 hours"
}
```

---

### 📝 CONTRACT MANAGEMENT ENDPOINTS

#### 25. **Create Contract**
```
POST /api/contracts
Body: {
  vendorId, contractType, value, startDate, endDate,
  renewalTerms, otherTerms
}
Response: Contract object with status
```

#### 26. **Renew Contract**
```
POST /api/contracts/:id/renew
Body: { newEndDate, renewalTerms }
Response: Updated contract with renewal history
```

---

### 🔒 WORK PERMIT ENDPOINTS

#### 27. **Create Work Permit**
```
POST /api/workpermits
Body: {
  permitType, location, contractor, startDate, endDate,
  jsaId, riskLevel, safetyMeasures
}
Response: Permit object with approval workflow
```

#### 28. **Approve JSA (Job Safety Analysis)**
```
POST /api/jsa/:permitId/approve
Body: { approverName, approverRole }
Response: Updated permit with JSA approval status
```

#### 29. **Finalize Work Permit**
```
POST /api/workpermits/:id/finalize
Body: { completionNotes, actualEndDate }
Response: Finalized permit with audit trail
```

#### 30. **Merge Multiple Permits**
```
POST /api/workpermits/:id/merge
Body: { otherPermitIds: [...] }
Response: Merged permit
```

---

### ✅ TASK MANAGEMENT ENDPOINTS

#### 31. **Create Task**
```
POST /api/tasks
Body: {
  title, description, assignedTo, priority, dueDate,
  category, relatedTicketId
}
Response: Task object with tracking info
```

#### 32. **Approve Task**
```
POST /api/tasks/:id/approve
Body: { approverName, approverRole, comments }
Response: Approved task
```

#### 33. **Deny Task**
```
POST /api/tasks/:id/deny
Body: { reason, returnTo }
Response: Rejected task with reason
```

#### 34. **Pushback Task**
```
POST /api/tasks/:id/pushback
Body: { reason, pushbackTo }
Response: Task moved back in workflow
```

---

### 💰 UTILITY BILLING ENDPOINTS

#### 35. **Calculate Utility Charges**
```
POST /api/utility-billing/calculate
Body: {
  building, meterReading, billingPeriod, ratePerUnit
}
Response: {
  totalCharge: 5500,
  breakdown: { ...},
  gst: 990
}
```

---

### 🏷️ ASSET QR CODE ENDPOINTS

#### 36. **Generate Batch QR Codes**
```
POST /api/assets/qrcodes/batch
Body: { assetIds: [...], format: "png" | "svg" }
Response: Array of QR code URLs/data
```

---

### 📊 ASSET ANALYSIS ENDPOINTS

#### 37. **Analyze Asset Age**
```
POST /api/assets/age-analysis
Body: { assetCategoryFilter?, siteFilter? }
Response: {
  averageAge: 5.2,
  depreciation: 35,
  byCategory: { ... },
  replacementCandidates: [...]
}
```

---

### 🚚 TRANSFER MANAGEMENT ENDPOINTS

#### 38. **Create Transfer**
```
POST /api/transfers
Body: {
  assetId, fromSite, toSite, quantity,
  transferReason, approverEmail
}
Response: Transfer object with approval workflow
```

#### 39. **Approve Transfer**
```
POST /api/transfers/:id/approve
Body: { approverName }
Response: Approved transfer
```

#### 40. **Mark as Shipped**
```
POST /api/transfers/:id/ship
Body: { shippingDate, trackingNumber }
Response: Transfer with shipping info
```

#### 41. **Mark as Received**
```
POST /api/transfers/:id/receive
Body: { receivingDate, conditionNotes }
Response: Completed transfer
```

---

### 📢 FEEDBACK ENDPOINTS

#### 42. **Submit CSAT Feedback**
```
POST /api/feedback/csat
Body: { ticketId, rating, comments }
Response: Feedback recorded
```

#### 43. **Submit NPS Feedback**
```
POST /api/feedback/nps
Body: { ticketId, npsScore, detractorReason }
Response: Feedback recorded
```

---

### 🎯 CATCH-ALL ROUTE

#### 44. **Serve React App**
```
GET *
Returns: React app (dist/index.html)
```

---

## 📊 SUMMARY

| Category | Count | Endpoints |
|----------|-------|-----------|
| Escalation Rules | 5 | categories, subcategories, issues, rule, stats |
| CSAT | 8 | get surveys, get by ID, create, send, resend, response, metrics, trigger |
| NPS | 6 | get surveys, get by ID, create, send, response, metrics, opportunities |
| Helpdesk | 4 | create, transition, escalate, escalation-status |
| Contracts | 2 | create, renew |
| Work Permits | 4 | create, approve JSA, finalize, merge |
| Tasks | 4 | create, approve, deny, pushback |
| Utility Billing | 1 | calculate |
| Assets | 2 | QR codes, age analysis |
| Transfers | 4 | create, approve, ship, receive |
| Feedback | 2 | CSAT, NPS |
| **TOTAL** | **42 Endpoints** | ✅ All configured |

---

## ✅ STATUS
✅ **All 42 API endpoints are fully configured and functional**  
✅ **In-memory data stores used for rapid development**  
⚠️ **Production Note:** Replace in-memory stores with persistent database (PostgreSQL recommended)

---

## Quick Start Commands

```bash
# Install dependencies
npm install

# Start development (frontend + backend)
npm run dev

# Start only frontend
npm run dev:ui         # Port 3000

# Start only backend
npm run dev:api        # Port 3001

# Build for production
npm run build

# Run production server
npm start
```

---

## Project Structure Overview

```
bagmane-asset-management/
├── KT_HANDOVER_GUIDE.md     ⭐ START HERE
├── README.md                
├── DOCUMENTATION.md         ← You are here
│
├── App.tsx                  # Main app entry point
├── types.ts                 # All TypeScript types
├── server.js                # Express API backend
│
├── components/              # 70+ React components
├── hooks/                   # Custom React hooks
├── services/                # Business logic & APIs
├── data/                    # Mock/seed data
├── scripts/                 # Build scripts
├── dist/                    # Production build (after npm run build)
│
└── Configuration Files
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    └── .env.local
```

---

## Technology Stack at a Glance

**Frontend:** React 19.2 + TypeScript 5.8 + Vite 6.2  
**Backend:** Node.js + Express 4.18  
**Visualization:** Recharts 3.5  
**Build Tool:** Vite (dev server + production bundler)  
**Data Handling:** XLSX 0.18 for Excel, JSON for APIs  

---

## 🚨 IMPORTANT: React vs React Native

**This app is built in React (web), NOT React Native.**

### Why?
- Faster prototyping and iteration
- Better dashboards and data visualization support
- Easier team onboarding
- Validation of product requirements

### Future Plan
**Complete React Native migration roadmap available in:**  
👉 `KT_HANDOVER_GUIDE.md` → Section: "Future Roadmap - React Native Migration"

**Key Phases:**
- **Q1 2026:** Service layer extraction
- **Q2 2026:** React Native boilerplate
- **Q3-Q4 2026:** Component migration
- **Q1 2027:** Feature parity and optimization

**Why the roadmap works:**
- All business logic is in services (will be reused)
- All types in `types.ts` (will be shared)
- No tight coupling between UI and logic

---

## Port References

| Service | Port | URL |
|---------|------|-----|
| Frontend (Vite) | 3000 | http://localhost:3000 |
| Backend (Express) | 3001 | http://localhost:3001 |

---

## Key Features

✅ **Asset Management** - Registry, QR codes, verification  
✅ **Ticketing System** - 96 escalation rules, intelligent routing  
✅ **Work Permits** - Safety workflows and JSA forms  
✅ **Inventory** - Stock tracking and transfers  
✅ **Vendor Management** - Relationships and contracts  
✅ **Compliance** - Audits and checklists  
✅ **ESG Metrics** - Sustainability tracking  
✅ **Utility Billing** - Consumption and analytics  
✅ **User Management** - Roles, groups, and hierarchies  
✅ **Communications** - Announcements, messages, meetings  
✅ **Multi-site Support** - Site hierarchies and operations  

---

## Development Workflow

### For New Features
1. Define types in `types.ts`
2. Create service in `services/`
3. Build component in `components/`
4. Wire up in `App.tsx`
5. Test with `npm run dev`

### For Bug Fixes
1. Identify component/service with issue
2. Add console logs or debugger
3. Use React DevTools browser extension
4. Make fix and verify with `npm run dev`

### For Maintenance
1. Review `KT_HANDOVER_GUIDE.md` → Development Guidelines
2. Follow TypeScript best practices
3. Keep components small and focused
4. Document complex logic

---

## Troubleshooting Reference

| Issue | Solution |
|-------|----------|
| Port already in use | See `KT_HANDOVER_GUIDE.md` → Troubleshooting |
| Escalation rules not loading | Run `npm run init-data` |
| Dependencies missing | Run `rm -rf node_modules && npm install` |
| Build too large | See performance optimization tips |
| API timeouts | Check backend is running on 3001 |

---

## Support & Questions

### Understand Components
→ Look in `components/` and follow existing patterns

### Understand Data Structure  
→ Read `types.ts` for all interfaces and types

### Understand State Management  
→ Study `hooks/useMockData.ts` pattern

### Understand API Layer  
→ Review `services/` folder

### Understand Build Process  
→ Check `vite.config.ts` configuration

---

## Next Steps

### For a New Developer
1. ✅ Clone repo and run `npm install`
2. ✅ Start app with `npm run dev`
3. ✅ Read `KT_HANDOVER_GUIDE.md` (Sections 1-5)
4. ✅ Explore `components/Dashboard.tsx`
5. ✅ Review `types.ts` to understand data model
6. ✅ Pick a simple component and modify it
7. ✅ Make your first commit

### For a New Tech Lead
1. ✅ Complete "New Developer" steps
2. ✅ Read entire `KT_HANDOVER_GUIDE.md`
3. ✅ Review React Native migration roadmap
4. ✅ Plan Q1 2026 service layer refactoring
5. ✅ Set up code review process
6. ✅ Configure CI/CD pipeline

### For DevOps/Deployment
1. ✅ Read `KT_HANDOVER_GUIDE.md` → Deployment section
2. ✅ Configure environment variables in `.env.local`
3. ✅ Review Docker deployment example
4. ✅ Set up monitoring for ports 3000/3001
5. ✅ Configure backups for escalation data

---

## Document Maintenance

**Last Updated:** December 23, 2025  
**Next Review:** March 23, 2026  
**Maintained By:** Development Team  

For questions or updates, contact the development team.

---

**Happy Coding! 🚀**
