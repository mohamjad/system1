import { Signal, FailureMode, System, EvaluationResult, SignalStatus } from '@/types';

const EPSILON = 0.001;

/**
 * Calculate deviation percentage from baseline
 */
function calculateDeviation(current: number, baseline: number): number {
  const denominator = Math.max(Math.abs(baseline), EPSILON);
  return Math.abs(current - baseline) / denominator;
}

/**
 * Map deviation to risk contribution
 */
function deviationToRisk(deviation: number): number {
  const percentage = deviation * 100;
  if (percentage < 5) return 0;
  if (percentage < 15) return 10;
  if (percentage < 30) return 25;
  if (percentage < 50) return 45;
  return 70;
}

/**
 * Calculate risk contribution for a single signal
 */
export function calculateSignalRisk(signal: Signal): number {
  const deviation = calculateDeviation(signal.currentValue, signal.baselineValue);
  const baseRisk = deviationToRisk(deviation);
  // Apply severity weight more conservatively (scale factor, not multiplier)
  const weightedRisk = baseRisk * (1 + (signal.severityWeight - 1) * 0.5);
  // Confidence reduces risk (lower confidence = less reliable = less risk contribution)
  const confidenceAdjustedRisk = weightedRisk * signal.confidence;
  // Cap individual signal risk at 50 to prevent single signals from dominating
  return Math.min(50, confidenceAdjustedRisk);
}

/**
 * Get signal status based on risk
 */
export function getSignalStatus(signal: Signal): SignalStatus {
  const risk = calculateSignalRisk(signal);
  if (risk === 0) return 'normal';
  if (risk < 25) return 'watch';
  return 'triggered';
}

/**
 * Calculate risk for a failure mode based on its signals
 */
export function calculateFailureModeRisk(
  failureMode: FailureMode,
  signals: Signal[]
): number {
  const modeSignals = signals.filter(s => 
    failureMode.primarySignalIds.includes(s.id)
  );
  
  if (modeSignals.length === 0) return 0;
  
  // Calculate weighted sum of signal risks
  let totalRisk = 0;
  let totalWeight = 0;
  
  modeSignals.forEach(signal => {
    const risk = calculateSignalRisk(signal);
    const weight = signal.severityWeight;
    totalRisk += risk * weight;
    totalWeight += weight;
  });
  
  const avgRisk = totalWeight > 0 ? totalRisk / totalWeight : 0;
  
  // Correlation bonus: if multiple signals are triggered, boost risk
  const triggeredCount = modeSignals.filter(s => 
    getSignalStatus(s) === 'triggered'
  ).length;
  
  const correlationBonus = triggeredCount > 1 ? 1.2 : 1.0;
  
  return avgRisk * correlationBonus;
}

/**
 * Calculate confidence score based on signal coverage and recency
 */
export function calculateConfidenceScore(system: System): number {
  const { signals, failureModes, lastEvaluation } = system;
  
  // Base confidence from signal population
  const signalCount = signals.length;
  const signalCoverage = Math.min(signalCount / 15, 1.0); // Normalize to 15 signals
  
  // Recency score (how recent is the data)
  const now = new Date();
  const lastEval = new Date(lastEvaluation);
  const hoursSinceEval = (now.getTime() - lastEval.getTime()) / (1000 * 60 * 60);
  const recencyScore = Math.max(0, 1 - hoursSinceEval / 168); // Decay over 1 week
  
  // Coverage of high-severity failure modes
  const highSeverityModes = failureModes.filter(fm => fm.severity >= 4);
  const coveredHighSeverityModes = highSeverityModes.filter(fm => 
    fm.primarySignalIds.some(sid => signals.some(s => s.id === sid))
  );
  const coverageScore = highSeverityModes.length > 0
    ? coveredHighSeverityModes.length / highSeverityModes.length
    : 1.0;
  
  // Weighted combination
  const confidence = (
    signalCoverage * 0.4 +
    recencyScore * 0.3 +
    coverageScore * 0.3
  ) * 100;
  
  return Math.min(100, Math.max(0, confidence));
}

/**
 * Calculate risk score from all signals and failure modes
 */
export function calculateRiskScore(system: System): number {
  const { signals, failureModes } = system;
  
  // Calculate risk from all signals
  const signalRisks = signals.map(s => calculateSignalRisk(s));
  // Use 75th percentile instead of max to avoid single outliers dominating
  const sortedRisks = [...signalRisks].sort((a, b) => b - a);
  const percentile75Index = Math.floor(sortedRisks.length * 0.25);
  const topSignalRisk = sortedRisks.length > 0 ? sortedRisks[percentile75Index] : 0;
  
  // Calculate risk from failure modes
  const failureModeRisks = failureModes.map(fm => 
    calculateFailureModeRisk(fm, signals)
  );
  const topFailureModeRisk = failureModeRisks.length > 0 
    ? Math.max(...failureModeRisks, 0)
    : 0;
  
  // Weighted combination: 70% top signal risk, 30% failure mode risk
  // This prevents single signals from completely dominating
  const riskScore = Math.min(100, topSignalRisk * 0.7 + topFailureModeRisk * 0.3);
  
  return riskScore;
}

