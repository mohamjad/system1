'use client';

import { useState } from 'react';
import { System } from '@/types';

interface ReportIssueProps {
  systems?: System[];
  signalId?: string;
  systemId?: string;
  incidentId?: string;
}

export function ReportIssue({ systems = [], signalId, systemId, incidentId }: ReportIssueProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Get context information
    const system = systems.find(s => s.id === systemId);
    const signal = system?.signals.find(s => s.id === signalId);
    const incident = system?.incidents.find(i => i.id === incidentId);

    // Build issue report
    const issueReport = {
      subject: formData.subject || 'Issue Report',
      description: formData.description,
      priority: formData.priority,
      context: {
        system: system ? {
          id: system.id,
          name: system.name,
        } : null,
        signal: signal ? {
          id: signal.id,
          name: signal.name,
          currentValue: signal.currentValue,
          baselineValue: signal.baselineValue,
          status: signalId ? 'triggered' : undefined,
        } : null,
        incident: incident ? {
          id: incident.id,
          symptom: incident.symptom,
          date: incident.date,
        } : null,
      },
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : '',
    };

    // Simulate sending to support (placeholder email)
    // In production, this would send to: support@yourcompany.com
    const supportEmail = 'support@placeholder.com';
    
    try {
      // Create mailto link with issue details
      const mailtoBody = `
Issue Report:
Priority: ${formData.priority}
Subject: ${formData.subject}

Description:
${formData.description}

Context:
${system ? `System: ${system.name} (${system.id})` : ''}
${signal ? `Signal: ${signal.name} - Current: ${signal.currentValue}, Baseline: ${signal.baselineValue}` : ''}
${incident ? `Incident: ${incident.symptom} (${new Date(incident.date).toLocaleDateString()})` : ''}

Technical Details:
${JSON.stringify(issueReport, null, 2)}
      `.trim();

      const mailtoLink = `mailto:${supportEmail}?subject=${encodeURIComponent(formData.subject || 'Issue Report')}&body=${encodeURIComponent(mailtoBody)}`;
      
      // Open email client
      window.location.href = mailtoLink;
      
      // Also log to console for debugging
      console.log('Issue Report:', issueReport);
      
      setSubmitted(true);
      setTimeout(() => {
        setIsOpen(false);
        setSubmitted(false);
        setFormData({ subject: '', description: '', priority: 'medium' });
      }, 2000);
    } catch (error) {
      console.error('Error reporting issue:', error);
      alert('Error reporting issue. Please email support@placeholder.com directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="px-3 py-1.5 text-sm border border-subtle rounded-lg hover-subtle transition-colors text-muted-foreground hover:text-foreground"
      >
        Report Issue
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4">
      <div className="bg-background border border-subtle rounded-lg max-w-lg w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Report Issue</h3>
          <button
            onClick={() => {
              setIsOpen(false);
              setFormData({ subject: '', description: '', priority: 'medium' });
              setSubmitted(false);
            }}
            className="text-muted-foreground hover:text-foreground"
          >
            ✕
          </button>
        </div>

        {submitted ? (
          <div className="text-center py-8">
            <div className="text-green-600 mb-2">✓ Issue reported successfully</div>
            <div className="text-sm text-muted-foreground">
              Your email client should open with the issue details.
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Subject</label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-3 py-2 border border-subtle rounded-lg"
                placeholder="Brief description of the issue"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'low' | 'medium' | 'high' })}
                className="w-full px-3 py-2 border border-subtle rounded-lg"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-subtle rounded-lg"
                rows={5}
                placeholder="Describe the issue in detail..."
                required
              />
            </div>

            {(systemId || signalId || incidentId) && (
              <div className="p-3 bg-hover rounded-lg text-sm text-muted-foreground">
                <div className="font-medium mb-1">Context will be included:</div>
                {systemId && <div>• System information</div>}
                {signalId && <div>• Signal details</div>}
                {incidentId && <div>• Incident information</div>}
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isSubmitting ? 'Sending...' : 'Send Report'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setFormData({ subject: '', description: '', priority: 'medium' });
                }}
                className="px-4 py-2 border border-subtle rounded-lg hover-subtle transition-colors"
              >
                Cancel
              </button>
            </div>

            <div className="text-xs text-muted-foreground pt-2 border-t border-subtle">
              Note: This will open your email client. Support email: support@placeholder.com
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
