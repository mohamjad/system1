'use client';

import { useState } from 'react';
import { System, Incident } from '@/types';
import { reevaluateSystem } from '@/lib/scoring';

interface IncidentsTabProps {
  system: System;
  onUpdate: (system: System) => void;
}

export function IncidentsTab({ system, onUpdate }: IncidentsTabProps) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    symptom: '',
    rootCauseCategory: '',
    impact: '',
    whatWouldHaveCaughtThis: '',
    failureModeId: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newIncident: Incident = {
      id: `inc-${Date.now()}`,
      date: new Date().toISOString(),
      symptom: formData.symptom,
      rootCauseCategory: formData.rootCauseCategory,
      impact: formData.impact,
      whatWouldHaveCaughtThis: formData.whatWouldHaveCaughtThis,
      failureModeId: formData.failureModeId || undefined,
      signalsWereMissing: [],
      signalsWereTooWeak: []
    };

    const updated = {
      ...system,
      incidents: [...system.incidents, newIncident]
    };

    const reevaluated = reevaluateSystem(updated);
    onUpdate(reevaluated);
    
    setFormData({
      symptom: '',
      rootCauseCategory: '',
      impact: '',
      whatWouldHaveCaughtThis: '',
      failureModeId: ''
    });
    setShowForm(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div className="p-4 border border-subtle rounded-lg bg-hover mb-6">
        <p className="text-sm text-muted-foreground">
          <strong>Learning from incidents:</strong> When something breaks, log it here. Be specific about what would have caught it earlier. 
          Then go to the Learning Loop tab to generate suggestions for improving your signals.
        </p>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Incidents</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 border border-subtle rounded-lg hover-subtle transition-colors text-sm font-medium"
        >
          {showForm ? 'Cancel' : 'Log Incident'}
        </button>
      </div>

      {showForm && (
        <div className="border border-subtle rounded-lg p-6">
          <h3 className="font-medium mb-4">Log New Incident</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Symptom</label>
              <input
                type="text"
                value={formData.symptom}
                onChange={(e) => setFormData({ ...formData, symptom: e.target.value })}
                className="w-full px-3 py-2 border border-subtle rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Root Cause Category</label>
              <select
                value={formData.rootCauseCategory}
                onChange={(e) => setFormData({ ...formData, rootCauseCategory: e.target.value })}
                className="w-full px-3 py-2 border border-subtle rounded-lg"
                required
              >
                <option value="">Select category</option>
                <option value="Infrastructure">Infrastructure</option>
                <option value="Operational">Operational</option>
                <option value="Product">Product</option>
                <option value="Data">Data</option>
                <option value="Security">Security</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Impact</label>
              <input
                type="text"
                value={formData.impact}
                onChange={(e) => setFormData({ ...formData, impact: e.target.value })}
                className="w-full px-3 py-2 border border-subtle rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">What Would Have Caught This Earlier</label>
              <textarea
                value={formData.whatWouldHaveCaughtThis}
                onChange={(e) => setFormData({ ...formData, whatWouldHaveCaughtThis: e.target.value })}
                className="w-full px-3 py-2 border border-subtle rounded-lg"
                rows={3}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Failure Mode (Optional)</label>
              <select
                value={formData.failureModeId}
                onChange={(e) => setFormData({ ...formData, failureModeId: e.target.value })}
                className="w-full px-3 py-2 border border-subtle rounded-lg"
              >
                <option value="">None</option>
                {system.failureModes.map((fm) => (
                  <option key={fm.id} value={fm.id}>{fm.name}</option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity"
            >
              Log Incident
            </button>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {system.incidents.length === 0 ? (
          <div className="border border-subtle rounded-lg p-8 text-center text-muted-foreground">
            No incidents logged yet
          </div>
        ) : (
          system.incidents
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map((incident) => {
              const failureMode = incident.failureModeId
                ? system.failureModes.find(fm => fm.id === incident.failureModeId)
                : null;

              return (
                <div key={incident.id} className="border border-subtle rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="font-medium mb-1">{incident.symptom}</div>
                      <div className="text-sm text-muted-foreground">{formatDate(incident.date)}</div>
                    </div>
                    <div className="px-3 py-1 text-xs border border-subtle rounded">
                      {incident.rootCauseCategory}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Impact</div>
                      <div>{incident.impact}</div>
                    </div>
                    
                    {failureMode && (
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Failure Mode</div>
                        <div className="px-2 py-1 text-xs border border-subtle rounded inline-block">
                          {failureMode.name}
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">What Would Have Caught This Earlier</div>
                      <div className="text-sm">{incident.whatWouldHaveCaughtThis}</div>
                    </div>
                  </div>
                </div>
              );
            })
        )}
      </div>
    </div>
  );
}