/**
 * Calculate health score (inverse of risk)
 */
export function calculateHealthScore(riskScore: number): number {
  return Math.max(0, Math.min(100, 100 - riskScore));
}

/**
 * Get risk level from risk score
 */
export function getRiskLevel(riskScore: number): 'low' | 'medium' | 'high' {
  if (riskScore < 25) return 'low';
  if (riskScore < 50) return 'medium';
  return 'high';
}

/**
 * Get top contributing signals
 */
export function getTopContributingSignals(
  signals: Signal[],
  limit: number = 3
): Array<{ signalId: string; contribution: number }> {
  return signals
    .map(s => ({
      signalId: s.id,
      contribution: calculateSignalRisk(s)
    }))
    .sort((a, b) => b.contribution - a.contribution)
    .slice(0, limit);
}

/**
 * Get active failure modes
 */
export function getActiveFailureModes(
  failureModes: FailureMode[],
  signals: Signal[]
): Array<{ failureModeId: string; riskScore: number }> {
  return failureModes
    .map(fm => ({
      failureModeId: fm.id,
      riskScore: calculateFailureModeRisk(fm, signals)
    }))
    .filter(fm => fm.riskScore > 0)
    .sort((a, b) => b.riskScore - a.riskScore);
}

/**
 * Generate evaluation explanation
 */
export function generateExplanation(
  system: System,
  topSignals: Array<{ signalId: string; contribution: number }>,
  activeModes: Array<{ failureModeId: string; riskScore: number }>
): string {
  const topSignal = topSignals[0];
  if (!topSignal || topSignal.contribution === 0) {
    return 'All signals are within normal ranges. System appears healthy.';
  }
  
  const signal = system.signals.find(s => s.id === topSignal.signalId);
  if (!signal) return '';
  
  const deviation = calculateDeviation(signal.currentValue, signal.baselineValue);
  const deviationPercent = Math.round(deviation * 100);
  
  const direction = signal.currentValue > signal.baselineValue ? 'increased' : 'decreased';
  const change = Math.abs(signal.currentValue - signal.baselineValue);
  
  let explanation = `Health ${system.healthScore < 70 ? 'dropped' : 'is stable'} because ${signal.name} ${direction} ${deviationPercent}%`;
  
  if (topSignals.length > 1) {
    const secondSignal = system.signals.find(s => s.id === topSignals[1].signalId);
    if (secondSignal) {
      const secondDeviation = calculateDeviation(secondSignal.currentValue, secondSignal.baselineValue);
      const secondPercent = Math.round(secondDeviation * 100);
      const secondDirection = secondSignal.currentValue > secondSignal.baselineValue ? 'increased' : 'decreased';
      explanation += ` and ${secondSignal.name} ${secondDirection} ${secondPercent}%`;
    }
  }
  
  if (activeModes.length > 0) {
    const topMode = system.failureModes.find(fm => fm.id === activeModes[0].failureModeId);
    if (topMode) {
      explanation += `. This suggests ${topMode.name.toLowerCase()} may be occurring.`;
    }
  }
  
  return explanation;
}

/**
 * Full evaluation of a system
 */
export function evaluateSystem(system: System): EvaluationResult {
  const riskScore = calculateRiskScore(system);
  const healthScore = calculateHealthScore(riskScore);
  const confidenceScore = calculateConfidenceScore(system);
  
  const topSignals = getTopContributingSignals(system.signals, 3);
  const activeModes = getActiveFailureModes(system.failureModes, system.signals);
  
  const explanation = generateExplanation(system, topSignals, activeModes);
  
  return {
    healthScore,
    riskScore,
    confidenceScore,
    explanation,
    topContributingSignals: topSignals,
    activeFailureModes: activeModes
  };
}

/**
 * Re-evaluate system and update scores
 */
export function reevaluateSystem(system: System): System {
  const evaluation = evaluateSystem(system);
  
  return {
    ...system,
    healthScore: evaluation.healthScore,
    riskScore: evaluation.riskScore,
    confidenceScore: evaluation.confidenceScore,
    riskLevel: getRiskLevel(evaluation.riskScore),
    lastEvaluation: new Date().toISOString(),
    topRisks: evaluation.topContributingSignals
      .slice(0, 2)
      .map(ts => {
        const signal = system.signals.find(s => s.id === ts.signalId);
        return signal?.name || '';
      })
      .filter(Boolean)
  };
}
