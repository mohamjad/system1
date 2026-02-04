'use client';

import Link from 'next/link';
import { loadSystems } from '@/lib/storage';
import { useEffect, useState } from 'react';
import { System } from '@/types';
import { SystemCard } from '@/components/SystemCard';
import { reevaluateSystem } from '@/lib/scoring';

export default function Home() {
  const [systems, setSystems] = useState<System[]>([]);

  useEffect(() => {
    const loaded = loadSystems();
    // Ensure all systems are properly evaluated
    const evaluated = loaded.map(system => reevaluateSystem(system));
    setSystems(evaluated);
  }, []);

  return (
    <div className="min-h-screen flex">
      {/* Left Sidebar - Examples & Navigation */}
      <aside className="w-80 border-r border-subtle p-6 overflow-y-auto">
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">What is this?</h2>
          <p className="text-sm text-muted-foreground mb-4">
            A framework that catches system problems <strong>before</strong> they become incidents. 
            Instead of waiting for alerts after something breaks, you define leading indicators that signal trouble early.
          </p>
        </div>

        <div className="mb-8">
          <h3 className="text-sm font-semibold mb-3">How it works</h3>
          <div className="space-y-3 text-sm">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-medium">
                1
              </div>
              <div>
                <div className="font-medium mb-1">Define Signals</div>
                <div className="text-muted-foreground text-xs">
                  Set up leading indicators (e.g., "refund rate", "conversion drop") that catch problems early
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-medium">
                2
              </div>
              <div>
                <div className="font-medium mb-1">Get Health Score</div>
                <div className="text-muted-foreground text-xs">
                  The framework evaluates your system and gives you a health score with explanations
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-medium">
                3
              </div>
              <div>
                <div className="font-medium mb-1">Learn from Incidents</div>
                <div className="text-muted-foreground text-xs">
                  When something breaks, the framework suggests new signals or threshold adjustments
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-sm font-semibold mb-3">Example Systems</h3>
          <div className="space-y-2">
            {systems.slice(0, 3).map((system) => (
              <Link
                key={system.id}
                href={`/systems/${system.id}`}
                className="block p-3 border border-subtle rounded-lg hover-subtle transition-colors"
              >
                <div className="font-medium text-sm mb-1">{system.name}</div>
                <div className="text-xs text-muted-foreground line-clamp-1">
                  {system.description}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-xs font-medium ${
                    system.riskLevel === 'low' ? 'risk-low' :
                    system.riskLevel === 'medium' ? 'risk-medium' : 'risk-high'
                  }`}>
                    {Math.round(system.healthScore)} Health
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="pt-6 border-t border-subtle">
          <Link
            href="/systems"
            className="block w-full px-4 py-2 text-center rounded-lg transition-colors text-sm font-medium border-2"
            style={{
              backgroundColor: 'var(--foreground)',
              color: 'var(--background)',
              borderColor: 'var(--foreground)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            View All Systems →
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <div className="flex-1 flex items-center justify-center p-12">
          <div className="max-w-3xl w-full">
            <h1 className="text-5xl font-bold mb-6">
              Evaluate whether systems are actually healthy.
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Leading indicators plus failure learning. Not dashboards that tell you after it's too late.
            </p>
            
            <div className="mb-12 p-6 border border-subtle rounded-lg bg-hover">
              <h2 className="font-semibold mb-3">The Problem</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Most monitoring tools show you what happened yesterday. By the time you see a spike in errors or a drop in revenue, 
                the damage is done. You're reacting, not preventing.
              </p>
              <h2 className="font-semibold mb-3 mt-6">The Solution</h2>
              <p className="text-sm text-muted-foreground">
                This framework helps you define <strong>leading indicators</strong>—signals that fire <em>before</em> things break. 
                When an incident happens, it learns and suggests improvements. Over time, you catch problems earlier and earlier.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-start max-w-2xl mx-auto">
              <div className="flex-1 min-w-0">
                <Link
                  href="/systems"
                  className="block px-8 py-4 bg-foreground text-background font-semibold rounded-lg hover:opacity-90 transition-opacity text-center text-lg"
                  style={{
                    backgroundColor: 'var(--foreground)',
                    color: 'var(--background)',
                    border: '2px solid var(--foreground)'
                  }}
                >
                  Open Demo
                </Link>
                <p className="text-xs text-muted-foreground mt-3 text-center">
                  Explore 3 pre-configured systems with signals, failure modes, incidents, and the learning loop in action
                </p>
              </div>
              <div className="flex-1 min-w-0">
                <Link
                  href="/systems/new"
                  className="block px-8 py-4 border-2 border-subtle font-medium rounded-lg hover-subtle transition-colors text-center text-lg"
                >
                  Create System
                </Link>
                <p className="text-xs text-muted-foreground mt-3 text-center">
                  Start monitoring your own system by defining signals and failure modes
                </p>
              </div>
            </div>

            <div className="mt-12 grid grid-cols-3 gap-6">
              <div className="p-4 border border-subtle rounded-lg">
                <div className="text-2xl font-bold mb-2">8-15</div>
                <div className="text-sm text-muted-foreground">Signals per system</div>
              </div>
              <div className="p-4 border border-subtle rounded-lg">
                <div className="text-2xl font-bold mb-2">5-8</div>
                <div className="text-sm text-muted-foreground">Failure modes tracked</div>
              </div>
              <div className="p-4 border border-subtle rounded-lg">
                <div className="text-2xl font-bold mb-2">100%</div>
                <div className="text-sm text-muted-foreground">Client-side only</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
