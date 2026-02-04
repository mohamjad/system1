import { System, Incident, Signal, TimelinePoint, HistoricalSignalValue } from '@/types';
import { getSignalStatus, calculateSignalRisk } from './scoring';

/**
 * Generate historical signal values leading up to an incident
 */
export function generateHistoricalSignalValues(
  system: System,
  incident: Incident,
  daysBefore: number = 7
): HistoricalSignalValue[] {
  const incidentDate = new Date(incident.date);
  const historicalValues: HistoricalSignalValue[] = [];
  
  // Get signals related to the incident's failure mode
  const failureMode = incident.failureModeId 
    ? system.failureModes.find(fm => fm.id === incident.failureModeId)
    : null;
  
  const relevantSignalIds = failureMode 
    ? failureMode.primarySignalIds 
    : system.signals.map(s => s.id);
  
  // Generate values for each day leading up to the incident
  for (let day = daysBefore; day >= 0; day--) {
    const timestamp = new Date(incidentDate);
    timestamp.setDate(timestamp.getDate() - day);
    
    relevantSignalIds.forEach(signalId => {
      const signal = system.signals.find(s => s.id === signalId);
      if (!signal) return;
      
      // Calculate value at this point in time
      // Start at baseline, gradually move toward current value
      const progress = day === 0 ? 1 : (daysBefore - day) / daysBefore;
      const value = signal.baselineValue + (signal.currentValue - signal.baselineValue) * progress;
      
      // Create a temporary signal with this historical value
      const historicalSignal: Signal = {
        ...signal,
        currentValue: value
      };
      
      const status = getSignalStatus(historicalSignal);
      
      historicalValues.push({
        signalId,
        timestamp: timestamp.toISOString(),
        value,
        status
      });
    });
  }
  
  return historicalValues;
}

/**
 * Generate timeline points for the simulator
 */
export function generateTimeline(
  system: System,
  incident: Incident
): TimelinePoint[] {
  const incidentDate = new Date(incident.date);
  const timelinePoints: TimelinePoint[] = [];
  
  // Define time points
  const timePoints = [
    { label: 'T-7 days', days: 7 },
    { label: 'T-3 days', days: 3 },
    { label: 'T-1 day', days: 1 },
    { label: 'Failure', days: 0 }
  ];
  
  const historicalValues = generateHistoricalSignalValues(system, incident, 7);
  
  // Find earliest intervention point
  let earliestInterventionFound = false;
  
  timePoints.forEach(({ label, days }) => {
    const timestamp = new Date(incidentDate);
    timestamp.setDate(timestamp.getDate() - days);
    
    const signalValues = system.signals.map(signal => {
      // Find historical value closest to this timestamp
      const relevantValues = historicalValues.filter(
        hv => hv.signalId === signal.id && 
        Math.abs(new Date(hv.timestamp).getTime() - timestamp.getTime()) < 24 * 60 * 60 * 1000
      );
      
      const historicalValue = relevantValues.length > 0 
        ? relevantValues[0]
        : null;
      
      if (!historicalValue) {
        return {
          signalId: signal.id,
          value: signal.baselineValue,
          status: 'normal' as const,
          wouldHaveTriggered: false
        };
      }
      
      // Check if this would have triggered
      const tempSignal: Signal = {
        ...signal,
        currentValue: historicalValue.value
      };
      const status = getSignalStatus(tempSignal);
      const wouldHaveTriggered = status === 'triggered' || status === 'watch';
      
      // Mark earliest intervention if this is the first triggered signal
      if (wouldHaveTriggered && !earliestInterventionFound && days > 0) {
        earliestInterventionFound = true;
      }
      
      return {
        signalId: signal.id,
        value: historicalValue.value,
        status: historicalValue.status,
        wouldHaveTriggered
      };
    });
    
    timelinePoints.push({
      timeLabel: label,
      timestamp: timestamp.toISOString(),
      signalValues,
      earliestInterventionPossible: earliestInterventionFound && days > 0 && 
        timelinePoints.length === 0 // First point where intervention was possible
    });
  });
  
  return timelinePoints;
}

/**
 * Get earliest intervention point
 */
export function getEarliestInterventionPoint(
  timeline: TimelinePoint[]
): TimelinePoint | null {
  return timeline.find(tp => tp.earliestInterventionPossible) || null;
}
