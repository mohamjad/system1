'use client';

import { System } from '@/types';
import { HealthGauge } from '@/components/HealthGauge';
import { evaluateSystem } from '@/lib/scoring';
import { InfoTooltip } from '@/components/InfoTooltip';

interface OverviewTabProps {
  system: System;
  onUpdate: (system: System) => void;
}

export function OverviewTab({ system, onUpdate }: OverviewTabProps) {
  const evaluation = evaluateSystem(system);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
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
                Health Score
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
              Risk Score
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
              Confidence
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

      <div className="border border-subtle rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Recommended Interventions</h2>
        <div className="space-y-2 text-sm">
          {system.riskLevel === 'high' && (
            <div className="p-3 border border-subtle rounded">
              <strong>Immediate:</strong> Review triggered signals and check for active incidents
            </div>
          )}
          {system.confidenceScore < 70 && (
            <div className="p-3 border border-subtle rounded">
              <strong>Coverage:</strong> Add more signals to improve detection coverage
            </div>
          )}
          {system.stressTests.filter(t => !t.passed).length > 0 && (
            <div className="p-3 border border-subtle rounded">
              <strong>Testing:</strong> Review failed stress tests and update signal thresholds
            </div>
          )}
          {system.incidents.length > 0 && (
            <div className="p-3 border border-subtle rounded">
              <strong>Learning:</strong> Review incidents in Learning Loop tab to improve early detection
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
