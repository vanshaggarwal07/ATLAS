# 🗺️ ATLAS

> **Consulting. Rebuilt for Scale.**

<div align="center">

**The AI-native consulting platform that delivers strategy, decisions, and execution — without traditional consultants.**

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

</div>

---

## 🎯 Overview

ATLAS transforms traditional consulting by leveraging AI to provide instant, scalable strategic guidance. Instead of paying $200K+ and waiting months, get comprehensive business strategy and execution planning in real-time.

**Key Benefits**: ⚡ Instant Insights | 💰 Cost-Effective | 📈 Scalable | 🤖 AI-Powered | 🔒 Secure (Encrypted)

---

## ✨ Features

- **🧠 AI Consulting Engine** - Strategic diagnoses and recommendations
- **📊 Strategy Scenarios** - Model strategic paths with interactive visualizations
- **✅ Execution Workspace** - Manage milestones and execution plans
- **📈 Growth Analytics** - Real-time performance dashboards
- **💊 Health Monitor** - Business health and risk monitoring
- **📋 Audit Module** - Comprehensive audits with PDF reports
- **🎨 AI Design & Branding** - Generate branding materials
- **⚖️ Tax & Legal** - Legal and tax consultation
- **🎤 Voice Interface** - Natural voice commands and text-to-speech
- **📄 Multi-Format Import** - Excel, CSV, PDF analysis
- **🌐 3D Visualizations** - Interactive decision graphs

---

## 🛠️ Tech Stack

**Frontend**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, Framer Motion, React Three Fiber

**Backend**:  MongoDB, Supabase (PostgreSQL, Edge Functions), FastAPI

**Authentication**: Auth0, Supabase Auth

**Hosting**: VULTR

---

## 🤖 AI Services

### Core AI Services
- **Google Gemini 3 Flash Preview** - Strategic analysis and business insights
- **ElevenLabs Scribe v1** - Speech-to-text for voice commands
- **ElevenLabs Multilingual v2** - Text-to-speech for responses

### OnDemand APIs
- **Media API** - Dynamic PDF generation for reports and documents
- **Chat API** - Intelligent conversational interface with context awareness

### Custom Agentic Pipeline **(OnDemand)**
Six specialized AI agents:
1. Strategic Analysis Agent
2. Financial Analysis Agent
3. Audit & Compliance Agent
4. Branding & Design Agent
5. Legal & Tax Agent
6. Execution Planning Agent

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or cloud)
- API keys: Supabase, Auth0, Google Gemini, ElevenLabs, OnDemand

### Installation

```bash
# Clone repository
git clone https://github.com/vanshaggarwal07/ATLAS.git
cd atlas-cunsulting

# Install dependencies
npm install

# Create .env file with required API keys
# VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
# VITE_AUTH0_DOMAIN, VITE_AUTH0_CLIENT_ID
# VITE_GEMINI_API_KEY
# VITE_ELEVENLABS_API_KEY
# VITE_ONDEMAND_MEDIA_API_KEY, VITE_ONDEMAND_CHAT_API_KEY
# VITE_MONGODB_URI

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

---

## 📖 Usage

### For Users
1. **Sign Up/Login** via Auth0 (Google OAuth or email)
2. **Complete Onboarding** - Set up company profile
3. **Use Features**:
   - Ask questions or upload documents in Consulting Engine
   - Use voice commands with microphone icon
   - Upload financial docs for audits, export as PDF
   - Model strategies and visualize in 3D

### For Developers

```bash
npm run dev      # Development server
npm run build    # Production build
npm run preview  # Preview build
npm run lint     # Linting
npm test         # Tests
```

---

## 🔌 OnDemand APIs

**Media API** - Generate PDFs for audit reports, business plans, and executive summaries

**Chat API** - Power conversational interface with context-aware responses and multi-agent routing

Both APIs are integrated via Supabase Edge Functions and accessible through the ATLAS interface.

---

## 📁 Project Structure

```
atlas-cunsulting/
├── src/components/     # React components (app, audit, layout, ui)
├── src/pages/          # Page components and routes
├── src/hooks/          # Custom React hooks
├── src/integrations/   # Supabase and third-party integrations
├── supabase/
│   ├── functions/      # Edge Functions (AI agents, voice services)
│   └── migrations/     # Database migrations
└── public/             # Static assets
```

---

## 👥 Team

**Vansh Aggarwal** - Full-Stack Developer & Project Lead
- Architecture design and implementation
- AI services integration and multi-agent pipeline
- Frontend and backend development

[GitHub](https://github.com/vanshaggarwal07)

> *Built with ❤️ by VANSH AGGARWAL*

---

## 📝 License

This project is private and proprietary. All rights reserved.

---

<div align="center">

**Made with ❤️ by VANSH AGGARWAL**

</div>
