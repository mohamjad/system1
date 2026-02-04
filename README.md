# System Health Evaluation Framework

A framework that evaluates whether systems are actually healthy using leading indicators and a failure learning loop.

## Features

- **Evaluation Signal**: Real-time health scoring based on leading indicators
- **Failure Mode Discovery**: Identify and track potential failure modes
- **Stress Testing**: Break the system before it breaks
- **Incident Learning**: Learn from incidents to improve detection

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Demo Systems

The app comes with 4 pre-seeded demo systems:

1. **Ecommerce Reporting Pipeline** - Daily revenue and conversion reporting
2. **Refund Spike Monitor** - Real-time monitoring for refund anomalies
3. **Client Health Monitoring** - Monitor client engagement and health metrics
4. **Sentiment Crisis Detector** - Detect negative sentiment velocity and complaint clusters

## How It Works

### Signals (Leading Indicators)

Signals are measurable indicators that catch problems early:
- Data quality signals (missingness, duplicates, schema drift)
- Pipeline reliability signals (job success rate, retry rate, queue lag)
- Business impact signals (conversion drop, refund rate spike)
- User sentiment signals (negative velocity, complaint clusters)
- Behavior drift signals (distribution shift, seasonality deviation)

### Failure Modes

Each system defines failure modes with:
- Severity (1-5)
- Detectability (1-5)
- Lead time (how early we can catch it)
- Primary signals that detect it
- Mitigation playbook

### Evaluation Score

The framework calculates:
- **Health Score** (0-100): Overall system health
- **Risk Score** (0-100): Current risk level
- **Confidence Score** (0-100): How confident we are in the evaluation

### Failure Learning Loop

When an incident occurs:
1. Log the incident with what happened
2. Generate learning suggestions:
   - New signals to add
   - Threshold adjustments
   - New stress tests
3. Apply suggestions to improve detection

## Export/Import

- Export system configurations as JSON
- Import configurations to share or backup
- Reset to demo data anytime

## Deployment

This app is ready to deploy to Vercel:

```bash
npm run build
```

The app uses localStorage for persistence, so it works entirely client-side with no backend required.

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- LocalStorage for persistence
