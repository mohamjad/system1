# User Guide

## Getting Started

### First Visit

1. **Landing Page**: Read the overview and "How it works"
2. **Click "Open Demo"**: Explore pre-configured systems
3. **Click a System**: See detailed health evaluation

### Understanding the Interface

#### Home Page

- **Left Sidebar**: Explanation and example systems
- **Main Content**: Problem/solution and CTAs
- **Statistics**: Key metrics about the framework

#### Systems List

- **System Cards**: Show health score, risk level, top risks
- **Export/Import**: Manage system configurations
- **Create System**: Start monitoring your own system

#### System Detail Page

Six tabs provide different views:

1. **Overview**: Health scores and top risks
2. **Signals**: All signals with status
3. **Evaluation**: How scores are calculated
4. **Stress Tests**: Proactive testing checklist
5. **Incidents**: Logged incidents
6. **Learning Loop**: Improvement suggestions

## Using Signals

### Viewing Signals

1. Go to **Signals** tab
2. Filter by category if needed
3. Click any signal to see details

### Signal Status

- **Normal**: Within acceptable range
- **Watch**: Slight deviation, monitor closely
- **Triggered**: Significant deviation, action needed

### Understanding Signal Details

Each signal shows:
- Current vs baseline values
- Threshold rule
- Why it matters
- Which failure modes it detects

## Logging Incidents

### When to Log

Log an incident when:
- Something breaks
- A failure mode occurs
- You want to improve detection

### How to Log

1. Go to **Incidents** tab
2. Click "Log Incident"
3. Fill in:
   - **Symptom**: What happened
   - **Root Cause**: Category of issue
   - **Impact**: What was affected
   - **What Would Have Caught This**: Be specific
   - **Failure Mode**: Optional, select if known
4. Click "Log Incident"

## Learning from Incidents

### Generate Suggestions

1. Go to **Learning Loop** tab
2. Select an incident from dropdown
3. Click "Generate Learning Suggestions"
4. Review suggestions:
   - New signals to add
   - Threshold adjustments
   - New stress tests

### Apply Suggestions

- **Individual**: Click "Apply" on specific suggestions
- **All**: Click "Apply All Suggestions"
- **Review**: Check how scores change after applying

## Stress Testing

### Purpose

Stress tests verify your signals catch problems before they happen.

### Running Tests

1. Go to **Stress Tests** tab
2. Review existing tests
3. Check pass/fail status
4. Read notes on results

### Understanding Results

- **Passed**: Signals caught the simulated failure
- **Failed**: Signals didn't catch it early enough
- **Notes**: What happened and why

## Creating Systems

### Basic Setup

1. Click "Create System"
2. Enter name and description
3. Click "Create System"

### Adding Signals

After creating:
1. Go to system detail page
2. Go to **Signals** tab
3. Add signals manually (or use Learning Loop suggestions)

### Adding Failure Modes

1. Go to **Evaluation** tab
2. Review failure modes
3. Add new ones as needed

## Export/Import

### Export Systems

1. Click "⋯" menu in systems list
2. Select "Export System Config"
3. JSON file downloads

### Import Systems

1. Click "⋯" menu
2. Select "Import System Config"
3. Choose JSON file
4. Systems load and replace current data

### Reset to Demo

1. Click "⋯" menu
2. Select "Reset to Demo"
3. Confirms and restores demo systems

## Interpreting Scores

### Health Score (0-100)

- **70-100**: Healthy, low risk
- **40-69**: Moderate health, some concerns
- **0-39**: Poor health, high risk

### Risk Score (0-100)

- **0-24**: Low risk
- **25-49**: Medium risk
- **50-100**: High risk

### Confidence Score (0-100)

- **80-100**: High confidence in evaluation
- **60-79**: Moderate confidence
- **0-59**: Low confidence, need more signals

## Best Practices

### Signal Design

1. **Start with high-impact signals**: What matters most?
2. **Set realistic baselines**: Use historical data
3. **Define clear thresholds**: Not too sensitive
4. **Explain why it matters**: Helps understanding
5. **Connect to failure modes**: Tag appropriately

### Failure Mode Design

1. **Focus on high-severity**: What's most critical?
2. **Define lead times**: How early can we catch it?
3. **Map signals**: Which signals detect this?
4. **Write playbooks**: What to do when it happens

### Incident Management

1. **Log promptly**: Don't wait
2. **Be specific**: What actually happened?
3. **Think prevention**: What would have caught this?
4. **Review regularly**: Use Learning Loop

### Continuous Improvement

1. **Review incidents**: Learn from failures
2. **Apply suggestions**: Improve detection
3. **Run stress tests**: Verify signals work
4. **Update thresholds**: Refine over time

## Troubleshooting

### Health Score is 0

- Check if signals are all triggered
- Review signal values vs baselines
- Adjust thresholds if needed

### No Learning Suggestions

- Make sure incident is selected
- Check "What Would Have Caught This" field
- Try generating again

### Signals Not Showing

- Check signal filters
- Verify signals exist in system
- Refresh page

### Data Not Persisting

- Check browser LocalStorage
- Try export/import
- Clear cache and reload

## Tips & Tricks

### Quick Navigation

- Use sidebar links on home page
- Click system cards to jump to detail
- Use tab navigation in system detail

### Understanding Risk

- Check "Top Contributing Signals" in Overview
- Review "Evaluation Explanation" in Evaluation tab
- See "Coverage Map" for failure mode coverage

### Improving Detection

- Log incidents when things break
- Use Learning Loop to get suggestions
- Apply suggestions and watch scores improve
- Run stress tests to verify

### Exporting for Backup

- Export regularly
- Keep JSON files safe
- Import when needed

---

For technical details, see [ARCHITECTURE.md](./ARCHITECTURE.md)
