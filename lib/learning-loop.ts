import { System, Incident, LearningSuggestion, Signal, StressTest } from '@/types';
import { evaluateSystem } from './scoring';

/**
 * Generate learning suggestions from an incident
 */
export function generateLearningSuggestions(
  system: System,
  incident: Incident
): LearningSuggestion[] {
  const suggestions: LearningSuggestion[] = [];
  
  // Check for missing signals
  if (incident.signalsWereMissing.length > 0) {
    incident.signalsWereMissing.forEach(signalName => {
      suggestions.push({
        id: `suggestion-${Date.now()}-${Math.random()}`,
        type: 'new_signal',
        description: `Add "${signalName}" signal to catch this earlier`,
        reason: `Incident "${incident.symptom}" would have been caught earlier with this signal`,
        newSignal: generateSignalSuggestion(signalName, incident)
      });
    });
  }
  
  // Check for weak signals (threshold updates)
  if (incident.signalsWereTooWeak.length > 0) {
    incident.signalsWereTooWeak.forEach(signalName => {
      const existingSignal = system.signals.find(s => s.name.toLowerCase().includes(signalName.toLowerCase()));
      if (existingSignal) {
        suggestions.push({
          id: `suggestion-${Date.now()}-${Math.random()}`,
          type: 'threshold_update',
          description: `Lower threshold for "${existingSignal.name}"`,
          signalId: existingSignal.id,
          reason: `Incident "${incident.symptom}" would have been caught earlier with a lower threshold`,
          newThreshold: suggestNewThreshold(existingSignal)
        });
      }
    });
  }
  
  // Always suggest a stress test for the failure mode
  if (incident.failureModeId) {
    const failureMode = system.failureModes.find(fm => fm.id === incident.failureModeId);
    if (failureMode) {
      suggestions.push({
        id: `suggestion-${Date.now()}-${Math.random()}`,
        type: 'new_stress_test',
        description: `Add stress test for "${failureMode.name}"`,
        reason: `Test this failure mode proactively to catch it before it happens`,
        newStressTest: generateStressTestSuggestion(failureMode, system)
      });
    }
  }
  
  return suggestions;
}

/**
 * Generate a suggested signal based on incident
 */
function generateSignalSuggestion(name: string, incident: Incident): Partial<Signal> {
  // Infer category from incident
  let category: Signal['category'] = 'business_impact';
  if (incident.rootCauseCategory.toLowerCase().includes('infrastructure') || 
      incident.rootCauseCategory.toLowerCase().includes('operational')) {
    category = 'pipeline_reliability';
  } else if (incident.rootCauseCategory.toLowerCase().includes('product')) {
    category = 'user_sentiment';
  }
  
  return {
    name,
    category,
    measurementType: 'rate',
    currentValue: 0,
    baselineValue: 0,
    thresholdRule: 'TBD - Set based on baseline',
    confidence: 0.7,
    whyThisMatters: `Would have caught: ${incident.symptom}`,
    failureModeTags: [],
    severityWeight: 1.5,
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Suggest a new threshold (lower than current)
 */
function suggestNewThreshold(signal: Signal): string {
  // Parse current threshold and suggest 20-30% lower
  const currentValue = signal.currentValue;
  const baselineValue = signal.baselineValue;
  
  // Calculate a tighter threshold (closer to baseline)
  const deviation = Math.abs(currentValue - baselineValue);
  const suggestedThreshold = baselineValue + (deviation * 0.7);
  
  if (signal.measurementType === 'rate' || signal.measurementType === 'ratio') {
    return `Alert if ${signal.currentValue > signal.baselineValue ? '>' : '<'} ${suggestedThreshold.toFixed(4)}`;
  } else if (signal.measurementType === 'count') {
    return `Alert if > ${Math.floor(suggestedThreshold)}`;
  } else {
    return `Alert if ${signal.currentValue > signal.baselineValue ? '>' : '<'} ${suggestedThreshold.toFixed(2)}`;
  }
}

/**
 * Generate a stress test suggestion
 */
function generateStressTestSuggestion(failureMode: System['failureModes'][0], system: System): Partial<StressTest> {
  return {
    name: `Simulate ${failureMode.name}`,
    description: `Test detection of ${failureMode.name.toLowerCase()} before it occurs`,
    expectedSignalsToFire: failureMode.primarySignalIds,
    passed: false,
    notes: 'New test - needs baseline'
  };
}

/**
 * Apply learning suggestions to a system
 */
export function applyLearningSuggestions(
  system: System,
  suggestions: LearningSuggestion[]
): System {
  let updatedSystem = { ...system };
  
  suggestions.forEach(suggestion => {
    if (suggestion.type === 'new_signal' && suggestion.newSignal) {
      const newSignal: Signal = {
        id: `signal-${Date.now()}-${Math.random()}`,
        ...suggestion.newSignal,
        name: suggestion.newSignal.name || 'New Signal',
        category: suggestion.newSignal.category || 'business_impact',
        measurementType: suggestion.newSignal.measurementType || 'rate',
        currentValue: suggestion.newSignal.currentValue || 0,
        baselineValue: suggestion.newSignal.baselineValue || 0,
        thresholdRule: suggestion.newSignal.thresholdRule || 'TBD',
        confidence: suggestion.newSignal.confidence || 0.7,
        whyThisMatters: suggestion.newSignal.whyThisMatters || '',
        failureModeTags: suggestion.newSignal.failureModeTags || [],
        severityWeight: suggestion.newSignal.severityWeight || 1.5,
        lastUpdated: new Date().toISOString()
      } as Signal;
      
      updatedSystem = {
        ...updatedSystem,
        signals: [...updatedSystem.signals, newSignal]
      };
    } else if (suggestion.type === 'threshold_update' && suggestion.signalId && suggestion.newThreshold) {
      updatedSystem = {
        ...updatedSystem,
        signals: updatedSystem.signals.map(s => 
          s.id === suggestion.signalId
            ? { ...s, thresholdRule: suggestion.newThreshold || s.thresholdRule }
            : s
        )
      };
    } else if (suggestion.type === 'new_stress_test' && suggestion.newStressTest) {
      const newTest: StressTest = {
        id: `stress-${Date.now()}-${Math.random()}`,
        name: suggestion.newStressTest.name || 'New Stress Test',
        description: suggestion.newStressTest.description || '',
        expectedSignalsToFire: suggestion.newStressTest.expectedSignalsToFire || [],
        passed: false,
        notes: suggestion.newStressTest.notes || 'New test'
      };
      
      updatedSystem = {
        ...updatedSystem,
        stressTests: [...updatedSystem.stressTests, newTest]
      };
    }
  });
  
  // Re-evaluate system after applying suggestions
  const evaluation = evaluateSystem(updatedSystem);
  updatedSystem.healthScore = evaluation.healthScore;
  updatedSystem.riskScore = evaluation.riskScore;
  updatedSystem.confidenceScore = evaluation.confidenceScore;
  updatedSystem.lastEvaluation = new Date().toISOString();
  
  return updatedSystem;
}
