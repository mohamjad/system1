'use client';

import { System } from '@/types';

interface StressTestsTabProps {
  system: System;
  onUpdate: (system: System) => void;
}

export function StressTestsTab({ system, onUpdate }: StressTestsTabProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div className="p-4 border border-subtle rounded-lg bg-hover mb-6">
        <p className="text-sm text-muted-foreground">
          <strong>Stress testing:</strong> Don't wait for real failures. Simulate problems (schema changes, missing batches, API failures) 
          to verify your signals catch them. If a test fails, your signals aren't catching that failure mode early enough.
        </p>
      </div>

      <div className="border border-subtle rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Stress Test Checklist</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Break the system before it breaks. These tests simulate failure modes to verify signals catch them early.
        </p>
        
        <div className="space-y-4">
          {system.stressTests.map((test) => (
            <div key={test.id} className="border border-subtle rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="font-medium mb-1">{test.name}</div>
                  <div className="text-sm text-muted-foreground">{test.description}</div>
                </div>
                <div className={`px-3 py-1 text-xs font-medium rounded ${
                  test.passed ? 'status-normal' : 'status-triggered'
                }`}>
                  {test.passed ? 'Passed' : 'Failed'}
                </div>
              </div>
              
              <div className="mb-3">
                <div className="text-sm text-muted-foreground mb-2">Expected Signals to Fire</div>
                <div className="flex flex-wrap gap-2">
                  {test.expectedSignalsToFire.map((sid) => {
                    const signal = system.signals.find(s => s.id === sid);
                    return signal ? (
                      <span key={sid} className="px-2 py-1 text-xs border border-subtle rounded">
                        {signal.name}
                      </span>
                    ) : null;
                  })}
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <div className="text-muted-foreground">
                  Last run: {formatDate(test.lastRun)}
                </div>
                {test.notes && (
                  <div className="text-muted-foreground italic">
                    {test.notes}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border border-subtle rounded-lg p-6 bg-hover">
        <h3 className="font-medium mb-2">Suggested Stress Tests</h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div>• Schema change injected</div>
          <div>• Missing batch</div>
          <div>• API rate-limit event</div>
          <div>• Bot traffic spike</div>
          <div>• Payment provider latency</div>
        </div>
      </div>
    </div>
  );
}
