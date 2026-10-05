# PathPilot AI

### Your AI Education & Career Navigator

An AI-powered education and career navigator that helps students discover suitable careers, programs, universities, scholarships, and personalized education pathways based on their academic profile, goals, location, and preferences.

**Live app:** [PathPilot AI](https://pathpilot-ai-phi.vercel.app/)

> Built as an education-focused hackathon MVP with an agentic AI layer for personalized, multi-step guidance.

---

## Features:

* **Personalized Student Profile** — stores education, academic performance, skills, interests, career goals, location, budget, and preferences.
* **AI Career Counselor** — helps students explore suitable career directions based on their profile and goals.
* **University & Program Matching** — recommends relevant universities and degree programs using structured data and deterministic matching.
* **Eligibility Analysis** — evaluates program eligibility based on the available academic and program requirements.
* **Scholarship Matching** — identifies relevant scholarship opportunities based on student and program information.
* **Accreditation Information** — provides available accreditation and recognition information for programs.
* **Personalized Roadmap** — generates an education roadmap based on the student's current profile, career direction, and selected opportunities.
* **Agentic AI Orchestration** — the AI agent understands goals, plans actions, selects tools, analyzes results, and coordinates multiple services.
* **Grounded AI Responses** — factual decisions remain grounded in structured data and deterministic backend services rather than LLM-generated assumptions.
* **Multi-Step Guidance** — connects Career → Program → Eligibility → Scholarship → Roadmap into a single guided workflow.
* **Shared Profile Context** — the same student context is used across the application instead of maintaining separate profile states.

---

## Agentic Architecture:

```text
Student
   ↓
Career Counselor / Agent UI
   ↓
PathPilot AI Agent
   ↓
Tool Registry
   ├── Career Matching
   ├── Program Matching
   ├── Eligibility
   ├── Scholarship Matching
   └── Roadmap Context
   ↓
Deterministic Backend
   ↓
Structured Education Data
```

> **The agent reasons and orchestrates. Deterministic tools decide what is factually true.**

The agent is not allowed to invent universities, programs, scholarships, eligibility results, accreditation information, or other factual application data.

---

## Tech Stack:

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript + Vite |
| UI | Tailwind CSS + Lucide React |
| Backend | Python + FastAPI |
| Database | PostgreSQL / Supabase |
| Authentication | Supabase Auth |
| AI | Groq API |
| Agent Layer | Lightweight Python orchestration |
| Storage | Supabase Storage |
| Frontend Hosting | Vercel / Netlify |
| Backend Hosting | Koyeb |

---

## Core API:

```text
POST /auth/register
POST /auth/login

GET  /profile
PUT  /profile

GET  /countries
GET  /education-systems

POST /career/analyze
POST /universities/recommend
POST /programs/eligibility

GET  /scholarships/matches
GET  /accreditation/{program_id}

POST /roadmap/generate
POST /ai/orchestrate
POST /api/agent/chat
```

---

## Getting Started:

### Prerequisites:

* Python 3.11+
* Node.js 18+
* PostgreSQL / Supabase project
* Google Gemini API key
* Supabase credentials

### Backend:

```bash
cd backend

python -m venv venv
.\venv\Scripts\Activate.ps1

pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend:

```bash
cd frontend

npm install
npm run dev
```

Create the required environment variables for the backend and frontend before starting the application.

> **Never commit `.env` files or API keys.**

---

## Project Structure:

```text
pathpilot-ai
├── backend
│   ├── agents             # Multi-agent orchestrator logic (CareerAgent, EligibilityAgent, etc.)
│   ├── data               # Structured JSON datasets for deterministic evaluation
│   ├── routers            # FastAPI route handlers (auth, profile, counselor, etc.)
│   ├── venv               # Python virtual environment
│   ├── .env               # Backend environment variables (Groq API, database URL)
│   ├── config.py          # Configuration settings
│   ├── database.py        # SQLAlchemy database connection setup
│   ├── dependencies.py    # FastAPI dependencies (auth, orchestrator instance)
│   ├── main.py            # FastAPI application entry point
│   ├── models.py          # SQLAlchemy database models (Users, Profiles)
│   ├── pathpilot.db       # SQLite database file
│   ├── requirements.txt   # Python dependencies
│   ├── schemas.py         # Pydantic validation schemas
│   └── utils.py           # Helper functions
│
└── frontend
    ├── dist               # Production build output
    ├── node_modules       # npm dependencies
    ├── public             # Static assets
    ├── src                # React source code (components, pages, context)
    ├── .env               # Frontend environment variables (Vite API URL)
    ├── .gitignore         # Git ignore rules
    ├── eslint.config.js   # Linter configuration
    ├── index.html         # Main HTML entry point
    ├── package.json       # npm scripts and dependencies
    ├── README.md          # Project documentation
    ├── vercel.json        # Vercel deployment configuration
    └── vite.config.js     # Vite bundler configuration
```

---

## MVP Journey:

```text
Profile
   ↓
Career
   ↓
Programs
   ↓
Eligibility
   ↓
Scholarships
   ↓
Personalized Roadmap
```

The agent can coordinate multiple stages when a user's request requires more than one service.

---

## Security & Reliability:

* AI tools are explicitly registered and controlled.
* Tool arguments are validated before execution.
* The LLM cannot execute arbitrary code or shell commands.
* Deterministic services remain authoritative for eligibility and matching.
* Private chain-of-thought is not exposed.
* The deterministic application continues to provide core functionality if the agent service is unavailable.
* Missing information is reported instead of being fabricated.

---

## MVP Scope:

The current MVP focuses on:

* Student onboarding
* Education and career profiles
* Career guidance
* University/program recommendations
* Eligibility analysis
* Scholarship matching
* Accreditation information
* Personalized roadmaps
* Agentic AI orchestration
* Deployment

Future product direction includes research, internships, jobs, skill-gap analysis, and a broader opportunity network.

---

## Project Status:

**Hackathon MVP**

PathPilot AI is an education-focused vertical slice of a larger vision: an intelligent platform that helps people discover, evaluate, and pursue opportunities throughout their education and career journey.

---

## License:

Licensed under the [PolyForm Noncommercial License 1.0.0](https://polyformproject.org/licenses/noncommercial/1.0.0) — you're free to view, run, and modify this code for any noncommercial purpose (personal use, learning, research, coursework, etc.), but commercial use requires the copyright holder's permission. See [LICENSE.md](LICENSE.md) for the full terms.