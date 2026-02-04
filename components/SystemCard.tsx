'use client';

import Link from 'next/link';
import { System } from '@/types';

interface SystemCardProps {
  system: System;
}

export function SystemCard({ system }: SystemCardProps) {
  const riskColor = {
    low: 'risk-low',
    medium: 'risk-medium',
    high: 'risk-high'
  }[system.riskLevel];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const hoursAgo = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (hoursAgo < 1) return 'Just now';
    if (hoursAgo < 24) return `${hoursAgo}h ago`;
    return `${Math.floor(hoursAgo / 24)}d ago`;
  };

  return (
    <Link href={`/systems/${system.id}`}>
      <div className="border border-subtle rounded-lg p-6 hover-subtle transition-colors cursor-pointer">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold mb-1">{system.name}</h3>
            <p className="text-sm text-muted-foreground">{system.description}</p>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold ${riskColor}`}>
              {Math.round(system.healthScore)}
            </div>
            <div className="text-xs text-muted-foreground">Health</div>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-sm mb-4">
          <div>
            <span className="text-muted-foreground">Risk: </span>
            <span className={`font-medium capitalize ${riskColor}`}>
              {system.riskLevel}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Updated: </span>
            <span>{formatDate(system.lastEvaluation)}</span>
          </div>
        </div>
        
        {system.topRisks.length > 0 && (
          <div className="pt-4 border-t border-subtle">
            <div className="text-xs text-muted-foreground mb-2">Top Risks</div>
            <div className="flex flex-wrap gap-2">
              {system.topRisks.slice(0, 2).map((risk, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 text-xs border border-subtle rounded"
                >
                  {risk}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}
