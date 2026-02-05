'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { System, LearningSuggestion } from '@/types';
import { HealthGauge } from '@/components/HealthGauge';
import { evaluateSystem, getSignalStatus } from '@/lib/scoring';
import { InfoTooltip } from '@/components/InfoTooltip';
import { ConfidenceDecomposition } from '@/components/ConfidenceDecomposition';
import { DecisionRecommendations } from '@/components/DecisionRecommendations';
import { SignalStatusBadge } from '@/components/SignalStatusBadge';
import { ReportIssue } from '@/components/ReportIssue';
import { generateLearningSuggestions } from '@/lib/learning-loop';
import { getWeakCoverageModes } from '@/lib/coverage';
import { generateRecommendations } from '@/lib/recommendations';

interface OverviewTabProps {
  system: System;
  onUpdate: (system: System) => void;
}

export function OverviewTab({ system, onUpdate }: OverviewTabProps) {
  const evaluation = evaluateSystem(system);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const daysAgo = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (daysAgo === 0) return 'Today';
    if (daysAgo === 1) return 'Yesterday';
    if (daysAgo < 7) return `${daysAgo}d ago`;
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const riskColor = {
    low: 'risk-low',
    medium: 'risk-medium',
    high: 'risk-high'
  }[system.riskLevel];

  // Get triggered signals for this system
  const triggeredSignals = useMemo(() => {
    return (system.signals || []).filter(s => {
      try {
        return getSignalStatus(s) === 'triggered';
      } catch {
        return false;
      }
    });
  }, [system]);

  // Get recent incidents
  const recentIncidents = useMemo(() => {
    return (system.incidents || [])
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [system]);

  // Get learning suggestions
  const learningSuggestions = useMemo(() => {
    const suggestions: LearningSuggestion[] = [];
    (system.incidents || []).forEach(incident => {
      try {
        if (incident.signalsWereMissing?.length > 0 || incident.signalsWereTooWeak?.length > 0 || incident.failureModeId) {
          const incidentSuggestions = generateLearningSuggestions(system, incident);
          suggestions.push(...incidentSuggestions);
        }
      } catch (e) {
        console.error('Error generating suggestions:', e);
      }
    });
    return suggestions.slice(0, 5);
  }, [system]);

  // Get alerts and action items
  const alerts = useMemo(() => {
    const alertList: Array<{
      type: 'critical_signal' | 'coverage_gap' | 'failed_test' | 'recommendation' | 'incident';
      priority: 'high' | 'medium' | 'low';
      title: string;
      description: string;
    }> = [];

    // Critical signals
    triggeredSignals.forEach(signal => {
      alertList.push({
        type: 'critical_signal',
        priority: 'high',
        title: `${signal.name} is triggered`,
        description: `${signal.currentValue.toFixed(2)} vs baseline ${signal.baselineValue.toFixed(2)}`,
      });
    });

    // Coverage gaps
    const weakModes = getWeakCoverageModes(system);
    weakModes.forEach(mode => {
      const fm = system.failureModes.find(f => f.id === mode.failureModeId);
      if (fm) {
        alertList.push({
          type: 'coverage_gap',
          priority: fm.severity >= 4 ? 'high' : 'medium',
          title: `Weak coverage: ${fm.name}`,
          description: `Only ${mode.signalCount} signal(s), ${Math.round(mode.coverageScore)}% coverage`,
        });
      }
    });

    // Failed stress tests
    (system.stressTests || []).forEach(test => {
      if (!test.passed) {
        alertList.push({
          type: 'failed_test',
          priority: 'high',
          title: `Failed: ${test.name}`,
          description: test.description || 'Stress test failed',
        });
      }
    });

    // High-priority recommendations
    const recommendations = generateRecommendations(system);
    recommendations.filter(r => r.priority === 'high').forEach(rec => {
      alertList.push({
        type: 'recommendation',
        priority: 'high',
        title: rec.action,
        description: rec.reason,
      });
    });

    // Recent incidents
    recentIncidents.slice(0, 3).forEach(incident => {
      alertList.push({
        type: 'incident',
        priority: 'medium',
        title: incident.symptom,
        description: incident.impact,
      });
    });

    return alertList.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }, [system, triggeredSignals, recentIncidents]);

  return (
    <div className="space-y-8">
      <div className="mb-6 p-4 border border-subtle rounded-lg bg-hover">
        <p className="text-sm text-muted-foreground">
          <strong>What you're seeing:</strong> This overview shows your system's current health based on leading indicators. 
          The health score combines all signal risks, while confidence shows how well your signals cover potential failure modes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border border-subtle rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-muted-foreground">
              <InfoTooltip content="Overall system health (0-100). Higher is better. Calculated by subtracting risk from 100.">
                System Health
              </InfoTooltip>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <HealthGauge score={system.healthScore} />
          </div>
        </div>
        
        <div className="border border-subtle rounded-lg p-6">
          <div className="text-sm text-muted-foreground mb-2">
            <InfoTooltip content="Current risk level based on triggered signals and active failure modes.">
              Failure Risk
            </InfoTooltip>
          </div>
          <div className={`text-4xl font-bold mb-2 ${riskColor}`}>
            {Math.round(system.riskScore)}
          </div>
          <div className="text-sm text-muted-foreground capitalize">
            {system.riskLevel} Risk
          </div>
        </div>
        
        <div className="border border-subtle rounded-lg p-6">
          <div className="text-sm text-muted-foreground mb-2">
            <InfoTooltip content="How confident we are in this evaluation. Based on signal coverage, data recency, and failure mode coverage.">
              Evaluation Confidence
            </InfoTooltip>
          </div>
          <div className="text-4xl font-bold mb-2">
            {Math.round(system.confidenceScore)}
          </div>
          <div className="text-sm text-muted-foreground">
            Signal Coverage
          </div>
        </div>
      </div>

      <div className="border border-subtle rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">What Changed Since Last Week</h2>
        <p className="text-muted-foreground">{evaluation.explanation}</p>
      </div>

      <div className="border border-subtle rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Top 3 Risks</h2>
        <div className="space-y-3">
          {evaluation.topContributingSignals.slice(0, 3).map((ts, idx) => {
            const signal = system.signals.find(s => s.id === ts.signalId);
            if (!signal) return null;
            
            return (
              <div key={ts.signalId} className="flex items-start justify-between py-2 border-b border-subtle last:border-0">
                <div>
                  <div className="font-medium">{signal.name}</div>
                  <div className="text-sm text-muted-foreground">{signal.whyThisMatters}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{Math.round(ts.contribution)}</div>
                  <div className="text-xs text-muted-foreground">Risk</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Alerts & Action Items */}
      {alerts.length > 0 && (
        <div className="border border-subtle rounded-lg p-6 border-l-4 border-l-red-500 bg-red-500/5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Alerts & Action Items</h2>
            <span className="px-3 py-1 bg-red-500/10 text-red-500 rounded-full text-sm font-medium">
              {alerts.length} Issue{alerts.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {alerts.map((alert, idx) => {
              const priorityColors = {
                high: 'border-red-500/50 bg-red-500/10',
                medium: 'border-yellow-500/50 bg-yellow-500/10',
                low: 'border-blue-500/50 bg-blue-500/10',
              };
              const priorityLabels = {
                high: 'High',
                medium: 'Medium',
                low: 'Low',
              };

              return (
                <div
                  key={idx}
                  className={`p-3 border rounded-lg ${priorityColors[alert.priority]}`}
                >
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{alert.title}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded ${
                          alert.priority === 'high' ? 'bg-red-500/20 text-red-600' :
                          alert.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-600' :
                          'bg-blue-500/20 text-blue-600'
                        }`}>
                          {priorityLabels[alert.priority]}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">{alert.description}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Critical Signals */}
      {triggeredSignals.length > 0 && (
        <div className="border border-subtle rounded-lg p-6 border-l-4 border-l-red-500">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Critical Signals</h2>
            <ReportIssue systems={[system]} />
          </div>
          <div className="space-y-3">
            {triggeredSignals.slice(0, 5).map((signal) => (
              <div
                key={signal.id}
                className="flex items-center gap-3 p-3 border border-subtle rounded-lg hover-subtle transition-colors"
              >
                <div className="flex-1 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{signal.name}</span>
                      <SignalStatusBadge status="triggered" />
                    </div>
                    <div className="text-sm text-muted-foreground">{signal.whyThisMatters}</div>
                  </div>
                  <div className="text-right text-sm">
                    <div className="font-medium">{signal.currentValue.toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground">vs {signal.baselineValue.toFixed(2)}</div>
                  </div>
                </div>
                <ReportIssue systems={[system]} signalId={signal.id} systemId={system.id} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Incidents */}
      {recentIncidents.length > 0 && (
        <div className="border border-subtle rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Incidents</h2>
            <ReportIssue systems={[system]} />
          </div>
          <div className="space-y-3">
            {recentIncidents.map((incident) => (
              <div
                key={incident.id}
                className="flex items-center gap-3 p-3 border border-subtle rounded-lg hover-subtle transition-colors"
              >
                <div className="flex-1 flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-medium mb-1">{incident.symptom}</div>
                    <div className="text-xs text-muted-foreground">{incident.impact}</div>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    {formatDate(incident.date)}
                  </div>
                </div>
                <ReportIssue systems={[system]} incidentId={incident.id} systemId={system.id} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Learning Suggestions */}
      {learningSuggestions.length > 0 && (
        <div className="border border-subtle rounded-lg p-6 border-l-4 border-l-blue-500">
          <h2 className="text-lg font-semibold mb-4">Learning Suggestions</h2>
          <div className="space-y-3">
            {learningSuggestions.map((suggestion, idx) => {
              const typeLabels: Record<LearningSuggestion['type'], string> = {
                new_signal: 'New Signal',
                threshold_update: 'Threshold Update',
                new_stress_test: 'New Stress Test'
              };
              
              const suggestionType: LearningSuggestion['type'] = suggestion.type;
              const typeLabel = typeLabels[suggestionType];
              
              return (
                <div
                  key={suggestion.id || idx}
                  className="block p-3 border border-subtle rounded-lg hover-subtle transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-1 text-xs border border-subtle rounded">
                          {typeLabel}
                        </span>
                      </div>
                      <div className="font-medium mb-1">{suggestion.description}</div>
                      <div className="text-xs text-muted-foreground">{suggestion.reason}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ConfidenceDecomposition system={system} />
        <DecisionRecommendations system={system} />
      </div>
    </div>
  );
}
