'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { System } from '@/types';
import { loadSystems } from '@/lib/storage';
import { SystemCard } from '@/components/SystemCard';
import { ExportImport } from '@/components/ExportImport';
import { reevaluateSystem } from '@/lib/scoring';
import { getSignalStatus } from '@/lib/scoring';
import { generateHealthHistory } from '@/lib/drift';

export default function SystemsPage() {
  const [systems, setSystems] = useState<System[]>([]);

  useEffect(() => {
    const loaded = loadSystems();
    // Ensure all systems are properly evaluated
    const evaluated = loaded.map(system => reevaluateSystem(system));
    setSystems(evaluated);
  }, []);

  // Calculate summary stats
  const summary = useMemo(() => {
    const activeAlerts = systems.reduce((count, system) => {
      return count + (system.signals || []).filter(s => {
        try {
          return getSignalStatus(s) === 'triggered';
        } catch {
          return false;
        }
      }).length;
    }, 0);

    const systemsWithDrift = systems.filter(system => {
      const history = generateHealthHistory(system, 7);
      if (history.length < 2) return false;
      const recent = history.slice(-3);
      const older = history.slice(0, 3);
      const recentAvg = recent.reduce((sum, p) => sum + p.healthScore, 0) / recent.length;
      const olderAvg = older.reduce((sum, p) => sum + p.healthScore, 0) / older.length;
      return Math.abs(recentAvg - olderAvg) > 5;
    }).length;

    return {
      totalSystems: systems.length,
      activeAlerts,
      systemsWithDrift
    };
  }, [systems]);

  return (
    <div className="min-h-screen">
      <div className="border-b border-subtle">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Systems</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Monitor system health and identify drift before failures occur
              </p>
            </div>
            <div className="flex items-center gap-3">
              <ExportImport />
              <Link
                href="/systems/new"
                className="px-4 py-2 border border-subtle rounded-lg hover-subtle transition-colors text-sm font-medium"
              >
                Create System
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {systems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No systems yet</p>
            <Link
              href="/systems/new"
              className="px-4 py-2 border border-subtle rounded-lg hover-subtle transition-colors text-sm font-medium inline-block"
            >
              Create Your First System
            </Link>
          </div>
        ) : (
          <>
            {summary.totalSystems > 0 && (
              <div className="mb-6 text-sm text-muted-foreground">
                {summary.totalSystems} system{summary.totalSystems !== 1 ? 's' : ''} monitored · {summary.activeAlerts} active alert{summary.activeAlerts !== 1 ? 's' : ''} · Drift visible in {summary.systemsWithDrift} system{summary.systemsWithDrift !== 1 ? 's' : ''}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {systems.map((system) => (
                <SystemCard key={system.id} system={system} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
