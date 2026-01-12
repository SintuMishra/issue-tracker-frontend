# 🎫 Hostel Issue Tracker

[![React](https://img.shields.io/badge/Frontend-React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Spring Boot](https://img.shields.io/badge/Backend-Spring_Boot-6DB33F?style=for-the-badge&logo=spring&logoColor=white)](https://spring.io/projects/spring-boot)
[![Vercel](https://img.shields.io/badge/Deployed-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

A full-stack hostel maintenance management system. Students can report infrastructure issues, and administrators can track, manage, and resolve tickets through a centralized dashboard.

## 🚀 Live Demo
- **Frontend:** [https://issue-tracker-frontend-two.vercel.app/](https://issue-tracker-frontend-two.vercel.app/)
- **Backend:** [https://issue-tracker-backend-1-86vi.onrender.com](https://issue-tracker-backend-1-86vi.onrender.com)

---

## 📸 Project Showcase

| 📊 Student Overview | 🔐 Admin Control Center |
| :---: | :---: |
| <img src="./src/docs/UserDashboard.png" width="400" alt="User Dashboard"/> | <img src="./src/docs/AdminPage.png" width="400" alt="Admin Page"/> |
| *Student view for tracking raised issues* | *Administrative overview of all requests* |

| 🎫 Ticket Management | 📈 Analytics Dashboard |
| :---: | :---: |
| <img src="./src/docs/TicketManaging.png" width="400" alt="Ticket Management"/> | <img src="./src/docs/Dashboard.png" width="400" alt="Main Dashboard"/> |
| *Assigning and resolving student tickets* | *Real-time status updates and metrics* |

---

## ✨ Key Features
- **Role-Based Access:** Distinct interfaces for Students and Administrators.
- **JWT Authentication:** Secure session management and resource protection.
- **Ticket Lifecycle:** Full CRUD operations for reporting and resolving hostel issues.
- **Real-time Status:** Instant updates on ticket progress (Open, In Progress, Resolved).
- **Cross-Platform Deployment:** Seamless integration between Vercel and Render.

## 🛠️ Tech Stack
- **Frontend:** React.js, Vite, React Router.
- **Backend:** Java Spring Boot, Spring Security, Hibernate/JPA.
- **Database:** PostgreSQL.
- **Tools:** Git, GitHub Actions, Vercel, Render.

---

## 🛠️ Technical Challenges & Solutions

### 🔌 Environment Synchronization
**Challenge:** Managing API endpoints across local and production environments without manual code changes.
**Solution:** Implemented a centralized `apiFetch` utility using `import.meta.env`, allowing the application to scale dynamically based on the deployment target.

### 🛡️ Security & CORS
**Challenge:** Enabling secure cross-origin communication between Vercel and Render.
**Solution:** Developed a specialized `CorsFilter` in Spring Boot to authorize production domains and handle pre-flight requests for JWT-protected endpoints.

---

## ⚙️ Local Setup

1. **Clone:** `git clone https://github.com/yourusername/issue-tracker.git`
2. **Frontend Config:** Create `.env.local` with `VITE_API_BASE_URL=http://localhost:8080`
3. **Run:** `npm install && npm run dev`