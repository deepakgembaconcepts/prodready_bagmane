# Windows Deployment Guide (RDP)

Use this guide to deploy the Bagmane AMS application to your Windows Server (`20.197.7.103`).

## 📋 Prerequisites
- **RDP Access**: You must be able to connect to the server.
- **Administrator Privileges**: You need admin rights to install software and open ports.

---

## 🚀 Deployment Steps

### 1. Build & Package (Local Machine)
Before connecting to the server, ensure you have the latest build.
1. Run `npm install` and `npm run build` locally.
2. Create a zip file containing:
   - `dist/` folder
   - `scripts/` folder
   - `server.js`
   - `package.json`
   - `.env.production`
   - `web.config`

   > **Note:** Do NOT include `node_modules`. The script will install them on the server.

### 2. File Transfer (Remote Desktop)
1. Provide your credentials to connect to `20.197.7.103` via Remote Desktop.
2. Create a folder on the server, e.g., `C:\Apps\BagmaneAMS`.
3. Copy the files from your local machine and paste them into this folder on the server.

### 3. Run Automation Script
1. On the server, open **PowerShell as Administrator** (Right-click Start -> Windows PowerShell (Admin)).
2. Navigate to the folder:
   ```powershell
   cd C:\Apps\BagmaneAMS
   ```
3. Run the deployment script:
   ```powershell
   .\scripts\deploy-windows.ps1
   ```

   **What this script does:**
   - ✅ Installs Node.js (if missing)
   - ✅ Installs production dependencies
   - ✅ Sets environment variables from `.env.production`
   - ✅ Opens Port 3001 in Windows Firewall
   - ✅ Starts the app using PM2 (runs in background)

### 4. Verify Deployment
1. Open a browser on the server (Edge/Chrome).
2. Go to: `http://localhost:3001`
3. You should see the login screen.

### 5. Database Setup (Critical)
The deployment script does **not** create the database tables automatically because the `prisma` CLI tool is a development dependency.

**Option A: Run Migrations from Local Machine (Recommended)**
1. Ensure your local machine can connect to the Windows Server's database port (e.g., 5432).
2. In your **local** `.env.production` file, update `DATABASE_URL` to point to the server:
   `DATABASE_URL="postgresql://postgres:PASSWORD@20.197.7.103:5432/bagmane_production"`
3. Run the migration command locally:
   ```bash
   npx prisma migrate deploy
   ```

**Option B: Run on Server**
1. On the server, install the Prisma CLI globally:
   ```powershell
   npm install -g prisma
   ```
2. Run migration:
   ```powershell
   cd C:\Apps\BagmaneAMS
   npx prisma migrate deploy
   ```

---

## 🛠️ Troubleshooting

**Script Execution Policy Error?**
If PowerShell blocks the script, run:
```powershell
Set-ExecutionPolicy RemoteSigned -Scope Process
```
Then try running the script again.

**App Not Starting?**
Check PM2 logs:
```powershell
pm2 logs bagmane-ams
```
