'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { System } from '@/types';
import { loadSystems, saveSystems } from '@/lib/storage';
import { reevaluateSystem } from '@/lib/scoring';

export default function NewSystemPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) return;

    const newSystem: System = {
      id: `system-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      signals: [],
      failureModes: [],
      incidents: [],
      stressTests: [],
      lastEvaluation: new Date().toISOString(),
      healthScore: 100,
      riskScore: 0,
      confidenceScore: 0,
      riskLevel: 'low',
      topRisks: []
    };

    const systems = loadSystems();
    const evaluated = reevaluateSystem(newSystem);
    systems.push(evaluated);
    saveSystems(systems);
    
    router.push(`/systems/${evaluated.id}`);
  };

  return (
    <div className="min-h-screen">
      <div className="border-b border-subtle">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <button
            onClick={() => router.push('/systems')}
            className="text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            ← Back to Systems
          </button>
          <h1 className="text-2xl font-semibold">Create New System</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="border border-subtle rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">System Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-subtle rounded-lg"
                placeholder="e.g., Payment Processing Pipeline"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-subtle rounded-lg"
                rows={3}
                placeholder="Brief description of what this system monitors"
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                className="px-6 py-2 bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity"
              >
                Create System
              </button>
              <button
                type="button"
                onClick={() => router.push('/systems')}
                className="px-6 py-2 border border-subtle rounded-lg hover-subtle transition-colors"
              >
                Cancel
              </button>
            </div>

            <div className="pt-4 border-t border-subtle">
              <p className="text-sm text-muted-foreground">
                After creating, you can add signals, failure modes, and stress tests in the system detail page.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
