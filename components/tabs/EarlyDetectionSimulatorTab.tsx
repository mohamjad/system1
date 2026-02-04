'use client';

import { useState } from 'react';
import { System, Incident } from '@/types';
import { generateTimeline, getEarliestInterventionPoint } from '@/lib/simulator';
import { SignalStatusBadge } from '@/components/SignalStatusBadge';

interface EarlyDetectionSimulatorTabProps {
  system: System;
}

export function EarlyDetectionSimulatorTab({ system }: EarlyDetectionSimulatorTabProps) {
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(
    system.incidents.length > 0 ? system.incidents[0].id : null
  );

  const selectedIncident = selectedIncidentId
    ? system.incidents.find(i => i.id === selectedIncidentId)
    : null;

  const timeline = selectedIncident 
    ? generateTimeline(system, selectedIncident)
    : [];

  const earliestIntervention = getEarliestInterventionPoint(timeline);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    });
  };

  if (system.incidents.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">No incidents logged yet</p>
        <p className="text-sm text-muted-foreground">
          Log an incident to see when signals should have fired
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="p-4 border border-subtle rounded-lg bg-hover mb-6">
        <p className="text-sm text-muted-foreground">
          <strong>Early Detection Simulator:</strong> See when signals should have fired before the incident occurred. 
          This shows the earliest moment intervention was possible, not when alerts fired.
        </p>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Select Incident</label>
        <select
          value={selectedIncidentId || ''}
          onChange={(e) => setSelectedIncidentId(e.target.value)}
          className="w-full px-3 py-2 border border-subtle rounded-lg"
        >
          {system.incidents.map((incident) => (
            <option key={incident.id} value={incident.id}>
              {incident.symptom} - {formatDate(incident.date)}
            </option>
          ))}
        </select>
      </div>

      {selectedIncident && timeline.length > 0 && (
        <>
          <div className="border border-subtle rounded-lg p-6 mb-6">
            <h3 className="font-semibold mb-2">{selectedIncident.symptom}</h3>
            <p className="text-sm text-muted-foreground mb-4">{selectedIncident.impact}</p>
            <p className="text-sm">{selectedIncident.whatWouldHaveCaughtThis}</p>
          </div>

          {earliestIntervention && (
            <div className="p-4 border-2 border-foreground rounded-lg bg-hover mb-6">
              <div className="font-semibold mb-1">Earliest Intervention Possible</div>
              <div className="text-sm text-muted-foreground">
                {earliestIntervention.timeLabel} - {formatDate(earliestIntervention.timestamp)}
              </div>
              <div className="text-sm mt-2">
                {earliestIntervention.signalValues.filter(sv => sv.wouldHaveTriggered).length} signal(s) would have fired at this point
              </div>
            </div>
          )}

          <div className="space-y-6">
            {timeline.map((point, idx) => {
              const triggeredSignals = point.signalValues.filter(sv => sv.wouldHaveTriggered);
              const isFailure = point.timeLabel === 'Failure';
              
              return (
                <div key={idx} className="border border-subtle rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="font-semibold text-lg">{point.timeLabel}</div>
                      <div className="text-sm text-muted-foreground">{formatDate(point.timestamp)}</div>
                    </div>
                    {point.earliestInterventionPossible && (
                      <div className="px-3 py-1 text-xs font-medium border-2 border-foreground rounded">
                        Earliest Intervention
                      </div>
                    )}
                    {isFailure && (
                      <div className="px-3 py-1 text-xs font-medium status-triggered rounded">
                        Incident Occurred
                      </div>
                    )}
                  </div>

                  {triggeredSignals.length > 0 ? (
                    <div className="space-y-3">
                      <div className="text-sm font-medium mb-2">
                        Signals that would have fired ({triggeredSignals.length}):
                      </div>
                      {triggeredSignals.map((sv) => {
                        const signal = system.signals.find(s => s.id === sv.signalId);
                        if (!signal) return null;
                        
                        return (
                          <div key={sv.signalId} className="flex items-center justify-between p-3 border border-subtle rounded">
                            <div className="flex-1">
                              <div className="font-medium">{signal.name}</div>
                              <div className="text-xs text-muted-foreground mt-1">
                                Value: {sv.value.toFixed(4)} (baseline: {signal.baselineValue.toFixed(4)})
                              </div>
                            </div>
                            <SignalStatusBadge status={sv.status} />
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      No signals would have fired at this point
                    </div>
                  )}

                  {point.signalValues.length > triggeredSignals.length && (
                    <div className="mt-4 pt-4 border-t border-subtle">
                      <div className="text-xs text-muted-foreground">
                        {point.signalValues.length - triggeredSignals.length} other signals monitored but within normal range
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-6 p-4 border border-subtle rounded-lg bg-hover">
            <div className="font-medium mb-2">Key Insight</div>
            <div className="text-sm text-muted-foreground">
              {earliestIntervention 
                ? `This incident could have been caught ${earliestIntervention.timeLabel.toLowerCase()} if thresholds were properly configured.`
                : 'Review signal thresholds and add missing signals to catch similar incidents earlier.'}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
