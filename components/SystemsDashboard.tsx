'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { System, LearningSuggestion } from '@/types';
import { SignalStatusBadge } from '@/components/SignalStatusBadge';
import { SystemCard } from '@/components/SystemCard';
import { ReportIssue } from '@/components/ReportIssue';
import { getSignalStatus } from '@/lib/scoring';
import { getAllCoverageStrengths } from '@/lib/coverage';
import { generateLearningSuggestions } from '@/lib/learning-loop';
import { generateHealthHistory } from '@/lib/drift';
import { generateRecommendations } from '@/lib/recommendations';
import { getWeakCoverageModes } from '@/lib/coverage';

interface SystemsDashboardProps {
  systems: System[];
}

export function SystemsDashboard({ systems }: SystemsDashboardProps) {
  const [selectedSystems, setSelectedSystems] = useState<Set<string>>(
    new Set(systems.map(s => s.id))
  );
  const [hoveredPoint, setHoveredPoint] = useState<{
    systemId: string;
    systemName: string;
    healthScore: number;
    changeFromDay: number;
    changeFromWeek: number;
    changeFromMonth: number;
    changeFromDayPercent: number;
    changeFromWeekPercent: number;
    changeFromMonthPercent: number;
    xPercent: number;
    y: number;
  } | null>(null);

  if (!systems || systems.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No systems to display</p>
      </div>
    );
  }

  const toggleSystem = (systemId: string) => {
    const newSet = new Set(selectedSystems);
    if (newSet.has(systemId)) {
      newSet.delete(systemId);
    } else {
      newSet.add(systemId);
    }
    setSelectedSystems(newSet);
  };

  const filteredSystems = systems.filter(s => selectedSystems.has(s.id));

  // Aggregate all incidents across systems
  const allIncidents = useMemo(() => {
    return systems
      .flatMap(system => 
        (system.incidents || []).map(inc => ({ ...inc, systemId: system.id, systemName: system.name }))
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);
  }, [systems]);

  // Aggregate all signals across systems
  const { triggeredSignals, watchSignals, allSignals } = useMemo(() => {
    const signals = systems.flatMap(system => 
      (system.signals || []).map(signal => ({ ...signal, systemId: system.id, systemName: system.name }))
    );
    return {
      allSignals: signals,
      triggeredSignals: signals.filter(s => {
        try {
          return getSignalStatus(s) === 'triggered';
        } catch {
          return false;
        }
      }),
      watchSignals: signals.filter(s => {
        try {
          return getSignalStatus(s) === 'watch';
        } catch {
          return false;
        }
      }),
    };
  }, [systems]);

  // Aggregate learning suggestions from all incidents
  const allLearningSuggestions = useMemo(() => {
    const suggestions: Array<{ suggestion: LearningSuggestion; systemId: string; systemName: string; incidentId: string }> = [];
    
    systems.forEach(system => {
      (system.incidents || []).forEach(incident => {
        try {
          // Only generate suggestions for incidents that have learning data
          if (incident.signalsWereMissing?.length > 0 || incident.signalsWereTooWeak?.length > 0 || incident.failureModeId) {
            const incidentSuggestions = generateLearningSuggestions(system, incident);
            incidentSuggestions.forEach(suggestion => {
              suggestions.push({
                suggestion,
                systemId: system.id,
                systemName: system.name,
                incidentId: incident.id,
              });
            });
          }
        } catch (e) {
          console.error('Error generating suggestions:', e);
          // Skip if error generating suggestions
        }
      });
    });
    
    return suggestions.slice(0, 10);
  }, [systems]);

  // Aggregate heatmap data across all systems
  const heatmapData = useMemo(() => {
    const failureModeMap = new Map<string, { name: string; severity: number; systems: Set<string> }>();
    const signalMap = new Map<string, { name: string; category: string; systems: Set<string> }>();
    const coverageMap = new Map<string, 'strong' | 'partial' | 'weak' | 'none'>();
    
    systems.forEach(system => {
      const coverageStrengths = getAllCoverageStrengths(system);
      
      system.failureModes.forEach(fm => {
        const key = fm.id;
        if (!failureModeMap.has(key)) {
          failureModeMap.set(key, {
            name: fm.name,
            severity: fm.severity,
            systems: new Set(),
          });
        }
        failureModeMap.get(key)!.systems.add(system.id);
      });
      
      system.signals.forEach(signal => {
        const key = signal.id;
        if (!signalMap.has(key)) {
          signalMap.set(key, {
            name: signal.name,
            category: signal.category,
            systems: new Set(),
          });
        }
        signalMap.get(key)!.systems.add(system.id);
      });
      
      coverageStrengths.forEach(cs => {
        const key = `${cs.failureModeId}-${cs.signalId}`;
        const current = coverageMap.get(key);
        if (!current || cs.strength === 'strong') {
          coverageMap.set(key, cs.strength);
        } else if (current === 'none' && cs.strength !== 'none') {
          coverageMap.set(key, cs.strength);
        } else if (current === 'weak' && cs.strength === 'partial') {
          coverageMap.set(key, cs.strength);
        }
      });
    });
    
    return {
      failureModes: Array.from(failureModeMap.entries()).map(([id, data]) => ({ id, ...data })),
      signals: Array.from(signalMap.entries()).map(([id, data]) => ({ id, ...data })),
      coverage: coverageMap,
    };
  }, [systems]);

  // Generate drift data for filtered systems - 30 days to match system-specific view
  const driftData = useMemo(() => {
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const startOfMonth = new Date(now);
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    return filteredSystems.map(system => {
      const history = generateHealthHistory(system, 30);
      
      // Calculate changes from start of day/week/month
      const enrichedHistory = history.map((point, idx) => {
        const pointDate = new Date(point.date);
        
        // Find closest points for day/week/month comparisons
        const dayStartPoint = history.find(p => {
          const pDate = new Date(p.date);
          return pDate >= startOfDay && pDate <= pointDate;
        }) || history[0];
        
        const weekStartPoint = history.find(p => {
          const pDate = new Date(p.date);
          return pDate >= startOfWeek && pDate <= pointDate;
        }) || history[0];
        
        const monthStartPoint = history.find(p => {
          const pDate = new Date(p.date);
          return pDate >= startOfMonth && pDate <= pointDate;
        }) || history[0];
        
        const changeFromDay = point.healthScore - dayStartPoint.healthScore;
        const changeFromWeek = point.healthScore - weekStartPoint.healthScore;
        const changeFromMonth = point.healthScore - monthStartPoint.healthScore;
        
        return {
          ...point,
          changeFromDay,
          changeFromWeek,
          changeFromMonth,
          changeFromDayPercent: dayStartPoint.healthScore > 0 
            ? (changeFromDay / dayStartPoint.healthScore) * 100 
            : 0,
          changeFromWeekPercent: weekStartPoint.healthScore > 0 
            ? (changeFromWeek / weekStartPoint.healthScore) * 100 
            : 0,
          changeFromMonthPercent: monthStartPoint.healthScore > 0 
            ? (changeFromMonth / monthStartPoint.healthScore) * 100 
            : 0,
        };
      });
      
      return {
        system,
        history: enrichedHistory,
      };
    });
  }, [filteredSystems]);


  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const daysAgo = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (daysAgo === 0) return 'Today';
    if (daysAgo === 1) return 'Yesterday';
    if (daysAgo < 7) return `${daysAgo}d ago`;
    // Show full date for older dates
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
  };

  // Color palette for systems
  const systemColors = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', 
    '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
  ];

  // Aggregate all alerts and suggestions
  const allAlerts = useMemo(() => {
    const alerts: Array<{
      type: 'critical_signal' | 'coverage_gap' | 'failed_test' | 'recommendation' | 'incident';
      priority: 'high' | 'medium' | 'low';
      title: string;
      description: string;
      systemId: string;
      systemName: string;
      link?: string;
    }> = [];

    // Critical signals
    triggeredSignals.forEach(signal => {
      alerts.push({
        type: 'critical_signal',
        priority: 'high',
        title: `${signal.name} is triggered`,
        description: `${signal.systemName}: ${signal.currentValue.toFixed(2)} vs baseline ${signal.baselineValue.toFixed(2)}`,
        systemId: signal.systemId,
        systemName: signal.systemName,
        link: `/systems/${signal.systemId}`,
      });
    });

    // Coverage gaps
    systems.forEach(system => {
      const weakModes = getWeakCoverageModes(system);
      weakModes.forEach(mode => {
        const fm = system.failureModes.find(f => f.id === mode.failureModeId);
        if (fm) {
          alerts.push({
            type: 'coverage_gap',
            priority: fm.severity >= 4 ? 'high' : 'medium',
            title: `Weak coverage: ${fm.name}`,
            description: `${system.name}: Only ${mode.signalCount} signal(s), ${Math.round(mode.coverageScore)}% coverage`,
            systemId: system.id,
            systemName: system.name,
            link: `/systems/${system.id}`,
          });
        }
      });
    });

    // Failed stress tests
    systems.forEach(system => {
      system.stressTests.filter(t => !t.passed).forEach(test => {
        alerts.push({
          type: 'failed_test',
          priority: 'medium',
          title: `Failed stress test: ${test.name}`,
          description: `${system.name}: ${test.notes || 'Signals did not catch simulated failure'}`,
          systemId: system.id,
          systemName: system.name,
          link: `/systems/${system.id}`,
        });
      });
    });

    // High priority recommendations
    systems.forEach(system => {
      const recommendations = generateRecommendations(system);
      recommendations.filter(r => r.priority === 'high').forEach(rec => {
        alerts.push({
          type: 'recommendation',
          priority: 'high',
          title: rec.action,
          description: `${system.name}: ${rec.reason}`,
          systemId: system.id,
          systemName: system.name,
          link: `/systems/${system.id}`,
        });
      });
    });

    // Recent incidents needing attention
    allIncidents.slice(0, 3).forEach(incident => {
      if (incident.signalsWereMissing?.length > 0 || incident.signalsWereTooWeak?.length > 0) {
        alerts.push({
          type: 'incident',
          priority: 'medium',
          title: `Incident: ${incident.symptom}`,
          description: `${incident.systemName}: ${incident.impact}`,
          systemId: incident.systemId,
          systemName: incident.systemName,
          link: `/systems/${incident.systemId}`,
        });
      }
    });

    return alerts.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }).slice(0, 10);
  }, [systems, triggeredSignals, allIncidents]);

  return (
    <div className="space-y-6">
      {/* Alerts & Suggestions */}
      {allAlerts.length > 0 && (
        <div className="border border-subtle rounded-lg p-6 border-l-4 border-l-red-500 bg-red-500/5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Alerts & Action Items</h2>
            <span className="px-3 py-1 bg-red-500/10 text-red-500 rounded-full text-sm font-medium">
              {allAlerts.length} Issue{allAlerts.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {allAlerts.map((alert, idx) => {
              const priorityColors = {
                high: 'border-red-500/50 bg-red-500/10',
                medium: 'border-yellow-500/50 bg-yellow-500/10',
                low: 'border-blue-500/50 bg-blue-500/10',
              };
              const priorityLabels = {
                high: 'High',
                medium: 'Medium',
                low: 'Low',
              };
              return (
                <Link
                  key={idx}
                  href={alert.link || `/systems/${alert.systemId}`}
                  className={`p-3 border rounded-lg hover:opacity-80 transition-opacity ${priorityColors[alert.priority]}`}
                >
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{alert.title}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded ${
                          alert.priority === 'high' ? 'bg-red-500/20 text-red-600' :
                          alert.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-600' :
                          'bg-blue-500/20 text-blue-600'
                        }`}>
                          {priorityLabels[alert.priority]}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">{alert.description}</div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Systems Overview */}
      <div className="border border-subtle rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Systems</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {systems.map((system) => (
            <SystemCard key={system.id} system={system} />
          ))}
        </div>
      </div>

      {/* System Drift Visualization */}
      <div className="border border-subtle rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">System Drift Over Time</h2>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground">Show systems:</span>
            {systems.map((system, idx) => {
              const isSelected = selectedSystems.has(system.id);
              const color = systemColors[idx % systemColors.length];
              return (
                <button
                  key={system.id}
                  onClick={() => toggleSystem(system.id)}
                  className={`px-3 py-1 text-xs rounded-lg border transition-all ${
                    isSelected
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-subtle hover-subtle opacity-40'
                  }`}
                  style={isSelected ? { borderColor: color, backgroundColor: color, color: '#fff' } : {}}
                >
                  {system.name}
                </button>
              );
            })}
            <button
              onClick={() => setSelectedSystems(new Set(systems.map(s => s.id)))}
              className="px-2 py-1 text-xs border border-subtle rounded-lg hover-subtle"
            >
              All
            </button>
            <button
              onClick={() => setSelectedSystems(new Set())}
              className="px-2 py-1 text-xs border border-subtle rounded-lg hover-subtle"
            >
              None
            </button>
          </div>
        </div>
        <div className="relative h-80 mb-4" data-chart-container>
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-muted-foreground">
            <span>100</span>
            <span>75</span>
            <span>50</span>
            <span>25</span>
            <span>0</span>
          </div>
          
          {/* Chart area */}
          <div className="ml-12 h-full relative">
            {/* Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between">
              {[0, 0.25, 0.5, 0.75, 1].map((pos) => (
                <div key={pos} className="border-t border-subtle opacity-30" />
              ))}
            </div>
            
            {/* Data points */}
            <svg className="absolute inset-0 w-full h-full" style={{ overflow: 'visible' }}>
              {/* Individual system points */}
              {driftData.map(({ system, history }, systemIdx) => {
                if (history.length === 0) return null;
                
                const color = systemColors[systems.findIndex(s => s.id === system.id) % systemColors.length];
                const totalPoints = history.length;
                
                return (
                  <g key={system.id}>
                    {/* Draw dynamic points */}
                    {history.map((point, idx) => {
                      // Ensure last point is at 100% (right edge)
                      const x = totalPoints > 1 ? (idx / (totalPoints - 1)) * 100 : 0;
                      // Normalize health score to 0-100 scale (health scores are already 0-100)
                      const y = 100 - point.healthScore;
                      
                      // Dynamic point size based on health score (healthier = larger)
                      const baseRadius = 5;
                      const healthMultiplier = 0.6 + (point.healthScore / 100) * 0.4; // 0.6x to 1x
                      const radius = baseRadius * healthMultiplier;
                      
                      // Opacity based on recency (more recent = more opaque)
                      const recency = idx / totalPoints;
                      const opacity = 0.7 + (recency * 0.3); // 0.7 to 1.0
                      
                      return (
                        <g key={idx}>
                          <circle
                            cx={`${x}%`}
                            cy={y}
                            r={radius}
                            fill={color}
                            opacity={opacity}
                            stroke={color}
                            strokeWidth="1.5"
                            className="hover:r-7 transition-all cursor-pointer"
                            style={{
                              filter: `drop-shadow(0 2px 4px ${color}40)`,
                            }}
                            onMouseEnter={() => {
                              const xPercent = totalPoints > 1 ? (idx / (totalPoints - 1)) * 100 : 0;
                              setHoveredPoint({
                                systemId: system.id,
                                systemName: system.name,
                                healthScore: point.healthScore,
                                changeFromDay: point.changeFromDay,
                                changeFromWeek: point.changeFromWeek,
                                changeFromMonth: point.changeFromMonth,
                                changeFromDayPercent: point.changeFromDayPercent,
                                changeFromWeekPercent: point.changeFromWeekPercent,
                                changeFromMonthPercent: point.changeFromMonthPercent,
                                xPercent,
                                y,
                              });
                            }}
                            onMouseLeave={() => setHoveredPoint(null)}
                          />
                        </g>
                      );
                    })}
                  </g>
                );
              })}
            </svg>
            
            {/* Hover tooltip */}
            {hoveredPoint && (
              <div
                className="absolute z-50 bg-black text-white text-xs px-3 py-2 rounded-lg shadow-xl border-2 border-white/30 pointer-events-none"
                style={{
                  left: `${hoveredPoint.xPercent}%`,
                  top: `${hoveredPoint.y - 100}px`,
                  transform: 'translateX(-50%)',
                  backgroundColor: '#000000',
                  color: '#ffffff',
                }}
              >
                <div className="font-semibold mb-1" style={{ color: '#ffffff' }}>
                  {hoveredPoint.systemName}
                </div>
                <div className="text-[10px] space-y-0.5" style={{ color: '#ffffff' }}>
                  <div>Health: {hoveredPoint.healthScore.toFixed(1)}</div>
                  <div className={hoveredPoint.changeFromDay >= 0 ? 'text-green-400' : 'text-red-400'}>
                    Today: {hoveredPoint.changeFromDay >= 0 ? '+' : ''}{hoveredPoint.changeFromDay.toFixed(1)} ({hoveredPoint.changeFromDayPercent >= 0 ? '+' : ''}{hoveredPoint.changeFromDayPercent.toFixed(1)}%)
                  </div>
                  <div className={hoveredPoint.changeFromWeek >= 0 ? 'text-green-400' : 'text-red-400'}>
                    Week: {hoveredPoint.changeFromWeek >= 0 ? '+' : ''}{hoveredPoint.changeFromWeek.toFixed(1)} ({hoveredPoint.changeFromWeekPercent >= 0 ? '+' : ''}{hoveredPoint.changeFromWeekPercent.toFixed(1)}%)
                  </div>
                  <div className={hoveredPoint.changeFromMonth >= 0 ? 'text-green-400' : 'text-red-400'}>
                    Month: {hoveredPoint.changeFromMonth >= 0 ? '+' : ''}{hoveredPoint.changeFromMonth.toFixed(1)} ({hoveredPoint.changeFromMonthPercent >= 0 ? '+' : ''}{hoveredPoint.changeFromMonthPercent.toFixed(1)}%)
                  </div>
                </div>
              </div>
            )}
            
            {/* X-axis labels */}
            {driftData.length > 0 && driftData[0].history.length > 0 && (
              <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-xs text-muted-foreground">
                <span>{formatDate(driftData[0].history[0].date)}</span>
                <span>{formatDate(driftData[0].history[Math.floor(driftData[0].history.length / 2)].date)}</span>
                <span className="font-semibold">
                  {formatDate(driftData[0].history[driftData[0].history.length - 1].date)}
                  {(() => {
                    const lastDate = new Date(driftData[0].history[driftData[0].history.length - 1].date);
                    const today = new Date();
                    const isToday = Math.abs(today.getTime() - lastDate.getTime()) < 24 * 60 * 60 * 1000;
                    return isToday ? ' (Today)' : '';
                  })()}
                </span>
              </div>
            )}
          </div>
        </div>
        
        {/* Legend - spaced down */}
        <div className="flex flex-wrap gap-4 text-sm mt-12 pt-6 border-t border-subtle">
          {systems.map((system, idx) => {
            const isSelected = selectedSystems.has(system.id);
            const color = systemColors[idx % systemColors.length];
            return (
              <div 
                key={system.id} 
                className={`flex items-center gap-2 ${!isSelected ? 'opacity-40' : ''}`}
              >
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: color }}
                />
                <span className="text-muted-foreground">{system.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="border border-subtle rounded-lg p-4">
          <div className="text-sm text-muted-foreground mb-1">Total Systems</div>
          <div className="text-2xl font-bold">{systems.length}</div>
        </div>
        <div className="border border-subtle rounded-lg p-4">
          <div className="text-sm text-muted-foreground mb-1">Active Alerts</div>
          <div className="text-2xl font-bold risk-high">{triggeredSignals.length}</div>
        </div>
        <div className="border border-subtle rounded-lg p-4">
          <div className="text-sm text-muted-foreground mb-1">Watch Signals</div>
          <div className="text-2xl font-bold risk-medium">{watchSignals.length}</div>
        </div>
        <div className="border border-subtle rounded-lg p-4">
          <div className="text-sm text-muted-foreground mb-1">Recent Incidents</div>
          <div className="text-2xl font-bold">{allIncidents.length}</div>
        </div>
      </div>

      {/* Compact Coverage Heatmap */}
      <div className="border border-subtle rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-3">Coverage Heatmap</h2>
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            {/* Header row - compact */}
            <div className="flex border-b border-subtle pb-2 mb-2">
              <div className="w-48 flex-shrink-0 font-medium text-xs">Failure Mode</div>
              <div className="flex gap-1 flex-1">
                {heatmapData.signals.map((signal) => (
                  <div
                    key={signal.id}
                    className="flex-1 min-w-[80px] text-center"
                  >
                    <div className="text-xs font-medium truncate" title={signal.name}>
                      {signal.name.split(' ').slice(0, 2).join(' ')}
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      {signal.category.split('_').pop()?.substring(0, 4)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Data rows - compact */}
            <div className="space-y-1">
              {heatmapData.failureModes.map((fm) => (
                <div key={fm.id} className="flex items-center gap-1">
                  <div className="w-48 flex-shrink-0">
                    <div className="font-medium text-xs">{fm.name}</div>
                    <div className="text-[10px] text-muted-foreground">
                      S{fm.severity} • {fm.systems.size}s
                    </div>
                  </div>
                  <div className="flex gap-1 flex-1">
                    {heatmapData.signals.map((signal) => {
                      const strength = heatmapData.coverage.get(`${fm.id}-${signal.id}`) || 'none';
                      
                      return (
                        <div
                          key={signal.id}
                          className="flex-1 min-w-[80px] h-10 rounded transition-all hover:scale-110 cursor-pointer relative group"
                          style={{
                            backgroundColor: strength === 'strong' 
                              ? 'rgba(34, 197, 94, 0.2)' 
                              : strength === 'partial'
                              ? 'rgba(234, 179, 8, 0.2)'
                              : strength === 'weak'
                              ? 'rgba(156, 163, 175, 0.1)'
                              : 'transparent',
                            border: strength !== 'none' 
                              ? `1.5px solid ${strength === 'strong' ? 'rgba(34, 197, 94, 0.5)' : strength === 'partial' ? 'rgba(234, 179, 8, 0.5)' : 'rgba(156, 163, 175, 0.3)'}`
                              : '1.5px solid transparent',
                          }}
                        >
                          {strength !== 'none' && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className={`text-[10px] font-bold ${
                                strength === 'strong' ? 'text-green-600' :
                                strength === 'partial' ? 'text-yellow-600' :
                                'text-gray-500'
                              }`}>
                                {strength === 'strong' ? '✓' : strength === 'partial' ? '~' : '○'}
                              </div>
                            </div>
                          )}
                          {/* Tooltip */}
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 hidden group-hover:block z-20 pointer-events-none">
                            <div className="bg-black text-white text-xs px-2 py-1.5 rounded shadow-xl border-2 border-white/30 whitespace-nowrap" style={{ backgroundColor: '#000000', color: '#ffffff' }}>
                              <div className="font-semibold" style={{ color: '#ffffff' }}>{fm.name} ↔ {signal.name}</div>
                              <div className="text-[10px] font-medium capitalize mt-0.5" style={{ color: '#ffffff' }}>{strength} coverage</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Legend - compact */}
        <div className="flex items-center gap-4 text-xs mt-4 pt-3 border-t border-subtle">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-green-500/20 border border-green-500/50 flex items-center justify-center">
              <span className="text-green-600 text-[10px] font-bold">✓</span>
            </div>
            <span>Strong</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-yellow-500/20 border border-yellow-500/50 flex items-center justify-center">
              <span className="text-yellow-600 text-[10px] font-bold">~</span>
            </div>
            <span>Partial</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-gray-500/10 border border-gray-500/30 flex items-center justify-center">
              <span className="text-gray-500 text-[10px]">○</span>
            </div>
            <span>Weak</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded border border-transparent"></div>
            <span>None</span>
          </div>
        </div>
      </div>

      {/* Critical Signals */}
      {triggeredSignals.length > 0 && (
        <div className="border border-subtle rounded-lg p-6 border-l-4 border-l-red-500">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Critical Signals</h2>
            <ReportIssue systems={systems} />
          </div>
          <div className="space-y-3">
            {triggeredSignals.slice(0, 5).map((signal) => (
              <div
                key={`${signal.systemId}-${signal.id}`}
                className="flex items-center gap-3 p-3 border border-subtle rounded-lg hover-subtle transition-colors"
              >
                <Link
                  href={`/systems/${signal.systemId}`}
                  className="flex-1 flex items-center justify-between"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{signal.name}</span>
                      <SignalStatusBadge status="triggered" />
                    </div>
                    <div className="text-sm text-muted-foreground">{signal.systemName}</div>
                  </div>
                  <div className="text-right text-sm">
                    <div className="font-medium">{signal.currentValue.toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground">vs {signal.baselineValue.toFixed(2)}</div>
                  </div>
                </Link>
                <ReportIssue systems={systems} signalId={signal.id} systemId={signal.systemId} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Incidents */}
      {allIncidents.length > 0 && (
        <div className="border border-subtle rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Incidents</h2>
            <ReportIssue systems={systems} />
          </div>
          <div className="space-y-3">
            {allIncidents.map((incident) => (
              <div
                key={incident.id}
                className="flex items-center gap-3 p-3 border border-subtle rounded-lg hover-subtle transition-colors"
              >
                <Link
                  href={`/systems/${incident.systemId}`}
                  className="flex-1 flex items-start justify-between"
                >
                  <div className="flex-1">
                    <div className="font-medium mb-1">{incident.symptom}</div>
                    <div className="text-sm text-muted-foreground mb-1">{incident.systemName}</div>
                    <div className="text-xs text-muted-foreground">{incident.impact}</div>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    {formatDate(incident.date)}
                  </div>
                </Link>
                <ReportIssue systems={systems} incidentId={incident.id} systemId={incident.systemId} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Learning Suggestions */}
      {allLearningSuggestions.length > 0 && (
        <div className="border border-subtle rounded-lg p-6 border-l-4 border-l-blue-500">
          <h2 className="text-lg font-semibold mb-4">Learning Suggestions</h2>
          <div className="space-y-3">
            {allLearningSuggestions.map((item, idx) => {
              const typeLabels: Record<LearningSuggestion['type'], string> = {
                new_signal: 'New Signal',
                threshold_update: 'Threshold Update',
                new_stress_test: 'New Stress Test'
              };
              
              const suggestionType: LearningSuggestion['type'] = item.suggestion.type;
              const typeLabel = typeLabels[suggestionType];
              
              return (
                <Link
                  key={`${item.systemId}-${item.incidentId}-${idx}`}
                  href={`/systems/${item.systemId}`}
                  className="block p-3 border border-subtle rounded-lg hover-subtle transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-1 text-xs border border-subtle rounded">
                          {typeLabel}
                        </span>
                        <span className="text-sm text-muted-foreground">{item.systemName}</span>
                      </div>
                      <div className="font-medium mb-1">{item.suggestion.description}</div>
                      <div className="text-xs text-muted-foreground">{item.suggestion.reason}</div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
