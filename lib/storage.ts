import { System } from '@/types';
import { demoSystems } from './demo-data';
import { reevaluateSystem } from './scoring';

const STORAGE_KEY = 'system1-systems';

/**
 * Load systems from localStorage or return demo data
 */
export function loadSystems(): System[] {
  if (typeof window === 'undefined') {
    return demoSystems;
  }
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Re-evaluate all systems to ensure scores are current
      return parsed.map((system: System) => reevaluateSystem(system));
    }
  } catch (error) {
    console.error('Failed to load systems from storage:', error);
  }
  
  // Initialize with demo data and re-evaluate
  const reevaluated = demoSystems.map((system: System) => reevaluateSystem(system));
  saveSystems(reevaluated);
  return reevaluated;
}

/**
 * Save systems to localStorage
 */
export function saveSystems(systems: System[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(systems));
  } catch (error) {
    console.error('Failed to save systems to storage:', error);
  }
}

/**
 * Get a single system by ID
 */
export function getSystem(id: string): System | undefined {
  const systems = loadSystems();
  return systems.find(s => s.id === id);
}

/**
 * Update a system
 */
export function updateSystem(updatedSystem: System): void {
  const systems = loadSystems();
  const index = systems.findIndex(s => s.id === updatedSystem.id);
  
  if (index >= 0) {
    systems[index] = updatedSystem;
  } else {
    systems.push(updatedSystem);
  }
  
  saveSystems(systems);
}

/**
 * Export systems as JSON
 */
export function exportSystems(): string {
  const systems = loadSystems();
  return JSON.stringify(systems, null, 2);
}

/**
 * Import systems from JSON
 */
export function importSystems(json: string): System[] {
  try {
    const parsed = JSON.parse(json);
    if (Array.isArray(parsed)) {
      // Re-evaluate all systems
      const reevaluated = parsed.map((system: System) => reevaluateSystem(system));
      saveSystems(reevaluated);
      return reevaluated;
    }
    throw new Error('Invalid format');
  } catch (error) {
    console.error('Failed to import systems:', error);
    throw error;
  }
}

/**
 * Reset to demo data
 */
export function resetToDemo(): void {
  saveSystems(demoSystems);
}
