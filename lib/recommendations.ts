import { System, DecisionRecommendation } from '@/types';
import { evaluateSystem } from './scoring';
import { getWeakCoverageModes } from './coverage';
import { getSignalStatus } from './scoring';

/**
 * Generate decision recommendations for a system
 */
export function generateRecommendations(system: System): DecisionRecommendation[] {
  const recommendations: DecisionRecommendation[] = [];
  const evaluation = evaluateSystem(system);
  
  // High-risk recommendations
  if (system.riskLevel === 'high') {
    const topSignal = evaluation.topContributingSignals[0];
    if (topSignal) {
      const signal = system.signals.find(s => s.id === topSignal.signalId);
      if (signal) {
        recommendations.push({
          id: `rec-${Date.now()}-1`,
          priority: 'high',
          action: `Investigate ${signal.name} - it's contributing ${Math.round(topSignal.contribution)} risk points`,
          reason: 'This signal is driving high risk in the system',
          relatedSignalId: signal.id
        });
      }
    }
  }
  
  // Weak coverage recommendations
  const weakCoverageModes = getWeakCoverageModes(system);
  weakCoverageModes.forEach((mode, idx) => {
    const fm = system.failureModes.find(f => f.id === mode.failureModeId);
    if (fm) {
      recommendations.push({
        id: `rec-${Date.now()}-${idx + 2}`,
        priority: 'high',
        action: `Add leading indicators for ${fm.name}`,
        reason: `High-severity failure mode has only ${mode.signalCount} signal(s) with ${Math.round(mode.coverageScore)}% coverage`,
        relatedFailureModeId: fm.id
      });
    }
  });
  
  // Low confidence recommendations
  if (system.confidenceScore < 70) {
    recommendations.push({
      id: `rec-${Date.now()}-conf`,
      priority: 'medium',
      action: 'Add more signals to improve evaluation confidence',
      reason: `Confidence is ${Math.round(system.confidenceScore)}% - need better signal coverage`
    });
  }
  
  // Failed stress tests
  const failedTests = system.stressTests.filter(t => !t.passed);
  failedTests.forEach((test, idx) => {
    recommendations.push({
      id: `rec-${Date.now()}-test-${idx}`,
      priority: 'medium',
      action: `Fix stress test: ${test.name}`,
      reason: test.notes || 'Stress test failed - signals did not catch simulated failure',
      relatedSignalId: test.expectedSignalsToFire[0]
    });
  });
  
  // Recent incidents with learning opportunities
  const recentIncidents = system.incidents
    .filter(inc => {
      const daysAgo = (Date.now() - new Date(inc.date).getTime()) / (1000 * 60 * 60 * 24);
      return daysAgo < 30;
    })
    .slice(0, 2);
  
  recentIncidents.forEach((incident, idx) => {
    if (incident.signalsWereMissing.length > 0 || incident.signalsWereTooWeak.length > 0) {
      recommendations.push({
        id: `rec-${Date.now()}-inc-${idx}`,
        priority: 'medium',
        action: 'Review Learning Loop suggestions from recent incident',
        reason: `Incident "${incident.symptom}" revealed gaps in detection`,
        relatedIncidentId: incident.id
      });
    }
  });
  
  // Watch signals that need attention
  const watchSignals = system.signals.filter(s => {
    const status = getSignalStatus(s);
    return status === 'watch';
  });
  
  if (watchSignals.length > 0) {
    recommendations.push({
      id: `rec-${Date.now()}-watch`,
      priority: 'low',
      action: `Monitor ${watchSignals.length} signal(s) in watch state`,
      reason: 'These signals are showing early warning signs'
    });
  }
  
  return recommendations.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}
