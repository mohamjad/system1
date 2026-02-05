'use client';

import Link from 'next/link';
import { System } from '@/types';
import { getTopContributingSignals } from '@/lib/scoring';
import { getSignalStatus } from '@/lib/scoring';

interface SystemCardProps {
  system: System;
}

function getPrimaryDriver(system: System): string {
  const topSignals = getTopContributingSignals(system.signals, 1);
  if (topSignals.length === 0 || topSignals[0].contribution === 0) {
    return 'All signals within normal ranges';
  }
  
  const signal = system.signals.find(s => s.id === topSignals[0].signalId);
  if (!signal) return 'No active issues';
  
  // Convert signal name to plain language
  return signal.name;
}

function getInterpretation(system: System, primaryDriver: string): string {
  const topSignals = getTopContributingSignals(system.signals, 1);
  if (topSignals.length === 0 || topSignals[0].contribution === 0) {
    return 'System is operating normally';
  }
  
  const signal = system.signals.find(s => s.id === topSignals[0].signalId);
  if (!signal) return 'No significant issues detected';
  
  const status = getSignalStatus(signal);
  const healthScore = system.healthScore;
  
  if (healthScore < 50) {
    return 'Critical issues detected. Immediate attention required.';
  } else if (healthScore < 70) {
    if (status === 'triggered') {
      return 'Quality is degrading before eval failures appear';
    }
    return 'Performance trending downward. Monitor closely.';
  } else if (healthScore < 85) {
    return 'Minor deviations detected. System stable but watch for trends.';
  } else {
    return 'System operating within expected parameters';
  }
}

export function SystemCard({ system }: SystemCardProps) {
  const primaryDriver = getPrimaryDriver(system);
  const interpretation = getInterpretation(system, primaryDriver);
  
  const healthColor = system.healthScore >= 70 
    ? 'text-green-600' 
    : system.healthScore >= 50 
    ? 'text-yellow-600' 
    : 'text-red-600';

  return (
    <Link href={`/systems/${system.id}`}>
      <div className="border border-subtle rounded-lg p-6 hover-subtle transition-colors cursor-pointer">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-semibold mb-3">{system.name}</h3>
            <div className={`text-4xl font-bold mb-4 ${healthColor}`}>
              {Math.round(system.healthScore)}
            </div>
          </div>
        </div>
        
        <div className="space-y-3 mb-4">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Primary issue</div>
            <div className="text-sm font-medium">{primaryDriver}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">What this means</div>
            <div className="text-sm text-muted-foreground">{interpretation}</div>
          </div>
        </div>
        
        <div className="pt-4 border-t border-subtle">
          <div className="text-sm font-medium text-muted-foreground">
            View system →
          </div>
        </div>
      </div>
    </Link>
  );
}
