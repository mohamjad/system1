'use client';

import { System } from '@/types';
import { generateHealthHistory, detectDriftPoints } from '@/lib/drift';

interface SystemDriftTabProps {
  system: System;
}

export function SystemDriftTab({ system }: SystemDriftTabProps) {
  const history = generateHealthHistory(system, 30);
  const driftPoints = detectDriftPoints(history);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  
  const maxHealth = Math.max(...history.map(h => h.healthScore), 100);
  const minHealth = Math.min(...history.map(h => h.healthScore), 0);
  const range = maxHealth - minHealth || 1;
  
  return (
    <div className="space-y-6">
      <div className="p-4 border border-subtle rounded-lg bg-hover mb-6">
        <p className="text-sm text-muted-foreground">
          <strong>System Drift View:</strong> See how health has changed over time. 
          No spikes, just gradual drift. This shows systems that look fine until they don't.
        </p>
      </div>

      <div className="border border-subtle rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Health Score Over Time</h2>
        
        <div className="relative h-64 mb-4">
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-muted-foreground">
            <span>{Math.round(maxHealth)}</span>
            <span>{Math.round((maxHealth + minHealth) / 2)}</span>
            <span>{Math.round(minHealth)}</span>
          </div>
          
          {/* Chart area */}
          <div className="ml-12 h-full relative">
            {/* Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between">
              {[0, 0.5, 1].map((pos) => (
                <div key={pos} className="border-t border-subtle" />
              ))}
            </div>
            
            {/* Data line */}
            <svg className="absolute inset-0 w-full h-full" style={{ overflow: 'visible' }}>
              <polyline
                points={history.map((point, idx) => {
                  const x = (idx / (history.length - 1)) * 100;
                  const y = 100 - ((point.healthScore - minHealth) / range) * 100;
                  return `${x},${y}`;
                }).join(' ')}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-foreground"
              />
              
              {/* Data points */}
              {history.map((point, idx) => {
                const x = (idx / (history.length - 1)) * 100;
                const y = 100 - ((point.healthScore - minHealth) / range) * 100;
                const color = point.healthScore >= 70 ? '#16a34a' : point.healthScore >= 40 ? '#eab308' : '#dc2626';
                
                return (
                  <circle
                    key={idx}
                    cx={`${x}%`}
                    cy={y}
                    r="4"
                    fill={color}
                    className="hover:r-6 transition-all cursor-pointer"
                  />
                );
              })}
              
              {/* Drift annotations */}
              {driftPoints.map((dp, idx) => {
                const pointIdx = history.findIndex(h => h.date === dp.date);
                if (pointIdx === -1) return null;
                const x = (pointIdx / (history.length - 1)) * 100;
                const y = 100 - ((history[pointIdx].healthScore - minHealth) / range) * 100;
                
                return (
                  <g key={idx}>
                    <line
                      x1={`${x}%`}
                      y1={y}
                      x2={`${x}%`}
                      y2={y - 30}
                      stroke="currentColor"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                      className="text-muted-foreground"
                    />
                    <text
                      x={`${x}%`}
                      y={y - 35}
                      textAnchor="middle"
                      className="text-xs fill-foreground"
                    >
                      {dp.type === 'decline' ? '↓' : '↑'} {Math.round(dp.magnitude)}pts
                    </text>
                  </g>
                );
              })}
            </svg>
            
            {/* X-axis labels */}
            <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-xs text-muted-foreground">
              <span>{formatDate(history[0].date)}</span>
              <span>{formatDate(history[Math.floor(history.length / 2)].date)}</span>
              <span>{formatDate(history[history.length - 1].date)}</span>
            </div>
          </div>
        </div>
        
        {driftPoints.length > 0 && (
          <div className="mt-6 pt-4 border-t border-subtle">
            <div className="text-sm font-medium mb-2">Drift Events</div>
            <div className="space-y-2">
              {driftPoints.map((dp, idx) => (
                <div key={idx} className="text-sm">
                  <span className="font-medium">{formatDate(dp.date)}:</span>{' '}
                  <span className={dp.type === 'decline' ? 'text-red-600' : 'text-green-600'}>
                    {dp.type === 'decline' ? 'Declined' : 'Improved'} {Math.round(dp.magnitude)} points
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="border border-subtle rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Signal Drift Analysis</h2>
        <div className="space-y-3">
          {history
            .filter((_, idx) => idx % 7 === 0) // Weekly samples
            .map((point, idx) => {
              const signal = system.signals.find(s => s.name === point.topSignal);
              return signal ? (
                <div key={idx} className="flex items-center justify-between py-2 border-b border-subtle last:border-0">
                  <div>
                    <div className="font-medium">{point.topSignal}</div>
                    <div className="text-xs text-muted-foreground">{formatDate(point.date)}</div>
                  </div>
                  <div className="text-right">
                    <div className={`font-semibold ${
                      point.healthScore >= 70 ? 'risk-low' :
                      point.healthScore >= 40 ? 'risk-medium' : 'risk-high'
                    }`}>
                      {Math.round(point.healthScore)}
                    </div>
                    <div className="text-xs text-muted-foreground">Health</div>
                  </div>
                </div>
              ) : null;
            })}
        </div>
      </div>
    </div>
  );
}
