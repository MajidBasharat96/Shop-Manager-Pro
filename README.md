# 🛍️ ShopManager Pro

> **Production-ready, role-based retail management system** with full CRUD operations, security, and a supervisor scanner workflow.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![React](https://img.shields.io/badge/React-18-61DAFB)
![License](https://img.shields.io/badge/license-MIT-green)

---

## ✨ Features

- **Role-Based Access Control (RBAC)** — Owner, Admin, Supervisor, Employee
- **Full Product CRUD** — Add, edit, delete, search, and filter products
- **Scanner Workflow** — Employees request deletion → Supervisor approves → 6-character code activates deletion
- **User Management** — Add, edit, activate/deactivate team members
- **Inventory Reports** — Value tracking, low-stock alerts, CSV export
- **Activity Logs** — Audit trail of all system actions
- **Category Management** — Custom icons and colors
- **Session Security** — Session tokens, role hierarchy enforcement
- **Dark Mode UI** — Professional enterprise-grade interface

---

## 🔐 Role Permissions

| Feature | Owner | Admin | Supervisor | Employee |
|---------|-------|-------|-----------|----------|
| View Products | ✅ | ✅ | ✅ | ✅ |
| Add/Edit Products | ✅ | ✅ | ✅ | ❌ |
| Delete Products | ✅ | ✅ | ❌ | ❌ |
| Request Deletion | ✅ | ✅ | ✅ | ✅ |
| Approve Deletions | ✅ | ✅ | ✅ | ❌ |
| Scanner (execute delete) | ✅ | ✅ | ✅ | ❌ |
| Manage Users | ✅ | ✅ | View only | ❌ |
| Delete Users | ✅ | ❌ | ❌ | ❌ |
| View Reports | ✅ | ✅ | ✅ | ❌ |
| Export Reports | ✅ | ✅ | ❌ | ❌ |
| Manage Categories | ✅ | ✅ | ❌ | ❌ |
| Activity Logs | ✅ | ✅ | ❌ | ❌ |
| System Settings | ✅ | ❌ | ❌ | ❌ |

---

## 🗑️ Delete Scanner Workflow

1. **Employee** clicks "Request Delete" on a product
2. Employee provides a reason → system generates a **6-character code**
3. **Supervisor** sees the pending request → clicks "Review" → **Approves or Rejects**
4. If approved → Employee shows the code → Supervisor opens **Scanner** and enters it
5. Product is permanently deleted and logged in audit trail

---

## 🚀 Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Owner | owner@shopmanager.com | owner123 |
| Admin | admin@shopmanager.com | admin123 |
| Supervisor | supervisor@shopmanager.com | super123 |
| Employee | employee@shopmanager.com | emp123 |

---

## 📦 Local Setup

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/shop-manager-pro.git
cd shop-manager-pro

# Install dependencies
npm install

# Start development server
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 FREE Deployment Options

### Option 1: Vercel (Recommended — Easiest, Fastest)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → Sign up with GitHub (free)
3. Click **"New Project"** → Import your repo
4. Framework: **Create React App** (auto-detected)
5. Click **Deploy** → Done! Live in ~90 seconds

**Free plan includes:** Custom domain, HTTPS, unlimited deployments

---

### Option 2: Netlify

1. Push to GitHub
2. Go to [netlify.com](https://netlify.com) → Sign up free
3. Click **"Add new site"** → **Import from Git**
4. Select your repo
5. Build command: `npm run build`
6. Publish directory: `build`
7. Click **Deploy**

**Free plan includes:** 100GB bandwidth/month, custom domain, HTTPS

---

### Option 3: GitHub Pages

```bash
# Install gh-pages
npm install gh-pages --save-dev
```

Add to `package.json`:
```json
{
  "homepage": "https://YOUR_USERNAME.github.io/shop-manager-pro",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d build"
  }
}
```

```bash
npm run deploy
```

**Free plan includes:** Public repos only, HTTPS

---

### Option 4: Cloudflare Pages

1. Go to [pages.cloudflare.com](https://pages.cloudflare.com) → Free account
2. Connect GitHub → Select repo
3. Build command: `npm run build`
4. Build output directory: `build`
5. Deploy

**Free plan includes:** Unlimited requests, HTTPS, unlimited bandwidth

---

## 🏗️ Project Structure

```
shop-manager-pro/
├── public/
│   └── index.html
├── src/
│   ├── context/
│   │   ├── AuthContext.jsx     # Auth, roles, permissions, user CRUD
│   │   └── ShopContext.jsx     # Products, categories, delete requests
│   ├── pages/
│   │   ├── LoginPage.jsx       # Auth page with demo accounts
│   │   ├── Dashboard.jsx       # Stats, alerts, overview
│   │   ├── ProductsPage.jsx    # Product CRUD + scanner request flow
│   │   ├── DeleteRequestsPage.jsx  # Scanner modal + request management
│   │   ├── UsersPage.jsx       # User management + roles matrix
│   │   └── OtherPages.jsx      # Reports, Categories, Activity, Settings
│   ├── components/
│   │   └── Sidebar.jsx         # Navigation with collapse + mobile support
│   ├── App.jsx                 # Root with auth-gated routing
│   ├── index.js
│   └── index.css
├── package.json
└── README.md
```

---

## 🔒 Security Features

- **Session-based auth** — Tokens stored in `sessionStorage` (cleared on tab close)
- **Role hierarchy enforcement** — Users cannot manage peers or superiors
- **Permission guards** — All actions checked against `PERMISSIONS` map
- **Audit trail** — Every action logged with user, role, timestamp, details
- **Input validation** — Forms validate before submission
- **SKU uniqueness** — Prevents duplicate product codes

---

## 🛠️ Tech Stack

- **React 18** — UI framework
- **React Context API** — State management (no extra dependencies)
- **localStorage** — Persistent data storage
- **sessionStorage** — Session tokens
- **Lucide React** — Icons
- **DM Sans** — Typography

> **Note:** This version uses browser localStorage for data persistence. For production with real users, replace with a backend API (Node.js + PostgreSQL or Firebase/Supabase — both have free tiers).

---

## 📈 Production Upgrade Path

For real multi-user production use, consider:

| Need | Free Option |
|------|-------------|
| Database | Supabase (PostgreSQL, 500MB free) |
| Auth | Supabase Auth or Clerk (free tier) |
| Backend | Vercel Serverless Functions |
| File storage | Cloudflare R2 (10GB free) |

---

## 📄 License

MIT © 2024 ShopManager Pro
