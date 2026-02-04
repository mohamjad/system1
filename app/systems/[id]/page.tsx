'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { System } from '@/types';
import { getSystem, updateSystem } from '@/lib/storage';
import { OverviewTab } from '@/components/tabs/OverviewTab';
import { SignalsTab } from '@/components/tabs/SignalsTab';
import { EvaluationTab } from '@/components/tabs/EvaluationTab';
import { StressTestsTab } from '@/components/tabs/StressTestsTab';
import { IncidentsTab } from '@/components/tabs/IncidentsTab';
import { LearningLoopTab } from '@/components/tabs/LearningLoopTab';
import { EarlyDetectionSimulatorTab } from '@/components/tabs/EarlyDetectionSimulatorTab';
import { SystemDriftTab } from '@/components/tabs/SystemDriftTab';
import { CoverageHeatmapTab } from '@/components/tabs/CoverageHeatmapTab';

type Tab = 'overview' | 'signals' | 'evaluation' | 'coverage' | 'stress-tests' | 'incidents' | 'early-detection' | 'drift' | 'learning-loop';

export default function SystemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [system, setSystem] = useState<System | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  useEffect(() => {
    const systemId = params.id as string;
    const loaded = getSystem(systemId);
    if (!loaded) {
      router.push('/systems');
      return;
    }
    setSystem(loaded);
  }, [params.id, router]);

  const handleSystemUpdate = (updated: System) => {
    setSystem(updated);
    updateSystem(updated);
  };

  if (!system) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const tabs: Array<{ id: Tab; label: string }> = [
    { id: 'overview', label: 'Overview' },
    { id: 'signals', label: 'Signals' },
    { id: 'evaluation', label: 'Evaluation' },
    { id: 'stress-tests', label: 'Stress Tests' },
    { id: 'incidents', label: 'Incidents' },
    { id: 'early-detection', label: 'Early Detection Simulator' },
    { id: 'drift', label: 'System Drift' },
    { id: 'learning-loop', label: 'Learning Loop' }
  ];

  return (
    <div className="min-h-screen">
      <div className="border-b border-subtle">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <button
                onClick={() => router.push('/systems')}
                className="text-sm text-muted-foreground hover:text-foreground mb-2"
              >
                ← Back to Systems
              </button>
              <h1 className="text-2xl font-semibold">{system.name}</h1>
              <p className="text-sm text-muted-foreground mt-1">{system.description}</p>
            </div>
          </div>
          
          <div className="flex gap-1 border-t border-subtle pt-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-foreground text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'overview' && (
          <>
            <div className="mb-6 p-4 border border-subtle rounded-lg bg-hover">
              <p className="text-sm text-muted-foreground">
                <strong>Getting started:</strong> Start with the <strong>Overview</strong> tab to see health scores and top risks. 
                Check <strong>Signals</strong> to see what's being monitored. Review <strong>Incidents</strong> and then go to 
                <strong> Learning Loop</strong> to see how the framework improves over time.
              </p>
            </div>
            <OverviewTab system={system} onUpdate={handleSystemUpdate} />
          </>
        )}
        {activeTab === 'signals' && (
          <SignalsTab system={system} onUpdate={handleSystemUpdate} />
        )}
        {activeTab === 'evaluation' && (
          <EvaluationTab system={system} />
        )}
        {activeTab === 'coverage' && (
          <CoverageHeatmapTab system={system} />
        )}
        {activeTab === 'stress-tests' && (
          <StressTestsTab system={system} onUpdate={handleSystemUpdate} />
        )}
        {activeTab === 'incidents' && (
          <IncidentsTab system={system} onUpdate={handleSystemUpdate} />
        )}
        {activeTab === 'early-detection' && (
          <EarlyDetectionSimulatorTab system={system} />
        )}
        {activeTab === 'drift' && (
          <SystemDriftTab system={system} />
        )}
        {activeTab === 'learning-loop' && (
          <LearningLoopTab system={system} onUpdate={handleSystemUpdate} />
        )}
      </div>
    </div>
  );
}
