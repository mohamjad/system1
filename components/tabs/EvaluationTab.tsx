'use client';

import { System } from '@/types';
import { evaluateSystem } from '@/lib/scoring';

interface EvaluationTabProps {
  system: System;
}

export function EvaluationTab({ system }: EvaluationTabProps) {
  const evaluation = evaluateSystem(system);

  return (
    <div className="space-y-8">
      <div className="p-4 border border-subtle rounded-lg bg-hover mb-6">
        <p className="text-sm text-muted-foreground">
          <strong>How evaluation works:</strong> The framework calculates health by analyzing signal deviations from baseline, 
          weighting by severity and confidence. Failure modes show which problems are likely based on triggered signals.
        </p>
      </div>

      <div className="border border-subtle rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Evaluation Explanation</h2>
        <p className="text-muted-foreground">{evaluation.explanation}</p>
      </div>

      <div className="border border-subtle rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Top Contributing Signals</h2>
        <div className="space-y-3">
          {evaluation.topContributingSignals.map((ts) => {
            const signal = system.signals.find(s => s.id === ts.signalId);
            if (!signal) return null;
            
            const deviation = Math.abs(signal.currentValue - signal.baselineValue) / Math.max(Math.abs(signal.baselineValue), 0.001);
            const deviationPercent = Math.round(deviation * 100);
            
            return (
              <div key={ts.signalId} className="flex items-start justify-between py-3 border-b border-subtle last:border-0">
                <div className="flex-1">
                  <div className="font-medium">{signal.name}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {deviationPercent}% deviation from baseline
                  </div>
                </div>
                <div className="text-right ml-4">
                  <div className="font-semibold">{Math.round(ts.contribution)}</div>
                  <div className="text-xs text-muted-foreground">Risk</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="border border-subtle rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Failure Modes</h2>
        <div className="space-y-4">
          {system.failureModes.map((fm) => {
            const modeRisk = evaluation.activeFailureModes.find(am => am.failureModeId === fm.id);
            const riskScore = modeRisk?.riskScore || 0;
            
            return (
              <div key={fm.id} className="border border-subtle rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-medium">{fm.name}</div>
                    <div className="text-sm text-muted-foreground mt-1">{fm.leadTime} lead time</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Severity</div>
                    <div className="font-semibold">{fm.severity}/5</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Detectability: </span>
                    <span>{fm.detectability}/5</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Risk Score: </span>
                    <span className="font-medium">{Math.round(riskScore)}</span>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-2">Primary Signals</div>
                  <div className="flex flex-wrap gap-2">
                    {fm.primarySignalIds.map((sid) => {
                      const signal = system.signals.find(s => s.id === sid);
                      return signal ? (
                        <span key={sid} className="px-2 py-1 text-xs border border-subtle rounded">
                          {signal.name}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-subtle">
                  <div className="text-sm text-muted-foreground mb-2">Mitigation Playbook</div>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {fm.mitigationPlaybook.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="border border-subtle rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Coverage Map</h2>
        <div className="space-y-3">
          {system.failureModes
            .filter(fm => fm.severity >= 4)
            .map((fm) => {
              const coveredSignals = fm.primarySignalIds.filter(sid =>
                system.signals.some(s => s.id === sid)
              );
              const coverage = (coveredSignals.length / fm.primarySignalIds.length) * 100;
              
              return (
                <div key={fm.id} className="flex items-center justify-between py-2 border-b border-subtle last:border-0">
                  <div>
                    <div className="font-medium">{fm.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {coveredSignals.length} of {fm.primarySignalIds.length} signals covered
                    </div>
                  </div>
                  <div className={`text-sm font-medium ${coverage >= 80 ? 'risk-low' : coverage >= 50 ? 'risk-medium' : 'risk-high'}`}>
                    {Math.round(coverage)}%
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
