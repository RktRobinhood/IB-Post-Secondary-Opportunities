import { loadRecords } from '../../src/lib/records.mjs';
/** Read-only runtime indexes, built only from school and shared country records. */
export const { graph } = await loadRecords();
const names = { 'application-routes': 'applicationRoutes', 'application-systems': 'applicationSystems', 'context-notes': 'contextNotes' };
export const collection = (name) => [...(graph[names[name] || name]?.values() || [])];
