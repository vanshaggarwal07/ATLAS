# 🗺️ ATLAS

> **Consulting. Rebuilt for Scale.**

<div align="center">

**The AI-native consulting platform that delivers strategy, decisions, and execution — without traditional consultants.**

Built for startups and organizations that need enterprise-grade strategic guidance at scale.

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [AI Services Integration](#-ai-services-integration)
- [Getting Started](#-getting-started)
- [Installation & Setup](#-installation--setup)
- [Usage Guidelines](#-usage-guidelines)
- [OnDemand APIs Utilization](#-ondemand-apis-utilization)
- [Project Structure](#-project-structure)
- [Team](#-team)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

ATLAS transforms the traditional consulting model by leveraging cutting-edge AI to provide instant, scalable strategic guidance. Instead of paying $200K+ and waiting months for insights, ATLAS delivers comprehensive business strategy and execution planning in real-time.

### Why ATLAS?

- **⚡ Instant Insights** - Get strategic diagnoses and recommendations powered by advanced AI in seconds, not months
- **💰 Cost-Effective** - Enterprise-grade consulting at a fraction of traditional consulting costs
- **📈 Scalable** - Grows with your business without the need for additional consultants
- **🤖 AI-Powered** - Leverages multiple specialized AI agents for different consulting workflows
- **🔒 Secure** - Enterprise-grade authentication and data protection built-in

---

## ✨ Key Features

### Core Capabilities

- **🧠 AI-Powered Consulting Engine** - Get strategic diagnoses and recommendations powered by advanced AI agents
- **📊 Strategy Scenarios** - Model different strategic paths and their outcomes with interactive visualizations
- **✅ Execution Workspace** - Manage milestones, risks, and execution plans in one centralized location
- **📈 Growth Analytics** - Track performance metrics and key indicators with real-time dashboards
- **💊 Health Monitor** - Real-time monitoring of business health and risk indicators
- **📋 Audit Module** - Comprehensive business audits with actionable insights and PDF reports
- **🎨 AI Design & Branding** - Generate branding materials and design assets using AI
- **⚖️ Tax & Legal** - Get legal and tax consultation powered by specialized AI agents
- **📚 Playbooks** - Reusable strategic frameworks and templates for common business scenarios

### User Experience

- **🎤 Voice Interface** - Interact with ATLAS through natural voice commands
- **💬 Text-to-Speech** - Get responses in natural, human-like voice
- **📄 Multi-Format Data Import** - Upload Excel, CSV, PDF files for analysis
- **🌐 Interactive 3D Visualizations** - Visualize strategic decisions with React Three Fiber
- **🌙 Dark Mode** - Beautiful dark and light themes for comfortable viewing
- **📱 Responsive Design** - Works seamlessly across all devices

---

## 🛠️ Tech Stack

### Frontend

| Technology | Purpose |
|------------|---------|
| **React 18** | Modern UI library with hooks and concurrent features |
| **TypeScript** | Type-safe development for better code quality |
| **Vite** | Lightning-fast build tool and dev server |
| **Tailwind CSS** | Utility-first CSS framework for rapid UI development |
| **shadcn/ui** | Beautiful, accessible, and customizable UI components |
| **Framer Motion** | Smooth animations and transitions |
| **React Three Fiber** | Interactive 3D visualizations for decision graphs |
| **React Router** | Client-side routing and navigation |
| **TanStack Query** | Powerful data fetching, caching, and synchronization |
| **React Hook Form** | Performant forms with easy validation |
| **Zod** | TypeScript-first schema validation |

### Backend & Infrastructure

| Service | Purpose |
|---------|---------|
| **Supabase** | Backend-as-a-Service with PostgreSQL, Edge Functions, and real-time capabilities |
| **MongoDB** | NoSQL database for flexible data storage and document management |
| **FastAPI** | High-performance Python web framework for backend services |

### Authentication & Security

| Service | Purpose |
|---------|---------|
| **Auth0** | Enterprise-grade authentication and authorization |
| **Supabase Auth** | Additional authentication capabilities with social providers |

### Hosting & Infrastructure

| Service | Purpose |
|---------|---------|
| **VULTR** | Cloud infrastructure and server hosting |

---

## 🤖 AI Services Integration

ATLAS leverages a sophisticated multi-agent AI pipeline to deliver comprehensive consulting services:

### Core AI Services

#### **Google Gemini 3 Flash Preview**
- **Purpose**: Advanced language model for strategic analysis, business insights, and decision-making
- **Use Cases**: 
  - Strategic diagnosis and recommendations
  - Business analysis and reporting
  - Natural language understanding and generation
  - Multi-agent orchestration

#### **ElevenLabs Speech Services**

**Scribe v1** (Speech-to-Text)
- **Purpose**: High-accuracy speech transcription
- **Features**: Real-time voice input processing, multi-language support
- **Integration**: Voice commands for hands-free interaction with ATLAS

**Multilingual v2** (Text-to-Speech)
- **Purpose**: Natural, human-like voice synthesis
- **Features**: Multi-language support, emotional tone control
- **Integration**: Voice responses for accessibility and convenience

### OnDemand APIs

#### **ON DEMAND API - MEDIA API**
- **Purpose**: Dynamic PDF generation and document processing
- **Use Cases**:
  - Audit report generation
  - Business plan PDFs
  - Executive summaries
  - Export functionality for all analysis reports

#### **ON DEMAND API - CHAT**
- **Purpose**: Intelligent conversational interface
- **Features**: 
  - Context-aware conversations
  - Multi-turn dialogue management
  - Integration with consulting agents
- **Use Cases**: Interactive Q&A, strategy discussions, real-time assistance

### Custom Agentic Pipeline

ATLAS employs **six specialized AI agents** working together in a coordinated pipeline:

1. **Strategic Analysis Agent** - Business strategy and market analysis
2. **Financial Analysis Agent** - Financial modeling and risk assessment
3. **Audit & Compliance Agent** - Financial audits and regulatory compliance
4. **Branding & Design Agent** - Creative assets and branding materials
5. **Legal & Tax Agent** - Legal consultation and tax planning
6. **Execution Planning Agent** - Implementation roadmaps and milestone tracking

Each agent is specialized for its domain, ensuring high-quality, domain-specific outputs while maintaining consistency across the platform.

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18+ ([Download](https://nodejs.org/) or use [nvm](https://github.com/nvm-sh/nvm))
- **npm** or **yarn** package manager
- **Git** for version control
- **MongoDB** (local or cloud instance)
- Accounts for:
  - Supabase (for backend services)
  - Auth0 (for authentication)
  - Google Cloud (for Gemini API)
  - ElevenLabs (for voice services)
  - OnDemand API (for PDF and chat services)

---

## 📦 Installation & Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/vanshaggarwal07/ATLAS.git
cd atlas-cunsulting
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required dependencies including React, TypeScript, Vite, and all UI libraries.

### Step 3: Environment Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Auth0 Configuration
VITE_AUTH0_DOMAIN=your_auth0_domain
VITE_AUTH0_CLIENT_ID=your_auth0_client_id

# Google Gemini API
VITE_GEMINI_API_KEY=your_google_gemini_api_key

# ElevenLabs API
VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key

# OnDemand API
VITE_ONDEMAND_MEDIA_API_KEY=your_ondemand_media_api_key
VITE_ONDEMAND_CHAT_API_KEY=your_ondemand_chat_api_key

# MongoDB Connection (if using directly)
VITE_MONGODB_URI=your_mongodb_connection_string
```

> **Note**: Replace all placeholder values with your actual API keys and credentials.

### Step 4: Database Setup

#### Supabase Setup

1. Create a new project at [Supabase](https://supabase.com)
2. Run the migration files located in `supabase/migrations/` in order
3. Configure your Supabase project URL and anon key in `.env`

#### MongoDB Setup

1. Set up a MongoDB instance (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
2. Get your connection string and add it to `.env`

### Step 5: Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or the port shown in your terminal).

---

## 📖 Usage Guidelines

### For End Users

#### Getting Started

1. **Sign Up / Login**
   - Use Auth0 authentication (Google OAuth or email/password)
   - Complete your profile and company information

2. **Onboarding**
   - Follow the interactive onboarding process
   - Set up your company profile and preferences
   - Configure initial settings

3. **Using Core Features**

   **Consulting Engine**:
   - Ask strategic questions or upload business documents
   - Receive AI-powered analysis and recommendations
   - View interactive decision graphs

   **Voice Commands**:
   - Click the microphone icon to activate voice input
   - Speak your questions naturally
   - Listen to responses using text-to-speech

   **Audit Module**:
   - Upload financial documents (Excel, CSV, PDF)
   - Configure audit parameters
   - Generate comprehensive audit reports
   - Export as PDF using OnDemand Media API

   **Strategy Scenarios**:
   - Model different strategic paths
   - Compare outcomes and risks
   - Visualize decisions in 3D

### For Developers

#### Development Workflow

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint

# Run tests
npm test
```

#### Code Structure

- `/src/components` - Reusable React components
- `/src/pages` - Page-level components and routes
- `/src/hooks` - Custom React hooks
- `/src/integrations` - Third-party service integrations
- `/supabase/functions` - Supabase Edge Functions (backend logic)
- `/supabase/migrations` - Database migration files

---

## 🔌 OnDemand APIs Utilization

### Media API for PDF Generation

ATLAS uses OnDemand Media API to generate professional PDF documents:

```typescript
// Example: Generating an audit report PDF
const generatePDF = async (reportData: AuditReport) => {
  const response = await fetch('https://api.ondemand.com/media/pdf', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${VITE_ONDEMAND_MEDIA_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      template: 'audit-report',
      data: reportData,
      options: {
        format: 'A4',
        orientation: 'portrait',
      },
    }),
  });
  
  const pdfBlob = await response.blob();
  // Save or download the PDF
};
```

**Supported Document Types**:
- Audit reports
- Business plans
- Executive summaries
- Financial analysis reports
- Strategy documents

### Chat API for Conversational Interface

The OnDemand Chat API powers the conversational interface:

```typescript
// Example: Chat conversation
const chatWithATLAS = async (message: string, context: ConversationContext) => {
  const response = await fetch('https://api.ondemand.com/chat', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${VITE_ONDEMAND_CHAT_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      context,
      agent: 'strategic-consultant', // Specify which agent to use
    }),
  });
  
  return await response.json();
};
```

**Chat Features**:
- Context-aware conversations
- Multi-agent routing
- Stream responses for real-time interaction
- Conversation history management

---

## 📁 Project Structure

```
atlas-cunsulting/
├── public/                 # Static assets
│   ├── logo.png           # ATLAS logo
│   └── favicon.ico        # Favicon
├── src/
│   ├── components/        # React components
│   │   ├── app/          # Application components
│   │   ├── audit/        # Audit module components
│   │   ├── layout/       # Layout components (Navbar, Footer)
│   │   ├── sections/     # Landing page sections
│   │   ├── security/     # Security-related components
│   │   ├── three/        # 3D visualization components
│   │   └── ui/           # Reusable UI components (shadcn/ui)
│   ├── hooks/            # Custom React hooks
│   ├── integrations/     # Third-party integrations
│   │   └── supabase/     # Supabase client and types
│   ├── lib/              # Utility functions
│   ├── pages/            # Page components
│   │   └── app/          # Application pages
│   └── test/             # Test files
├── supabase/
│   ├── functions/        # Edge Functions
│   │   ├── ai-audit/
│   │   ├── ai-branding/
│   │   ├── ai-consulting/
│   │   ├── ai-tax-legal/
│   │   ├── atlas-assistance/
│   │   ├── elevenlabs-stt/
│   │   └── elevenlabs-tts/
│   ├── migrations/       # Database migrations
│   └── config.toml       # Supabase configuration
├── .env                  # Environment variables (not committed)
├── package.json          # Dependencies and scripts
├── vite.config.ts        # Vite configuration
└── tailwind.config.ts    # Tailwind CSS configuration
```

---

## 👥 Team

### Project Lead & Development

**Vansh Aggarwal**
- **Role**: Full-Stack Developer & Project Lead
- **Contributions**: 
  - Architecture design and implementation
  - AI services integration
  - Frontend and backend development
  - Multi-agent pipeline orchestration
- **Contact**: [GitHub](https://github.com/vanshaggarwal07)

> *Built with ❤️ by VANSH AGGARWAL*

---

## 🤝 Contributing

This is a private repository. For access or contributions, please contact the repository owner.

If you have access:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is private and proprietary. All rights reserved.

---

## 📧 Support & Contact

For questions, support, or feature requests:

- Open an issue on [GitHub](https://github.com/vanshaggarwal07/ATLAS/issues)
- Contact the development team

---

<div align="center">

**Made with ❤️ using cutting-edge AI and modern web technologies**

[⬆ Back to Top](#-atlas)

</div>
