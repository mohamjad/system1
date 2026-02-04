'use client';

import { useState } from 'react';
import { System, SignalCategory } from '@/types';
import { SignalStatusBadge } from '@/components/SignalStatusBadge';
import { getSignalStatus } from '@/lib/scoring';

interface SignalsTabProps {
  system: System;
  onUpdate: (system: System) => void;
}

const categoryLabels: Record<SignalCategory, string> = {
  data_quality: 'Data Quality',
  pipeline_reliability: 'Pipeline Reliability',
  business_impact: 'Business Impact',
  user_sentiment: 'User Sentiment',
  behavior_drift: 'Behavior Drift'
};

export function SignalsTab({ system, onUpdate }: SignalsTabProps) {
  const [selectedCategory, setSelectedCategory] = useState<SignalCategory | 'all'>('all');
  const [selectedSignal, setSelectedSignal] = useState<string | null>(null);

  const categories: Array<SignalCategory | 'all'> = ['all', ...Object.keys(categoryLabels) as SignalCategory[]];
  
  const filteredSignals = selectedCategory === 'all'
    ? system.signals
    : system.signals.filter(s => s.category === selectedCategory);

  const signal = selectedSignal ? system.signals.find(s => s.id === selectedSignal) : null;

  return (
    <div className="space-y-6">
      <div className="p-4 border border-subtle rounded-lg bg-hover mb-6">
        <p className="text-sm text-muted-foreground">
          <strong>Signals are leading indicators</strong>—measurable things that catch problems early. 
          Each signal has a baseline (normal) value and a threshold. When current values deviate, the signal triggers. 
          Click any signal to see details.
        </p>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 text-sm border rounded-lg transition-colors ${
              selectedCategory === cat
                ? 'border-foreground bg-foreground text-background'
                : 'border-subtle hover-subtle'
            }`}
          >
            {cat === 'all' ? 'All' : categoryLabels[cat]}
          </button>
        ))}
      </div>

      <div className="border border-subtle rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="border-b border-subtle bg-hover">
            <tr>
              <th className="text-left p-4 text-sm font-medium">Signal</th>
              <th className="text-left p-4 text-sm font-medium">Category</th>
              <th className="text-left p-4 text-sm font-medium">Current</th>
              <th className="text-left p-4 text-sm font-medium">Baseline</th>
              <th className="text-left p-4 text-sm font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredSignals.map((signal) => {
              const status = getSignalStatus(signal);
              return (
                <tr
                  key={signal.id}
                  onClick={() => setSelectedSignal(signal.id)}
                  className="border-b border-subtle hover-subtle cursor-pointer transition-colors"
                >
                  <td className="p-4">
                    <div className="font-medium">{signal.name}</div>
                    <div className="text-xs text-muted-foreground">{signal.measurementType}</div>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {categoryLabels[signal.category]}
                  </td>
                  <td className="p-4 text-sm font-medium">{signal.currentValue.toFixed(4)}</td>
                  <td className="p-4 text-sm text-muted-foreground">{signal.baselineValue.toFixed(4)}</td>
                  <td className="p-4">
                    <SignalStatusBadge status={status} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {signal && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4">
          <div className="bg-background border border-subtle rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-subtle flex items-center justify-between">
              <h3 className="text-xl font-semibold">{signal.name}</h3>
              <button
                onClick={() => setSelectedSignal(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Category</div>
                <div>{categoryLabels[signal.category]}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Measurement Type</div>
                <div>{signal.measurementType}</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Current Value</div>
                  <div className="font-medium">{signal.currentValue.toFixed(4)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Baseline Value</div>
                  <div className="font-medium">{signal.baselineValue.toFixed(4)}</div>
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Threshold Rule</div>
                <div className="font-mono text-sm">{signal.thresholdRule}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Why This Matters</div>
                <div>{signal.whyThisMatters}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Failure Modes</div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {signal.failureModeTags.map((tag, idx) => (
                    <span key={idx} className="px-2 py-1 text-xs border border-subtle rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Confidence</div>
                  <div>{(signal.confidence * 100).toFixed(0)}%</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Severity Weight</div>
                  <div>{signal.severityWeight.toFixed(1)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
