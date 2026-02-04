import { System } from '@/types';
import { evaluateSystem } from './scoring';

/**
 * Generate historical health scores for drift visualization
 */
export function generateHealthHistory(system: System, days: number = 30): Array<{
  date: string;
  healthScore: number;
  riskScore: number;
  topSignal: string;
}> {
  const history: Array<{
    date: string;
    healthScore: number;
    riskScore: number;
    topSignal: string;
  }> = [];
  
  const now = new Date();
  
  // Generate data points going back in time
  for (let day = days; day >= 0; day--) {
    const date = new Date(now);
    date.setDate(date.getDate() - day);
    
    // Simulate gradual drift by adjusting signal values
    // Start with better health, gradually decline
    const progress = day / days; // 1 = past, 0 = now
    
    const adjustedSystem: System = {
      ...system,
      signals: system.signals.map(signal => ({
        ...signal,
        currentValue: signal.baselineValue + (signal.currentValue - signal.baselineValue) * (1 - progress * 0.3)
      }))
    };
    
    const evaluation = evaluateSystem(adjustedSystem);
    const topSignal = evaluation.topContributingSignals[0];
    
    history.push({
      date: date.toISOString(),
      healthScore: evaluation.healthScore,
      riskScore: evaluation.riskScore,
      topSignal: topSignal 
        ? system.signals.find(s => s.id === topSignal.signalId)?.name || ''
        : ''
    });
  }
  
  return history;
}

/**
 * Detect drift points in health history
 */
export function detectDriftPoints(history: Array<{ date: string; healthScore: number }>): Array<{
  date: string;
  type: 'decline' | 'improvement';
  magnitude: number;
}> {
  const driftPoints: Array<{ date: string; type: 'decline' | 'improvement'; magnitude: number }> = [];
  
  for (let i = 1; i < history.length; i++) {
    const prev = history[i - 1];
    const curr = history[i];
    const change = curr.healthScore - prev.healthScore;
    
    // Detect significant changes (>5 points)
    if (Math.abs(change) > 5) {
      driftPoints.push({
        date: curr.date,
        type: change < 0 ? 'decline' : 'improvement',
        magnitude: Math.abs(change)
      });
    }
  }
  
  return driftPoints;
}
