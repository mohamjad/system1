'use client';

import Link from 'next/link';
import { loadSystems } from '@/lib/storage';
import { useEffect, useState } from 'react';
import { System } from '@/types';
import { SystemCard } from '@/components/SystemCard';
import { reevaluateSystem } from '@/lib/scoring';

export default function Home() {
  const [systems, setSystems] = useState<System[]>([]);
  const [showFullExplanation, setShowFullExplanation] = useState(false);

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
                <div className="font-medium mb-1">Get System Health</div>
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
            
            {!showFullExplanation ? (
              <>
                {/* Short Preview */}
                <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                  Most monitoring shows you what broke yesterday. This framework shows you what's breaking tomorrow—before it happens.
                </p>

                <div className="mb-12 p-6 border border-subtle rounded-lg">
                  <h2 className="font-semibold mb-3">Use This When</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-1 h-1 rounded-full bg-foreground mt-2"></div>
                      <div>
                        <div className="font-medium mb-1">Things feel off but nothing is alerting</div>
                        <div className="text-muted-foreground">Your gut says something's wrong, but dashboards look fine</div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-1 h-1 rounded-full bg-foreground mt-2"></div>
                      <div>
                        <div className="font-medium mb-1">Metrics look fine but outcomes aren't</div>
                        <div className="text-muted-foreground">Success rates are good, but business results are declining</div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-1 h-1 rounded-full bg-foreground mt-2"></div>
                      <div>
                        <div className="font-medium mb-1">Failures keep repeating in new ways</div>
                        <div className="text-muted-foreground">You fix one issue, but similar problems keep appearing</div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-1 h-1 rounded-full bg-foreground mt-2"></div>
                      <div>
                        <div className="font-medium mb-1">You want to know what you're blind to</div>
                        <div className="text-muted-foreground">Understand which failure modes have weak or no detection</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-start max-w-2xl mx-auto mb-12">
                  <div className="flex-1 min-w-0">
                    <Link
                      href="/systems"
                      className="block px-8 py-4 text-center rounded-lg transition-colors text-lg font-semibold border-2"
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
                      Preview Demo
                    </Link>
                    <p className="text-xs text-muted-foreground mt-3 text-center">
                      Explore 3 pre-configured systems with signals, failure modes, incidents, and the learning loop in action
                    </p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <button
                      onClick={() => setShowFullExplanation(true)}
                      className="block w-full px-8 py-4 border-2 border-subtle font-semibold rounded-lg hover-subtle transition-colors text-center text-lg"
                    >
                      Read Explanation
                    </button>
                    <p className="text-xs text-muted-foreground mt-3 text-center">
                      Understand how the framework works and why it's different from traditional monitoring
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Full Explanation */}
                <div className="mb-8">
                  <button
                    onClick={() => setShowFullExplanation(false)}
                    className="text-sm text-muted-foreground hover:text-foreground mb-4"
                  >
                    ← Back to preview
                  </button>
                  
                  <div className="space-y-6">
                    <div className="p-6 border border-subtle rounded-lg bg-hover">
                      <h2 className="font-semibold mb-3">The Problem</h2>
                      <p className="text-sm text-muted-foreground mb-4">
                        Most monitoring tools show you what happened yesterday. By the time you see a spike in errors or a drop in revenue, 
                        the damage is done. You're reacting, not preventing.
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Traditional dashboards are lagging indicators. They tell you something broke after it's already broken. 
                        By then, customers are affected, revenue is lost, and trust is damaged.
                      </p>
                    </div>

                    <div className="p-6 border border-subtle rounded-lg">
                      <h2 className="font-semibold mb-3">The Solution</h2>
                      <p className="text-sm text-muted-foreground mb-4">
                        This framework helps you define <strong>leading indicators</strong>—signals that fire <em>before</em> things break. 
                        Instead of monitoring what happened, you monitor what's about to happen.
                      </p>
                      <p className="text-sm text-muted-foreground mb-4">
                        When an incident occurs, the framework doesn't just log it. It analyzes what would have caught it earlier and 
                        suggests improvements. Over time, you catch problems earlier and earlier.
                      </p>
                      <p className="text-sm text-muted-foreground">
                        This is evaluation-environment thinking: not just measuring outcomes, but reasoning about when and why systems fail, 
                        and how early that could have been known.
                      </p>
                    </div>

                    <div className="p-6 border border-subtle rounded-lg">
                      <h2 className="font-semibold mb-3">Key Features</h2>
                      <div className="space-y-4 text-sm">
                        <div>
                          <div className="font-medium mb-1">Early Detection Simulator</div>
                          <div className="text-muted-foreground">
                            See when signals should have fired before an incident. Shows the earliest moment intervention was possible, 
                            not when alerts fired.
                          </div>
                        </div>
                        <div>
                          <div className="font-medium mb-1">Coverage Heatmap</div>
                          <div className="text-muted-foreground">
                            Visualize which failure modes are covered by which signals. See what you're blind to right now.
                          </div>
                        </div>
                        <div>
                          <div className="font-medium mb-1">Failure Learning Loop</div>
                          <div className="text-muted-foreground">
                            When something breaks, the framework learns. It suggests new signals, threshold adjustments, and stress tests 
                            that would have caught it earlier.
                          </div>
                        </div>
                        <div>
                          <div className="font-medium mb-1">System Drift View</div>
                          <div className="text-muted-foreground">
                            See how health changes over time. No spikes, just gradual drift. Systems that look fine until they don't.
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 border border-subtle rounded-lg">
                      <h2 className="font-semibold mb-3">How It's Different</h2>
                      <div className="space-y-3 text-sm">
                        <div className="flex gap-3">
                          <div className="flex-shrink-0 w-1 h-1 rounded-full bg-foreground mt-2"></div>
                          <div>
                            <strong>Leading indicators, not lagging metrics:</strong> Signals fire before failures, not after
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <div className="flex-shrink-0 w-1 h-1 rounded-full bg-foreground mt-2"></div>
                          <div>
                            <strong>Counterfactual reasoning:</strong> Shows when intervention was possible, not just when alerts fired
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <div className="flex-shrink-0 w-1 h-1 rounded-full bg-foreground mt-2"></div>
                          <div>
                            <strong>Coverage thinking:</strong> Focuses on what you're blind to, not just what you're monitoring
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <div className="flex-shrink-0 w-1 h-1 rounded-full bg-foreground mt-2"></div>
                          <div>
                            <strong>Self-improving:</strong> Learns from incidents to improve detection over time
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-start max-w-2xl mx-auto">
                  <div className="flex-1 min-w-0">
                    <Link
                      href="/systems"
                      className="block px-8 py-4 text-center rounded-lg transition-colors text-lg font-semibold border-2"
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
                      Preview Demo
                    </Link>
                    <p className="text-xs text-muted-foreground mt-3 text-center">
                      Explore 3 pre-configured systems
                    </p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href="https://github.com/mohamjad/system1"
                      target="_blank"
                      className="block w-full px-8 py-4 border-2 border-subtle font-semibold rounded-lg hover-subtle transition-colors text-center text-lg"
                    >
                      View Documentation
                    </Link>
                    <p className="text-xs text-muted-foreground mt-3 text-center">
                      Read full technical documentation
                    </p>
                  </div>
                </div>
              </>
            )}

            <div className="mt-12 grid grid-cols-3 gap-6">
              <div className="p-4 border border-subtle rounded-lg">
                <div className="text-2xl font-bold mb-2">8-10</div>
                <div className="text-sm text-muted-foreground">Signals per system</div>
              </div>
              <div className="p-4 border border-subtle rounded-lg">
                <div className="text-2xl font-bold mb-2">1-6</div>
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
