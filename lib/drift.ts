import { System } from '@/types';
import { evaluateSystem } from './scoring';

/**
 * Generate historical health scores for drift visualization
 */
export function generateHealthHistory(system: System, days: number = 90): Array<{
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
  
  // Generate a unique seed for this system based on its ID for consistent variation
  const systemSeed = system.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  // Generate data points going forward from (days ago) to today
  // Use milliseconds for precise date calculation
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const todayMs = today.getTime();
  
  const daysInMs = days * 24 * 60 * 60 * 1000;
  const startDateMs = todayMs - daysInMs;
  
  for (let day = 0; day <= days; day++) {
    let date: Date;
    
    if (day === days) {
      // Last point is exactly today - use current date/time
      date = new Date();
      date.setHours(12, 0, 0, 0);
    } else {
      // Calculate exact date using milliseconds
      const dateMs = startDateMs + (day * 24 * 60 * 60 * 1000);
      date = new Date(dateMs);
      date.setHours(12, 0, 0, 0);
    }
    
    // Simulate gradual drift with variation
    // Progress: 0 = past (90 days ago), 1 = now (today)
    const progress = day / days;
    
    // Create variation: some systems improve, some decline, some fluctuate
    const variationType = systemSeed % 3; // 0 = improving, 1 = declining, 2 = fluctuating
    let healthMultiplier = 1;
    
    if (variationType === 0) {
      // Improving over time (start lower, end higher)
      healthMultiplier = 0.85 + (progress * 0.2); // 85% -> 105% of baseline
    } else if (variationType === 1) {
      // Declining over time (start higher, end lower)
      healthMultiplier = 1.05 - (progress * 0.25); // 105% -> 80% of baseline
    } else {
      // Fluctuating with overall improvement
      const wave = Math.sin(progress * Math.PI * 4) * 0.1; // Wave pattern
      healthMultiplier = 0.9 + (progress * 0.15) + wave; // 90% -> 105% with waves
    }
    
    // Apply variation to signals - make them healthier overall
    const adjustedSystem: System = {
      ...system,
      signals: system.signals.map((signal, idx) => {
        // Move current value closer to baseline (healthier)
        const deviation = signal.currentValue - signal.baselineValue;
        const adjustedDeviation = deviation * (0.3 + progress * 0.4) * healthMultiplier;
        
        // Add small random variation for realism
        const randomVariation = (Math.sin((day + idx) * 0.1) * 0.05);
        
        return {
          ...signal,
          currentValue: signal.baselineValue + adjustedDeviation + randomVariation
        };
      })
    };
    
    const evaluation = evaluateSystem(adjustedSystem);
    const topSignal = evaluation.topContributingSignals[0];
    
    history.push({
      date: date.toISOString(),
      healthScore: Math.max(0, Math.min(100, evaluation.healthScore)), // Clamp to 0-100
      riskScore: evaluation.riskScore,
      topSignal: topSignal 
        ? system.signals.find(s => s.id === topSignal.signalId)?.name || ''
        : ''
    });
  }
  
  // Verify and ensure the last entry is exactly today
  if (history.length > 0) {
    const lastEntry = history[history.length - 1];
    const lastDate = new Date(lastEntry.date);
    const todayDate = new Date(now);
    todayDate.setHours(12, 0, 0, 0);
    
    // If last entry is not today, update it
    const daysDiff = Math.abs((todayDate.getTime() - lastDate.getTime()) / (24 * 60 * 60 * 1000));
    if (daysDiff > 0.5) {
      lastEntry.date = todayDate.toISOString();
    }
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
