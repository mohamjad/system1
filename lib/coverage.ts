import { System, CoverageStrength } from '@/types';
import { getSignalStatus } from './scoring';

/**
 * Calculate coverage strength for a failure mode-signal pair
 */
export function calculateCoverageStrength(
  system: System,
  failureModeId: string,
  signalId: string
): CoverageStrength {
  const failureMode = system.failureModes.find(fm => fm.id === failureModeId);
  const signal = system.signals.find(s => s.id === signalId);
  
  if (!failureMode || !signal) {
    return {
      failureModeId,
      signalId,
      strength: 'none',
      reason: 'Signal or failure mode not found'
    };
  }
  
  // Check if signal is in primary signals
  const isPrimary = failureMode.primarySignalIds.includes(signalId);
  
  if (!isPrimary) {
    return {
      failureModeId,
      signalId,
      strength: 'none',
      reason: 'Signal not mapped to this failure mode'
    };
  }
  
  // Check signal status
  const status = getSignalStatus(signal);
  
  // Calculate strength based on:
  // - Signal status (triggered = strong, watch = partial, normal = weak)
  // - Signal confidence
  // - Failure mode detectability
  
  let strength: 'strong' | 'partial' | 'weak' = 'weak';
  let reason = '';
  
  if (status === 'triggered') {
    strength = 'strong';
    reason = 'Signal is currently triggered';
  } else if (status === 'watch') {
    strength = 'partial';
    reason = 'Signal is in watch state';
  } else {
    strength = signal.confidence > 0.8 && failureMode.detectability >= 4
      ? 'partial'
      : 'weak';
    reason = strength === 'partial' 
      ? 'Signal has high confidence and failure mode is detectable'
      : 'Signal is normal and may not catch this failure mode early';
  }
  
  return {
    failureModeId,
    signalId,
    strength,
    reason
  };
}

/**
 * Get all coverage strengths for a system
 */
export function getAllCoverageStrengths(system: System): CoverageStrength[] {
  const strengths: CoverageStrength[] = [];
  
  system.failureModes.forEach(fm => {
    system.signals.forEach(signal => {
      strengths.push(calculateCoverageStrength(system, fm.id, signal.id));
    });
  });
  
  return strengths;
}

/**
 * Get high-severity failure modes with weak coverage
 */
export function getWeakCoverageModes(system: System): Array<{
  failureModeId: string;
  coverageScore: number;
  signalCount: number;
}> {
  const highSeverityModes = system.failureModes.filter(fm => fm.severity >= 4);
  
  return highSeverityModes.map(fm => {
    const primarySignals = system.signals.filter(s => 
      fm.primarySignalIds.includes(s.id)
    );
    
    const strongSignals = primarySignals.filter(s => {
      const status = getSignalStatus(s);
      return status === 'triggered' || (status === 'watch' && s.confidence > 0.8);
    });
    
    const coverageScore = primarySignals.length > 0
      ? (strongSignals.length / primarySignals.length) * 100
      : 0;
    
    return {
      failureModeId: fm.id,
      coverageScore,
      signalCount: primarySignals.length
    };
  }).filter(mode => mode.coverageScore < 50 || mode.signalCount === 0);
}
