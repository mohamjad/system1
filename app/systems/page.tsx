'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { System } from '@/types';
import { loadSystems } from '@/lib/storage';
import { SystemCard } from '@/components/SystemCard';
import { ExportImport } from '@/components/ExportImport';
import { reevaluateSystem } from '@/lib/scoring';

export default function SystemsPage() {
  const [systems, setSystems] = useState<System[]>([]);

  useEffect(() => {
    const loaded = loadSystems();
    // Ensure all systems are properly evaluated
    const evaluated = loaded.map(system => reevaluateSystem(system));
    setSystems(evaluated);
  }, []);

  return (
    <div className="min-h-screen">
      <div className="border-b border-subtle">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Systems</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Monitor system health with leading indicators. Click any system to see detailed health evaluation.
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
            <div className="mb-6 p-4 border border-subtle rounded-lg bg-hover">
              <p className="text-sm text-muted-foreground">
                <strong>Demo systems:</strong> These are pre-configured examples showing how the framework works. 
                Each system has signals, failure modes, incidents, and stress tests. Click any system to explore.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
