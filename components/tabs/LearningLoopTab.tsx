'use client';

import { useState } from 'react';
import { System, LearningSuggestion } from '@/types';
import { generateLearningSuggestions, applyLearningSuggestions } from '@/lib/learning-loop';

interface LearningLoopTabProps {
  system: System;
  onUpdate: (system: System) => void;
}

export function LearningLoopTab({ system, onUpdate }: LearningLoopTabProps) {
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(
    system.incidents.length > 0 ? system.incidents[0].id : null
  );
  const [suggestions, setSuggestions] = useState<LearningSuggestion[]>([]);
  const [appliedSuggestions, setAppliedSuggestions] = useState<Set<string>>(new Set());

  const selectedIncident = selectedIncidentId
    ? system.incidents.find(i => i.id === selectedIncidentId)
    : null;

  const handleGenerateSuggestions = () => {
    if (!selectedIncident) return;
    const newSuggestions = generateLearningSuggestions(system, selectedIncident);
    setSuggestions(newSuggestions);
    setAppliedSuggestions(new Set());
  };

  const handleApplySuggestion = (suggestionId: string) => {
    const suggestion = suggestions.find(s => s.id === suggestionId);
    if (!suggestion) return;

    const updated = applyLearningSuggestions(system, [suggestion]);
    onUpdate(updated);
    setAppliedSuggestions(new Set([...appliedSuggestions, suggestionId]));
  };

  const handleApplyAll = () => {
    const toApply = suggestions.filter(s => !appliedSuggestions.has(s.id));
    if (toApply.length === 0) return;

    const updated = applyLearningSuggestions(system, toApply);
    onUpdate(updated);
    setAppliedSuggestions(new Set(suggestions.map(s => s.id)));
  };

  const formatDate = (dateString: string) => {
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
          <strong>This is the differentiator:</strong> When something breaks, don't just fix it and move on. 
          The framework analyzes what happened and suggests new signals, threshold adjustments, or stress tests that would have caught it earlier. 
          Apply suggestions to improve detection over time.
        </p>
      </div>

      <div className="border border-subtle rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Incident → Lessons</h2>
        <p className="text-sm text-muted-foreground mb-6">
          When an incident occurs, the framework learns. Select an incident to see what signals, thresholds, or tests would have caught it earlier.
        </p>

        {system.incidents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No incidents logged yet. Log an incident to see learning suggestions.
          </div>
        ) : (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Select Incident</label>
              <select
                value={selectedIncidentId || ''}
                onChange={(e) => {
                  setSelectedIncidentId(e.target.value);
                  setSuggestions([]);
                  setAppliedSuggestions(new Set());
                }}
                className="w-full px-3 py-2 border border-subtle rounded-lg"
              >
                {system.incidents.map((incident) => (
                  <option key={incident.id} value={incident.id}>
                    {incident.symptom} - {formatDate(incident.date)}
                  </option>
                ))}
              </select>
            </div>

            {selectedIncident && (
              <div className="border border-subtle rounded-lg p-4 mb-4">
                <div className="font-medium mb-2">{selectedIncident.symptom}</div>
                <div className="text-sm text-muted-foreground mb-2">
                  {formatDate(selectedIncident.date)} • {selectedIncident.rootCauseCategory}
                </div>
                <div className="text-sm">{selectedIncident.whatWouldHaveCaughtThis}</div>
              </div>
            )}

            <button
              onClick={handleGenerateSuggestions}
              className="px-4 py-2 bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity"
            >
              Generate Learning Suggestions
            </button>
          </>
        )}
      </div>

      {suggestions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Suggested Improvements</h3>
            {suggestions.some(s => !appliedSuggestions.has(s.id)) && (
              <button
                onClick={handleApplyAll}
                className="px-4 py-2 border border-subtle rounded-lg hover-subtle transition-colors text-sm font-medium"
              >
                Apply All Suggestions
              </button>
            )}
          </div>

          {suggestions.map((suggestion) => {
            const isApplied = appliedSuggestions.has(suggestion.id);
            const typeLabels = {
              new_signal: 'New Signal',
              threshold_update: 'Threshold Update',
              new_stress_test: 'New Stress Test'
            };

            return (
              <div
                key={suggestion.id}
                className={`border rounded-lg p-6 ${
                  isApplied ? 'border-subtle bg-hover' : 'border-subtle'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 text-xs border border-subtle rounded">
                        {typeLabels[suggestion.type]}
                      </span>
                      {isApplied && (
                        <span className="px-2 py-1 text-xs status-normal rounded">
                          Applied
                        </span>
                      )}
                    </div>
                    <div className="font-medium mb-1">{suggestion.description}</div>
                    <div className="text-sm text-muted-foreground">{suggestion.reason}</div>
                  </div>
                  {!isApplied && (
                    <button
                      onClick={() => handleApplySuggestion(suggestion.id)}
                      className="px-4 py-2 border border-subtle rounded-lg hover-subtle transition-colors text-sm font-medium ml-4"
                    >
                      Apply
                    </button>
                  )}
                </div>

                {suggestion.type === 'new_signal' && suggestion.newSignal && (
                  <div className="mt-4 pt-4 border-t border-subtle text-sm">
                    <div className="text-muted-foreground mb-2">New Signal Details</div>
                    <div className="space-y-1">
                      <div><strong>Name:</strong> {suggestion.newSignal.name}</div>
                      <div><strong>Category:</strong> {suggestion.newSignal.category}</div>
                      <div><strong>Why:</strong> {suggestion.newSignal.whyThisMatters}</div>
                    </div>
                  </div>
                )}

                {suggestion.type === 'threshold_update' && suggestion.signalId && (
                  <div className="mt-4 pt-4 border-t border-subtle text-sm">
                    <div className="text-muted-foreground mb-2">Updated Threshold</div>
                    <div className="font-mono">{suggestion.newThreshold}</div>
                  </div>
                )}

                {suggestion.type === 'new_stress_test' && suggestion.newStressTest && (
                  <div className="mt-4 pt-4 border-t border-subtle text-sm">
                    <div className="text-muted-foreground mb-2">New Stress Test</div>
                    <div><strong>Name:</strong> {suggestion.newStressTest.name}</div>
                    <div><strong>Description:</strong> {suggestion.newStressTest.description}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {suggestions.length === 0 && selectedIncident && (
        <div className="border border-subtle rounded-lg p-8 text-center text-muted-foreground">
          Click "Generate Learning Suggestions" to see improvements based on this incident
        </div>
      )}
    </div>
  );
}
