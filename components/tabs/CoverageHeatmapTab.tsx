'use client';

import { useState } from 'react';
import { System } from '@/types';
import { getAllCoverageStrengths, getWeakCoverageModes } from '@/lib/coverage';

interface CoverageHeatmapTabProps {
  system: System;
}

export function CoverageHeatmapTab({ system }: CoverageHeatmapTabProps) {
  const [selectedCell, setSelectedCell] = useState<{ fmId: string; signalId: string } | null>(null);
  
  const coverageStrengths = getAllCoverageStrengths(system);
  const weakCoverageModes = getWeakCoverageModes(system);
  
  const getCellStrength = (fmId: string, signalId: string): 'strong' | 'partial' | 'weak' | 'none' => {
    const coverage = coverageStrengths.find(
      cs => cs.failureModeId === fmId && cs.signalId === signalId
    );
    return coverage?.strength || 'none';
  };
  
  const getCellColor = (strength: 'strong' | 'partial' | 'weak' | 'none') => {
    switch (strength) {
      case 'strong':
        return 'bg-green-500/20 border-green-500/50';
      case 'partial':
        return 'bg-yellow-500/20 border-yellow-500/50';
      case 'weak':
        return 'bg-gray-500/10 border-gray-500/30';
      case 'none':
        return 'bg-transparent border-subtle';
    }
  };
  
  const selectedCoverage = selectedCell
    ? coverageStrengths.find(
        cs => cs.failureModeId === selectedCell.fmId && cs.signalId === selectedCell.signalId
      )
    : null;
  
  return (
    <div className="space-y-6">
      <div className="p-4 border border-subtle rounded-lg bg-hover mb-6">
        <p className="text-sm text-muted-foreground">
          <strong>Coverage Heatmap:</strong> See which failure modes are covered by which signals. 
          Green = strong coverage, Yellow = partial, Gray = weak. This shows what you're blind to.
        </p>
      </div>

      {weakCoverageModes.length > 0 && (
        <div className="p-4 border-2 border-yellow-500/50 rounded-lg bg-yellow-500/10">
          <div className="font-semibold mb-2">High-Severity Failure Modes with Weak Coverage</div>
          <div className="text-sm text-muted-foreground mb-3">
            {weakCoverageModes.length} failure mode(s) need better signal coverage
          </div>
          <div className="space-y-2">
            {weakCoverageModes.map((mode) => {
              const fm = system.failureModes.find(f => f.id === mode.failureModeId);
              return fm ? (
                <div key={mode.failureModeId} className="text-sm">
                  <strong>{fm.name}</strong> - {mode.signalCount} signal(s), {Math.round(mode.coverageScore)}% coverage
                </div>
              ) : null;
            })}
          </div>
        </div>
      )}

      <div className="border border-subtle rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-subtle bg-hover">
              <tr>
                <th className="text-left p-3 text-sm font-medium sticky left-0 bg-hover z-10 min-w-[200px]">
                  Failure Mode
                </th>
                {system.signals.map((signal) => (
                  <th
                    key={signal.id}
                    className="text-left p-3 text-sm font-medium min-w-[150px]"
                  >
                    <div className="font-medium">{signal.name}</div>
                    <div className="text-xs text-muted-foreground font-normal mt-1">
                      {signal.category}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {system.failureModes.map((fm) => (
                <tr key={fm.id} className="border-b border-subtle">
                  <td className="p-3 sticky left-0 bg-background z-10">
                    <div className="font-medium">{fm.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Severity: {fm.severity}/5 • Detectability: {fm.detectability}/5
                    </div>
                  </td>
                  {system.signals.map((signal) => {
                    const strength = getCellStrength(fm.id, signal.id);
                    const isClickable = strength !== 'none';
                    
                    return (
                      <td
                        key={signal.id}
                        onClick={() => isClickable && setSelectedCell({ fmId: fm.id, signalId: signal.id })}
                        className={`p-3 border-l border-subtle ${getCellColor(strength)} ${
                          isClickable ? 'cursor-pointer hover:opacity-80' : ''
                        }`}
                      >
                        {strength !== 'none' && (
                          <div className="text-xs font-medium capitalize">{strength}</div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500/20 border border-green-500/50 rounded"></div>
          <span>Strong Coverage</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-500/20 border border-yellow-500/50 rounded"></div>
          <span>Partial Coverage</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-500/10 border border-gray-500/30 rounded"></div>
          <span>Weak Coverage</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-transparent border border-subtle rounded"></div>
          <span>No Coverage</span>
        </div>
      </div>

      {selectedCoverage && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4">
          <div className="bg-background border border-subtle rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Coverage Details</h3>
              <button
                onClick={() => setSelectedCell(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Failure Mode</div>
                <div className="font-medium">
                  {system.failureModes.find(fm => fm.id === selectedCoverage.failureModeId)?.name}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Signal</div>
                <div className="font-medium">
                  {system.signals.find(s => s.id === selectedCoverage.signalId)?.name}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Coverage Strength</div>
                <div className="font-medium capitalize">{selectedCoverage.strength}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Reason</div>
                <div className="text-sm">{selectedCoverage.reason}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
