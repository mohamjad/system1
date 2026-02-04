'use client';

import { useState } from 'react';
import { exportSystems, importSystems, resetToDemo } from '@/lib/storage';
import { useRouter } from 'next/navigation';

export function ExportImport() {
  const [showMenu, setShowMenu] = useState(false);
  const router = useRouter();

  const handleExport = () => {
    const json = exportSystems();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system1-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowMenu(false);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const json = event.target?.result as string;
          importSystems(json);
          router.refresh();
          setShowMenu(false);
        } catch (error) {
          alert('Failed to import. Please check the file format.');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleReset = () => {
    if (confirm('Reset to demo data? This will replace all current systems.')) {
      resetToDemo();
      router.refresh();
      setShowMenu(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="px-4 py-2 border border-subtle rounded-lg hover-subtle transition-colors text-sm font-medium"
      >
        ⋯
      </button>
      
      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 mt-2 w-48 border border-subtle rounded-lg bg-background shadow-lg z-20">
            <button
              onClick={handleExport}
              className="w-full text-left px-4 py-2 text-sm hover-subtle transition-colors rounded-t-lg"
            >
              Export System Config
            </button>
            <button
              onClick={handleImport}
              className="w-full text-left px-4 py-2 text-sm hover-subtle transition-colors border-t border-subtle"
            >
              Import System Config
            </button>
            <button
              onClick={handleReset}
              className="w-full text-left px-4 py-2 text-sm hover-subtle transition-colors border-t border-subtle rounded-b-lg"
            >
              Reset to Demo
            </button>
          </div>
        </>
      )}
    </div>
  );
}
