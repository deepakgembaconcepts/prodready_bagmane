# Bagmane AMA - Quick Reference Card

## 🚀 Start App in 3 Steps
```bash
npm install              # 1. Install once
npm run dev             # 2. Start development
# Open http://localhost:3000  # 3. Visit in browser
```

---

## 📊 Tech Stack Summary

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend Framework** | React | 19.2 |
| **Type Safety** | TypeScript | 5.8 |
| **Build Tool** | Vite | 6.2 |
| **Charts** | Recharts | 3.5 |
| **Backend** | Express.js | 4.18 |
| **Runtime** | Node.js | 18+ |

---

## 🎯 What's Built (18+ Modules)

✅ Dashboard & Analytics  
✅ Asset Management (with QR codes)  
✅ Ticketing (with 96 escalation rules)  
✅ Work Permits & Safety  
✅ Inventory Management  
✅ Vendor & Contracts  
✅ Preventive Maintenance  
✅ Compliance & Auditing  
✅ ESG & Utilities  
✅ User Management  
✅ Reporting & Analytics  
✅ Multi-site Support  

---

## 🔧 Common Commands

```bash
npm run dev             # Start frontend + backend
npm run dev:ui          # Frontend only (port 3000)
npm run dev:api         # Backend only (port 3001)
npm run build           # Build production bundle
npm start               # Run production server
npm run init-data       # Load escalation rules from CSV
```

---

## 📁 Important Files to Know

```
types.ts                → All data type definitions
App.tsx                 → Main app structure
server.js               → Backend API
hooks/useMockData.ts   → State management
components/Dashboard   → Entry point module
```

---

## 🌐 URL Reference

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend | http://localhost:3001 |
| API Docs | See `server.js` for endpoints |

---

## ⚠️ CRITICAL: React NOT React Native

**This is a React WEB app, designed with React Native migration in mind.**

**Why React first?**
- Faster iteration on complex dashboards
- Better data visualization support
- Easier team onboarding
- Room to validate requirements

**React Native Migration Timeline:**
- Q1 2026: Service extraction
- Q2 2026: React Native setup
- Q3-Q4 2026: Component migration
- Q1 2027: Full parity

📖 **Full roadmap in:** `KT_HANDOVER_GUIDE.md`

---

## 🔑 Key Architecture Principles

### 1️⃣ **React for UI, Services for Logic**
```typescript
// Service (reusable in React Native)
export const AssetService = {
  async fetch() { ... }
};

// Component (React specific)
export const AssetList = () => {
  const [assets] = useAssets();
  return <div>{assets.map(...)}</div>;
};
```

### 2️⃣ **Type-First Development**
```typescript
// Define in types.ts (reusable everywhere)
interface Asset {
  id: string;
  name: string;
  status: AssetStatus;
}
```

### 3️⃣ **Hooks for State Management**
```typescript
// hooks/useMockData.ts (source of truth)
export const useMockData = () => ({
  assets, setAssets, addAsset,
  tickets, setTickets, addTicket,
  // ... all app state
});
```

---

## 🆘 Quick Troubleshooting

### Port Already in Use?
```bash
lsof -ti:3000,3001 | xargs kill -9
npm run dev
```

### Dependencies Broken?
```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Escalation Rules Not Showing?
```bash
npm run init-data
```

### Build Errors?
```bash
npm run build    # Try building
npm run preview  # Check the result
```

---

## 📖 Documentation Files

1. **`KT_HANDOVER_GUIDE.md`** (27 KB)
   - Complete system documentation
   - All 18+ modules explained
   - Development guidelines
   - **React Native migration roadmap**
   - Deployment instructions

2. **`DOCUMENTATION.md`** (this file's companion)
   - Documentation index
   - File structure overview
   - Quick reference commands

3. **`README.md`**
   - Project overview

---

## 🎓 Learning Path for New Devs

### Day 1: Setup & Overview
- [ ] Clone and run `npm install`
- [ ] Start app with `npm run dev`
- [ ] Read this quick reference card
- [ ] Read `DOCUMENTATION.md`

### Day 2: Understand the Code
- [ ] Read `types.ts` (understand data model)
- [ ] Read `App.tsx` (understand structure)
- [ ] Read `hooks/useMockData.ts` (understand state)

### Day 3: Explore Modules
- [ ] Review 3-4 component files
- [ ] Understand component patterns
- [ ] Look at `services/` folder
- [ ] Review API endpoints in `server.js`

### Day 4: First Contribution
- [ ] Pick a simple component to modify
- [ ] Add a feature or fix a bug
- [ ] Create a pull request
- [ ] Get code review

### Week 2+: Deep Dive
- [ ] Read full `KT_HANDOVER_GUIDE.md`
- [ ] Understand React Native migration plan
- [ ] Set up your development environment
- [ ] Start contributing features

---

## 🚨 DO's and DON'Ts

### ✅ DO
- Use TypeScript for all code
- Follow component patterns in existing files
- Export types from `types.ts`
- Keep components small and focused
- Test in browser DevTools
- Comment complex logic
- Make small, focused commits

### ❌ DON'T
- Use `any` type (use `unknown` if needed)
- Mix React and React Native syntax
- Put business logic in components
- Create duplicate types
- Ignore TypeScript errors
- Make huge commits with many changes
- Deploy without testing locally

---

## 📞 Common Questions

**Q: Where do I add a new component?**  
A: Create in `components/` folder, follow existing patterns

**Q: How do I add a new data type?**  
A: Add to `types.ts` and export

**Q: How do I add a new API endpoint?**  
A: Edit `server.js` in Express app.get/post/put/delete

**Q: How do I manage global state?**  
A: Use `hooks/useMockData.ts` hook in components

**Q: When will we migrate to React Native?**  
A: Roadmap in `KT_HANDOVER_GUIDE.md` - starts Q1 2026

**Q: Why React and not React Native now?**  
A: See section above - web first for dashboards and validation

---

## 🎯 Success Criteria

After reading this guide, you should be able to:

✅ Start the app without errors  
✅ Find and modify a component  
✅ Understand the data types  
✅ Make a small feature addition  
✅ Explain why React, not React Native  
✅ Describe the React Native migration plan  
✅ Navigate the codebase efficiently  
✅ Follow code standards and patterns  

---

## 📚 Next Steps

1. **Read:** `KT_HANDOVER_GUIDE.md` (complete guide)
2. **Explore:** Source code in `components/`, `services/`, `hooks/`
3. **Understand:** Architecture from section above
4. **Plan:** React Native migration if you're technical lead
5. **Build:** Your first feature!

---

## 🎉 Ready? Let's Go!

```bash
npm install && npm run dev
# Open http://localhost:3000 in your browser
# Start exploring! 🚀
```

---

**Last Updated:** December 23, 2025  
**For questions:** See `KT_HANDOVER_GUIDE.md` or contact the team  
**React Native Migration Roadmap:** In `KT_HANDOVER_GUIDE.md` (8 phases, Q1 2026 - Q1 2027)
