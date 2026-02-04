# Architecture Documentation

## System Overview

The System Health Evaluation Framework is a client-side Next.js application that evaluates system health using leading indicators and a failure learning loop.

## Core Components

### 1. Scoring Engine (`lib/scoring.ts`)

The scoring engine calculates three key metrics:

#### Signal Risk Calculation
- Calculates deviation from baseline
- Maps deviation to risk contribution (0-70)
- Applies severity weight and confidence
- Caps individual signal risk at 50

#### Failure Mode Risk Calculation
- Weighted sum of primary signal risks
- Correlation bonus for multiple triggered signals
- Normalized to 0-100

#### Health Score
- `Health = 100 - Risk Score`
- Clamped to 0-100

#### Confidence Score
- Based on:
  - Signal population (normalized to 15 signals)
  - Data recency (decay over 1 week)
  - High-severity failure mode coverage

### 2. Learning Loop (`lib/learning-loop.ts`)

Generates suggestions from incidents:

#### Suggestion Types
1. **New Signal**: When a signal was missing
2. **Threshold Update**: When a signal threshold was too weak
3. **New Stress Test**: To proactively test failure modes

#### Application
- Applies suggestions to system
- Re-evaluates system after changes
- Updates scores automatically

### 3. Storage (`lib/storage.ts`)

LocalStorage-based persistence:
- Loads systems from localStorage or demo data
- Saves systems on updates
- Export/Import functionality
- Reset to demo data

### 4. Demo Data (`lib/demo-data.ts`)

Pre-seeded systems:
- Agent Training Pipeline
- Code Evaluation System
- Agent Performance Tracking

Each system includes comprehensive signals, failure modes, incidents, and stress tests.

## UI Components

### Pages

1. **Home Page** (`app/page.tsx`)
   - Sidebar with explanation and examples
   - Main content with CTAs
   - Statistics display

2. **Systems List** (`app/systems/page.tsx`)
   - Grid of system cards
   - Export/Import controls
   - Create system button

3. **System Detail** (`app/systems/[id]/page.tsx`)
   - Tab navigation
   - Overview, Signals, Evaluation, Stress Tests, Incidents, Learning Loop

4. **Create System** (`app/systems/new/page.tsx`)
   - Form to create new system
   - Basic information only (signals added later)

### Components

- **SystemCard**: Displays system summary
- **HealthGauge**: Circular health score display
- **SignalStatusBadge**: Status indicator (Normal/Watch/Triggered)
- **InfoTooltip**: Hover explanations
- **ExportImport**: Export/Import menu

### Tabs

Each tab is a separate component:
- **OverviewTab**: Health scores, top risks, recommendations
- **SignalsTab**: Signal table with filters and detail drawer
- **EvaluationTab**: Evaluation explanation, failure modes, coverage map
- **StressTestsTab**: Stress test checklist
- **IncidentsTab**: Incident list and logging form
- **LearningLoopTab**: Learning suggestions and application

## Data Flow

1. **Load**: Systems loaded from localStorage or demo data
2. **Evaluate**: Systems re-evaluated on load
3. **Display**: Components show evaluated data
4. **Update**: Changes trigger re-evaluation
5. **Save**: Updates saved to localStorage

## State Management

- **Client-side only**: No backend
- **LocalStorage**: Persistent storage
- **React state**: Component-level state
- **Re-evaluation**: Automatic on data changes

## Styling

- **Tailwind CSS 4**: Utility-first styling
- **CSS Variables**: Theme colors
- **Linear-style**: Clean, minimal design
- **Responsive**: Mobile-friendly

## Type Safety

Full TypeScript coverage:
- **Types**: Defined in `types/index.ts`
- **Strict mode**: Enabled
- **Type inference**: Leveraged throughout

## Performance

- **Static generation**: Home and systems list pages
- **Dynamic routes**: System detail pages
- **Client-side evaluation**: Fast, no server needed
- **LocalStorage**: Instant persistence

## Extensibility

### Adding New Signal Categories

1. Add to `SignalCategory` type
2. Add label to `categoryLabels` in SignalsTab
3. Use in signal definitions

### Adding New Failure Modes

1. Define in system's `failureModes` array
2. Link to signals via `primarySignalIds`
3. Add mitigation playbook steps

### Custom Scoring

Modify `lib/scoring.ts`:
- Adjust `deviationToRisk` mapping
- Change risk calculation weights
- Modify confidence calculation

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import in Vercel
3. Auto-detects Next.js
4. Deploys automatically

### Other Platforms

- **Netlify**: Similar to Vercel
- **Self-hosted**: Build and serve `.next` folder
- **Docker**: Containerize the Next.js app

## Security Considerations

- **Client-side only**: No sensitive data
- **LocalStorage**: Browser storage (not encrypted)
- **No authentication**: Public demo
- **Export/Import**: User-controlled data

## Future Enhancements

Potential additions:
- Backend API for persistence
- User authentication
- Multi-user support
- Real-time signal updates
- Webhook integrations
- Alert notifications
