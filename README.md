# SEO Snap

A comprehensive SEO audit tool with AI-powered recommendations built with Next.js, Playwright, and OpenAI.

## Overview

SEO Snap analyzes web pages for technical SEO issues and provides prioritized, actionable recommendations powered by AI. Track improvements over time with audit history and export reports in Markdown format.

## Features

- **Comprehensive Page Analysis**: Fetches and analyzes HTML, metadata, and page structure using Playwright
- **Technical SEO Checks**: 9 automated validators for title, meta description, canonical URLs, robots meta, headings, images, Open Graph, Twitter Cards, and Schema.org markup
- **AI-Powered Recommendations**: OpenAI generates prioritized issues, quick wins, and suggested rewrites for title and meta description
- **Audit History**: Save and view all audits for each URL with timestamps and scores
- **Report Comparison**: Compare two reports side-by-side to see score changes and which checks improved/worsened
- **Markdown Export**: Download comprehensive audit reports in Markdown format

## Tech Stack

- **Framework**: Next.js 14 (App Router) with TypeScript
- **UI**: Tailwind CSS
- **Database**: Neon PostgreSQL (or SQLite for local development)
- **Scraping**: Playwright (headless browser automation)
- **AI**: OpenAI GPT-4o-mini
- **Validation**: Zod for schema validation

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (Neon recommended) or SQLite for local development
- OpenAI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SEOsnap
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install Playwright browsers**
   ```bash
   npx playwright install
   ```

4. **Configure environment variables**

   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

   Update `.env` with your credentials:
   ```
   DATABASE_URL="postgresql://user:password@host/database?sslmode=require"
   OPENAI_API_KEY="your_openai_api_key_here"
   ```

   For local development with SQLite:
   ```
   DATABASE_URL="file:./dev.db"
   ```

5. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Open the application**

   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

1. **Enter a URL** in the audit form
2. **Click "Analyze"** to start the audit (takes 5-15 seconds)
3. **View results** including:
   - Overall SEO score (0-100)
   - Technical checks with pass/fail indicators
   - AI-generated top issues with fixes
   - Quick wins and prioritized actions
   - Suggested title and meta description rewrites
4. **Access history** in the sidebar to view past audits
5. **Compare reports** by clicking "Compare Reports"
6. **Export** audit as Markdown via "Download Markdown"

## API Endpoints

### POST `/api/audit`
Create a new SEO audit.

**Request:**
```json
{
  "url": "https://example.com"
}
```

**Response:**
```json
{
  "report": {
    "id": "...",
    "siteId": "...",
    "createdAt": "2025-10-24T...",
    "score": 85,
    "rawMeta": { ... },
    "checks": { ... },
    "aiAdvice": { ... }
  }
}
```

### GET `/api/reports?url=<url>`
Retrieve all reports for a specific URL.

### GET `/api/report/[id]`
Retrieve a single report by ID.

### POST `/api/export/[id]`
Export a report as Markdown file.

## Architecture

### Data Flow
1. User submits URL via `AuditForm`
2. `/api/audit` endpoint:
   - Fetches page with Playwright (`lib/fetchPage.ts`)
   - Runs SEO checks (`lib/checks.ts`)
   - Calls OpenAI for recommendations (`lib/ai.ts`)
   - Saves report to database (`lib/prisma.ts`)
3. UI displays results with all components
4. History refreshes automatically

### Components
- `AuditForm`: URL input and submission
- `ScoreBadge`: Color-coded score visualization
- `ChecksGrid`: Technical checks display
- `AdvicePanel`: AI recommendations
- `RewriteSuggestions`: Title/meta rewrites with copy buttons
- `HistoryList`: Past audits sidebar
- `CompareDrawer`: Side-by-side report comparison

### Database Schema
```prisma
model Site {
  id        String   @id @default(cuid())
  url       String   @unique
  createdAt DateTime @default(now())
  reports   Report[]
}

model Report {
  id        String   @id @default(cuid())
  siteId    String
  score     Int
  rawMeta   Json
  checks    Json
  aiAdvice  Json
  createdAt DateTime @default(now())
  site      Site     @relation(fields: [siteId], references: [id])
}
```

## Design Decisions

### Playwright vs Cheerio
We chose Playwright over static HTML parsing (cheerio) to ensure accurate metadata extraction from modern JavaScript-rendered websites. While this adds 2-5 seconds per audit vs <1 second, it provides reliable results for all sites.

### Browser Lifecycle Management
A singleton browser instance is reused across requests to minimize overhead while ensuring proper cleanup. This balances performance with resource consumption.

### Score Calculation
Simple penalty-based scoring (100 minus 5 per failed check) provides a baseline. The AI also generates its own nuanced score considering context and severity.

### AI Model Selection
GPT-4o-mini offers cost efficiency while providing high-quality SEO recommendations. The structured JSON output with Zod validation ensures data integrity.

## Tradeoffs

- **Performance**: Playwright is slower than static parsing but handles JavaScript-rendered content
- **Resource Usage**: Browser instances consume more memory; consider implementing request queuing for production
- **Deployment**: Requires Playwright browser binaries (Docker or Vercel/Render recommended)
- **No Authentication**: Currently open; add rate limiting or auth for production use
- **No Caching**: Each audit fetches fresh data; could implement short-term caching

## Production Deployment

**📘 See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment guide**

### Recommended Architecture
- **Railway.app**: Hosts Playwright backend (handles audits)
- **Vercel**: Hosts frontend and non-Playwright APIs (fast CDN delivery)
- **Neon**: PostgreSQL database (shared between both)

This split deployment gives you:
- ⚡ Fast frontend on Vercel's CDN
- 🎭 Reliable Playwright execution on Railway
- 💰 Cost-effective (Railway handles heavy lifting, Vercel serves static content)

### Quick Deploy

1. **Deploy to Railway** (Backend with Playwright)
   - Connect GitHub repository
   - Railway auto-detects Dockerfile
   - Add environment variables (DATABASE_URL, OPENAI_API_KEY)
   - Deploy takes ~5-10 minutes

2. **Deploy to Vercel** (Frontend)
   - Update `vercel.json` with Railway URL
   - Connect GitHub repository
   - Add same environment variables
   - Deploy takes ~2-3 minutes

3. **Update vercel.json**
   ```json
   {
     "rewrites": [{
       "source": "/api/audit",
       "destination": "https://your-app.railway.app/api/audit"
     }]
   }
   ```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed step-by-step instructions.

## Development

### Type Checking
```bash
npx tsc --noEmit
```

### Linting
```bash
npm run lint
```

### Build
```bash
npm run build
```

### Database Migrations
```bash
npx prisma migrate dev --name migration_name
```

## Future Enhancements

- **Request Queuing**: Limit concurrent browser instances
- **Rate Limiting**: IP-based throttling
- **Robots.txt/Sitemap Validation**: Additional technical checks
- **PDF Export**: Use Playwright PDF generation
- **Lighthouse Integration**: Add performance and accessibility scores
- **Authentication**: User accounts and private reports
- **Scheduling**: Automated recurring audits
- **Webhooks**: Notifications for score changes

## License

MIT

## Credits

Built with Next.js, Playwright, OpenAI, Prisma, and Tailwind CSS.
