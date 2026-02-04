'use client';

import { System, DecisionRecommendation } from '@/types';
import { generateRecommendations } from '@/lib/recommendations';
import { useRouter } from 'next/navigation';

interface DecisionRecommendationsProps {
  system: System;
}

export function DecisionRecommendations({ system }: DecisionRecommendationsProps) {
  const router = useRouter();
  const recommendations = generateRecommendations(system);
  
  const handleRecommendationClick = (rec: DecisionRecommendation) => {
    if (rec.relatedSignalId) {
      // Could scroll to signal or highlight it
      router.push(`/systems/${system.id}?tab=signals&signal=${rec.relatedSignalId}`);
    } else if (rec.relatedFailureModeId) {
      router.push(`/systems/${system.id}?tab=evaluation`);
    } else if (rec.relatedIncidentId) {
      router.push(`/systems/${system.id}?tab=learning-loop`);
    }
  };
  
  const priorityColors = {
    high: 'border-red-500/50 bg-red-500/10',
    medium: 'border-yellow-500/50 bg-yellow-500/10',
    low: 'border-subtle bg-hover'
  };
  
  if (recommendations.length === 0) {
    return (
      <div className="border border-subtle rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-2">What I'd Do Right Now</h3>
        <p className="text-sm text-muted-foreground">
          No immediate actions needed. System appears healthy with good signal coverage.
        </p>
      </div>
    );
  }
  
  return (
    <div className="border border-subtle rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">What I'd Do Right Now</h3>
      <div className="space-y-3">
        {recommendations.map((rec) => (
          <div
            key={rec.id}
            onClick={() => handleRecommendationClick(rec)}
            className={`p-4 border rounded-lg cursor-pointer hover:opacity-80 transition-opacity ${priorityColors[rec.priority]}`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="font-medium mb-1">{rec.action}</div>
                <div className="text-sm text-muted-foreground">{rec.reason}</div>
              </div>
              <div className={`px-2 py-1 text-xs font-medium rounded capitalize ${
                rec.priority === 'high' ? 'bg-red-500/20 text-red-600' :
                rec.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-600' :
                'bg-gray-500/20 text-gray-600'
              }`}>
                {rec.priority}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
