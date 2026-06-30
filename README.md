# Nexus Voice Agent: Command Center (Admin Dashboard)

A premium, high-fidelity administrative dashboard built for managing multi-tenant AI Voice Agents. Nexus Voice Agent Command Center utilizes a **Glassmorphism Design System** to provide real-time operational control with a sleek, modern aesthetic.

---

## ✨ Key Features

- **Executive Overview**: Real-time KPI widgets for call volume, success rates, and active partners.
- **Mission Control**: Specialized campaign management hub with instant Start/Pause/Stop controls.
- **Intelligence Uplink**: Direct RAG training interface for PDF ingestion and manual fact-teaching.
- **The Lead Vault**: Granular auditing of call logs with real-time transcript viewing.
- **Multi-Tenant Lifecycle**: Advanced Client Management with seamless Archive/Restore workflows.

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | React 18 + Vite | Component-based UI with ultra-fast HMR. |
| **Design System** | Custom Vanilla CSS | Glassmorphism, blurred backdrops, and vibrant gradients. |
| **Icons** | Lucide React | High-fidelity, consistent iconography. |
| **Charts** | Recharts | Performance trending and volume visualization. |
| **Networking** | Axios + JWT | Secure, authenticated communication with the Backend. |

---

## 📁 Project Structure

```text
nexus-ai-voice-agent-frontend/
├── src/
│   ├── components/     # UI Primitives: Modals, Sidebar, RichSelect
│   ├── pages/          # Operational Views: Home, Clients, Campaigns, CallLogs
│   ├── assets/         # Static visual assets and fonts
│   ├── App.jsx         # Root Router and Global State Orchestration
│   └── index.css       # Design System Tokens & Glassmorphism DNA
├── public/             # Static public assets
└── .env                # Environment Configuration (API Base URL)
```

---

## ⚙️ Setup & Development

### 1. Environment Configuration
Create a `.env` file in the root directory:
```env
# Backend API Base URL (must match active localtunnel)
VITE_API_BASE_URL=https://your-localtunnel-url.loca.lt
```

### 2. Installation
```bash
npm install
```

### 3. Launching the Dashboard
```bash
npm run dev
```

---

## 🎨 Design Principles
- **Aesthetic**: Premium Glassmorphism (Backdrop blurs + transparency).
- **UX**: Information at a glance (KPI Widgets + Progress Bars).
- **Responsiveness**: Optimized for high-density administrative desktop usage.

---

> [!TIP]
> This dashboard is designed to work in tandem with the [Nexus Voice Agent Backend](../nexus-ai-voice-agent-backend/README.md). Ensure the backend is running and exposed via localtunnel before launching the UI.
