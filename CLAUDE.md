# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AstroMoon is a Chinese-language astrology fortune-telling web application. Users input birth data to generate AI-powered personalized life destiny analysis with K-line chart visualizations. The app uses Firebase authentication and a Railway-hosted backend.

## Commands

```bash
# Install dependencies
npm install

# Start development server (http://localhost:5173)
npm run dev

# Build for production (outputs to dist/)
npm run build

# Preview production build
npm run preview
```

## Environment Variables

Copy `.env.example` to `.env`. Key variables:
- `VITE_RAILWAY_BACKEND_URL` - Backend API URL (defaults to Railway dev)
- `VITE_TURNSTILE_SITE_KEY` - Cloudflare Turnstile human verification

Note: Vite requires `VITE_` prefix for client-accessible env vars.

## Architecture

### Tech Stack
- React 19 + TypeScript
- Vite 7 (build tool)
- Firebase Auth (authentication)
- Recharts (chart visualization)
- Lucide React (icons)

### Source Files (Root Level)
Unlike typical React projects, source files are at the project root (not in `src/`):
- `App.tsx` - Main application component, handles routing between views
- `index.tsx` - Entry point, sets up AuthProvider
- `types.ts` - Core TypeScript types (UserInput, KLinePoint, AnalysisData, LifeDestinyResult)
- `constants.ts` - AI prompt templates and configuration constants

### Key Directories
- `components/` - React UI components
  - `ImportDataMode.tsx` - Main data input form (largest component)
  - `LifeKLineChart.tsx` - K-line chart visualization
  - `AnalysisResult.tsx` - Analysis results display
  - `Login.tsx` - Authentication UI
  - `BuyStarsModal.tsx` - Stars (in-app currency) purchase flow
- `services/` - API communication
  - `apiService.ts` - Chart calculation and AI generation (SSE streaming)
  - `api/` - Modular API layer
    - `config.ts` - Base URL and auth token helpers
    - `types.ts` - API request/response types
    - `payments.ts`, `reports.ts`, `profiles.ts` - Domain-specific APIs
- `contexts/AuthContext.tsx` - Firebase auth context provider
- `utils/` - Utility functions
  - `jsonParser.ts` - Parse AI-generated JSON responses
  - `retry.ts` - Retry mechanism for API calls
  - `wealthLevels.ts` - Wealth level calculations

### Data Flow
1. User enters birth data in `ImportDataMode.tsx`
2. `apiService.calculateChart()` sends data to backend for astrological calculations
3. `apiService.generateWithAPI()` streams AI analysis via SSE
4. Results stored as `LifeDestinyResult` and displayed in `AnalysisResult.tsx` and `LifeKLineChart.tsx`

### Authentication
Firebase Auth with multiple methods (Google, email/password, magic link). All API requests require JWT token added via `getAuthToken()` in `services/api/config.ts`.

### Backend Communication
- Backend URL configured via `VITE_RAILWAY_BACKEND_URL`
- Main endpoints: `/api/chart/unified` (chart calculation), `/api/generate` (AI generation with SSE)
- AI generation uses Server-Sent Events (SSE) for streaming responses

### Dual Domain Setup
`vercel.json` routes:
- `www.astromoon.xyz` → `landing.html` (marketing page)
- `app.astromoon.xyz` → `index.html` (main application)

## Key Types

```typescript
// User birth data input
interface UserInput { birthYear, birthMonth, birthDay, birthHour, birthMinute, birthLatitude, birthLongitude, ... }

// K-line chart data point (one per year of life)
interface KLinePoint { age, year, open, close, high, low, score, reason, ... }

// AI analysis results
interface AnalysisData { summary, summaryScore, traderVitality, wealthPotential, ... }

// Combined result
interface LifeDestinyResult { chartData: KLinePoint[], analysis: AnalysisData }
```

## Development Notes

- All UI text is in Chinese
- The app supports two report types: "综合人生" (general life) and "交易员" (trader) modes
- Stars (星星) are the in-app currency for generating reports
- Payment integration uses NOWPayments for cryptocurrency
