# System Health Evaluation Framework

A framework that evaluates whether systems are actually healthy using leading indicators and a failure learning loop. Instead of waiting for alerts after something breaks, you define signals that fire *before* things break.

simple frontend demo i made for a startup's evaluation system before they ran out of money 



#### Failure Modes

Failure modes define what can go wrong:
- **Severity** (1-5): How bad is it?
- **Detectability** (1-5): How easy is it to catch?
- **Lead Time**: How early can we catch it?
- **Primary Signals**: Which signals detect this mode
- **Mitigation Playbook**: What to do when it happens

#### Health Score

The framework calculates three scores:

1. **Health Score** (0-100): Overall system health
   - Starts at 100
   - Subtracts risk from all signals
   - Higher is better

2. **Risk Score** (0-100): Current risk level
   - Based on signal deviations and failure modes
   - Lower is better

3. **Confidence Score** (0-100): How confident we are
   - Based on signal coverage, data recency, and failure mode coverage
   - Higher means more reliable evaluation

#### Failure Learning Loop

When an incident occurs:
1. Log what happened
2. The framework analyzes what would have caught it
3. Generates suggestions:
   - New signals to add
   - Threshold adjustments
   - New stress tests
4. Apply suggestions to improve detection

##  Architecture

### Project Structure

```
system1/
├── app/                    # Next.js app router pages
│   ├── page.tsx           # Home page
│   ├── systems/           # Systems pages
│   │   ├── page.tsx       # Systems list
│   │   ├── [id]/page.tsx  # System detail
│   │   └── new/page.tsx   # Create system
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── SystemCard.tsx     # System card component
│   ├── HealthGauge.tsx    # Health score gauge
│   └── tabs/              # Tab components
│       ├── OverviewTab.tsx
│       ├── SignalsTab.tsx
│       ├── EvaluationTab.tsx
│       ├── StressTestsTab.tsx
│       ├── IncidentsTab.tsx
│       └── LearningLoopTab.tsx
├── lib/                   # Core logic
│   ├── scoring.ts         # Scoring engine
│   ├── learning-loop.ts   # Learning suggestions
│   ├── storage.ts         # LocalStorage utilities
│   └── demo-data.ts      # Demo systems
├── types/                 # TypeScript definitions
│   └── index.ts
└── public/                # Static assets
```

### Key Files

- **`lib/scoring.ts`**: Calculates health, risk, and confidence scores
- **`lib/learning-loop.ts`**: Generates learning suggestions from incidents
- **`lib/storage.ts`**: Handles LocalStorage persistence
- **`lib/demo-data.ts`**: Pre-seeded demo systems

## Demo Systems

The app comes with 3 pre-configured systems:

1. **Agent Training Pipeline** - Monitor training pipeline health for autonomous software agents
2. **Code Evaluation System** - Monitor automated code quality and correctness evaluation
3. **Agent Performance Tracking** - Track long-horizon agent journey performance and outcomes

Each system includes:
- 8-10 signals covering different categories
- 1-6 failure modes with mitigation playbooks
- 1-4 incidents showing learning opportunities
- 1-4 stress tests

##  Design System

The app uses a **Linear-style** design:
- Clean borders (no shadows)
- Subtle hover states
- Color only for meaning (status, risk levels)
- Single sans-serif font
- Strong hierarchy through size and weight

##  Data Persistence

All data is stored in **LocalStorage**:
- Systems persist across sessions
- Export/Import functionality available
- Reset to demo data anytime

### Export/Import

- **Export**: Download system configurations as JSON
- **Import**: Load configurations from JSON files
- **Reset**: Restore demo systems

##  Customization

### Adding a New System

1. Click "Create System" on the home page
2. Enter name and description
3. Add signals, failure modes, and stress tests in the system detail page

### Adding Signals

In the Signals tab:
- Click to see signal details
- Signals are automatically evaluated
- Status shows: Normal, Watch, or Triggered

### Logging Incidents

1. Go to Incidents tab
2. Click "Log Incident"
3. Fill in:
   - Symptom
   - Root cause category
   - Impact
   - What would have caught this earlier
4. Go to Learning Loop tab to see suggestions

### Applying Learning

1. Go to Learning Loop tab
2. Select an incident
3. Click "Generate Learning Suggestions"
4. Review suggestions
5. Click "Apply" on individual suggestions or "Apply All"

##  Scoring Algorithm

### Signal Risk Calculation

1. Calculate deviation from baseline: `|current - baseline| / baseline`
2. Map to risk contribution:
   - 0-5% deviation: 0 risk
   - 5-15%: 10 risk
   - 15-30%: 25 risk
   - 30-50%: 45 risk
   - >50%: 70 risk
3. Apply severity weight (1.0-2.0)
4. Apply confidence (0.5-1.0)
5. Cap at 50 to prevent single signals from dominating

### Overall Risk Score

- Uses 75th percentile of signal risks (avoids outliers)
- Combines with failure mode risks (70% signal, 30% failure mode)
- Normalized to 0-100

### Health Score

- `Health = 100 - Risk Score`
- Clamped to 0-100

## Stress Testing

Stress tests simulate failures to verify signals catch them:
- **Schema Change**: Test data quality signals
- **Missing Batch**: Test pipeline reliability signals
- **API Rate-Limit**: Test infrastructure signals
- **Performance Degradation**: Test behavior drift signals

Each test shows:
- Expected signals that should fire
- Pass/fail status
- Notes on what happened

## Failure Modes

Failure modes define what can go wrong:

- **Severity** (1-5): Impact level
- **Detectability** (1-5): How easy to catch
- **Lead Time**: How early we can catch it
- **Primary Signals**: Which signals detect it
- **Mitigation Playbook**: Step-by-step response

##  Best Practices

### Signal Design

1. **Choose leading indicators**: Things that change before failures
2. **Set realistic baselines**: Based on historical data
3. **Define clear thresholds**: Not too sensitive, not too lenient
4. **Explain why it matters**: Helps others understand
5. **Tag failure modes**: Connect signals to problems they catch

### Failure Mode Design

1. **Start with high-severity modes**: Focus on what matters most
2. **Define clear lead times**: How early can we catch it?
3. **Map to signals**: Which signals detect this mode?
4. **Write playbooks**: What to do when it happens

### Incident Logging

1. **Be specific**: What actually happened?
2. **Think about prevention**: What would have caught this?
3. **Review regularly**: Use Learning Loop to improve

## 🛠️ Development

### Tech Stack

- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS 4**
- **LocalStorage** (no backend required)

### Key Dependencies

- `next`: React framework
- `react`: UI library
- `tailwindcss`: Styling
- `typescript`: Type safety

### Building

```bash
npm run build
```

### Running Production Build

```bash
npm run build
npm start
```

## License

This project is open source and available for use.
- **Demo Data**: See `lib/demo-data.ts` for example systems

---

Built with attention to detail. Ready to ship.
