'use client';

import { System } from '@/types';
import { calculateConfidenceScore } from '@/lib/scoring';

interface ConfidenceDecompositionProps {
  system: System;
}

export function ConfidenceDecomposition({ system }: ConfidenceDecompositionProps) {
  const { signals, failureModes, lastEvaluation } = system;
  
  // Calculate components
  const signalCount = signals.length;
  const signalCoverage = Math.min(signalCount / 15, 1.0) * 100;
  
  const now = new Date();
  const lastEval = new Date(lastEvaluation);
  const hoursSinceEval = (now.getTime() - lastEval.getTime()) / (1000 * 60 * 60);
  const recencyScore = Math.max(0, 1 - hoursSinceEval / 168) * 100;
  
  const highSeverityModes = failureModes.filter(fm => fm.severity >= 4);
  const coveredHighSeverityModes = highSeverityModes.filter(fm => 
    fm.primarySignalIds.some(sid => signals.some(s => s.id === sid))
  );
  const coverageScore = highSeverityModes.length > 0
    ? (coveredHighSeverityModes.length / highSeverityModes.length) * 100
    : 100;
  
  const confidence = calculateConfidenceScore(system);
  
  const getBarColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };
  
  const getExplanation = () => {
    if (confidence >= 80) {
      return 'Evaluation confidence is high. Signals provide good coverage and data is recent.';
    }
    if (confidence >= 60) {
      if (signalCoverage < 70) {
        return 'Confidence is moderate. Add more signals to improve coverage.';
      }
      if (recencyScore < 70) {
        return 'Confidence is moderate. Data is getting stale - refresh signal values.';
      }
      return 'Confidence is moderate. Some high-severity failure modes need better signal coverage.';
    }
    if (signalCoverage < 50) {
      return 'Confidence is low because signal coverage is insufficient. Add more signals.';
    }
    if (coverageScore < 50) {
      return 'Confidence is low because high-severity failure modes have weak or no leading indicators.';
    }
    return 'Confidence is low. Review signal coverage and data freshness.';
  };
  
  return (
    <div className="border border-subtle rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Evaluation Confidence</h3>
        <div className="text-2xl font-bold">{Math.round(confidence)}</div>
      </div>
      
      <p className="text-sm text-muted-foreground mb-6">{getExplanation()}</p>
      
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium">Signal Coverage</div>
            <div className="text-sm text-muted-foreground">{Math.round(signalCoverage)}%</div>
          </div>
          <div className="h-2 bg-hover rounded-full overflow-hidden">
            <div
              className={`h-full ${getBarColor(signalCoverage)} transition-all`}
              style={{ width: `${signalCoverage}%` }}
            />
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {signalCount} signals (target: 15+)
          </div>
        </div>
        
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium">Data Recency</div>
            <div className="text-sm text-muted-foreground">{Math.round(recencyScore)}%</div>
          </div>
          <div className="h-2 bg-hover rounded-full overflow-hidden">
            <div
              className={`h-full ${getBarColor(recencyScore)} transition-all`}
              style={{ width: `${recencyScore}%` }}
            />
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {Math.round(hoursSinceEval)} hours since last evaluation
          </div>
        </div>
        
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium">Failure Mode Coverage</div>
            <div className="text-sm text-muted-foreground">{Math.round(coverageScore)}%</div>
          </div>
          <div className="h-2 bg-hover rounded-full overflow-hidden">
            <div
              className={`h-full ${getBarColor(coverageScore)} transition-all`}
              style={{ width: `${coverageScore}%` }}
            />
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {coveredHighSeverityModes.length} of {highSeverityModes.length} high-severity modes covered
          </div>
        </div>
      </div>
    </div>
  );
}
