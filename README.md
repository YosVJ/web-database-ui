# 🚀 Synercore Web Database UI

![React](https://img.shields.io/badge/Frontend-React-blue)
![Vite](https://img.shields.io/badge/Build-Vite-purple)
![Supabase](https://img.shields.io/badge/Backend-Supabase-green)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-blue)
![Vercel](https://img.shields.io/badge/Deployment-Vercel-black)
![Status](https://img.shields.io/badge/Status-In%20Development-orange)

A **multi-company ERP-style operations dashboard** designed to manage internal workflows such as purchase requests, company access control, and operational visibility across the **Synercore ecosystem**.

This project demonstrates **multi-tenant architecture**, **secure authentication**, and **role-based access control (RBAC)** using a modern web stack.

🌐 **Live Demo**  
https://synercore.vercel.app

---

# 🧭 Overview

Synercore Web Database UI is an internal platform designed to centralize operations for multiple companies into a single dashboard.

The system allows users to access operational data depending on their assigned companies and roles.

Example companies supported by the system:

- Synercore Heavy Industries Corp
- SY3 Energy Maintenance Services
- KES Prime Construction
- Gen3 Toll Packaging
- Philweld Welding Rod Corp
- Gemotra Electrical Services

The architecture ensures **secure multi-company isolation** using **Supabase Row Level Security (RLS)**.

---

# ✨ Key Features

### 🔐 Secure Authentication
- Supabase authentication
- Email / password login
- Microsoft SSO integration
- Persistent user sessions

### 🏢 Multi-Company Access
Users can belong to multiple companies with controlled access.

Example:

User → SY3 + Synercore  
Manager → KES + Gen3

---

### 🛡 Role Based Permissions

System roles include:

- **Super Admin**
- **Admin**
- **Standard User**

Each role controls what the user can:

- view
- create
- edit
- approve

---

### 📋 Purchase Request Workflow

The system allows employees to:

- submit purchase requests
- track request progress
- manage approvals

---

### 📊 Dashboard Interface

A responsive dashboard UI that allows quick navigation between modules and companies.

---

# 🧱 System Architecture

```
Frontend (React + Vite)
        │
        ▼
Supabase API
        │
        ▼
PostgreSQL Database
        │
        ▼
Row Level Security (RLS)
        │
        ▼
Company Scoped Data Access
```

Authentication and access control are enforced through **Supabase Auth + RLS policies**.

---

# 🧰 Tech Stack

| Layer | Technology |
|------|------------|
Frontend | React + Vite  
Backend | Supabase  
Database | PostgreSQL  
Authentication | Supabase Auth  
Deployment | Vercel  
Version Control | GitHub  

Additional development tools:

- Tailwind CSS
- PostgREST
- Supabase RLS

---

# ⚙️ Local Development Setup

### Clone Repository

```bash
git clone https://github.com/YosVJ/web-database-ui.git
cd web-database-ui
```

---

### Install Dependencies

```bash
npm install
```

---

### Configure Environment Variables

Create a `.env` file:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Never commit `.env` files to GitHub.

---

### Run Development Server

```bash
npm run dev
```

Application runs at:

```
http://localhost:5173
```

---

# 🚀 Deployment

The project is automatically deployed using **Vercel**.

Every push to the **main branch** triggers automatic deployment.

Production environment:

https://synercore.vercel.app

---

# 🔐 Security Model

Security is implemented using:

- Supabase Row Level Security (RLS)
- company-scoped database queries
- role-based permission system
- environment variables for API keys

---

# 🛠 Current Development Focus

- Password reset flow correction
- Microsoft SSO improvements
- RLS policy hardening
- mobile responsive UI
- company-scoped permissions

---

# 🧠 Future Plans

Planned system modules:

- IT Asset Management
- Document Control System
- Service Desk Ticketing
- Approval workflows
- reporting dashboards
- mobile optimization

---

# 👨‍💻 Author

**Jelonel Vitao**  
Information Technology

GitHub  
https://github.com/YosVJ

---

# 📄 License

This project is currently private and intended for **portfolio demonstration and internal development experiments**.