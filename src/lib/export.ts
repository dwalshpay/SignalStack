import { saveAs } from 'file-saver';
import type {
  CalculatedValue,
  AudienceSegment,
  FunnelStep,
  BusinessMetrics
} from '@/types';
import { formatCurrency, formatPercentage } from './calculations';

/**
 * Export calculated values to CSV
 */
export function exportToCSV(
  values: CalculatedValue[],
  segments: AudienceSegment[],
  currency: string = 'AUD'
): string {
  const headers = [
    'Event',
    'Monthly Volume',
    'Volume Status',
    'Conversion Rate',
    'Cumulative Probability',
    'Base Value',
    ...segments.map(s => `${s.name} Value`),
    'Recommendation'
  ];

  const rows = values.map(v => [
    v.stepName,
    v.monthlyVolume.toString(),
    v.volumeStatus,
    formatPercentage(v.conversionRate),
    formatPercentage(v.cumulativeProbability * 100, 2),
    formatCurrency(v.baseValue, currency),
    ...segments.map(s => formatCurrency(v.segmentValues[s.id] || 0, currency)),
    v.recommendation
  ]);

  return [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');
}

/**
 * Export full state to JSON
 */
export function exportToJSON(state: {
  funnel: FunnelStep[];
  metrics: BusinessMetrics;
  segments: AudienceSegment[];
}): string {
  return JSON.stringify({
    version: 1,
    exportedAt: new Date().toISOString(),
    ...state,
  }, null, 2);
}

/**
 * Download file using FileSaver.js
 */
export function downloadFile(
  content: string,
  filename: string,
  type: string
): void {
  const blob = new Blob([content], { type });
  saveAs(blob, filename);
}

/**
 * Download CSV export
 */
export function downloadCSV(
  values: CalculatedValue[],
  segments: AudienceSegment[],
  currency: string = 'AUD'
): void {
  const csv = exportToCSV(values, segments, currency);
  const timestamp = new Date().toISOString().split('T')[0];
  downloadFile(csv, `signalstack-values-${timestamp}.csv`, 'text/csv;charset=utf-8');
}

/**
 * Download JSON export
 */
export function downloadJSON(state: {
  funnel: FunnelStep[];
  metrics: BusinessMetrics;
  segments: AudienceSegment[];
}): void {
  const json = exportToJSON(state);
  const timestamp = new Date().toISOString().split('T')[0];
  downloadFile(json, `signalstack-config-${timestamp}.json`, 'application/json');
}

/**
 * Copy values to clipboard (formatted for spreadsheets)
 */
export async function copyToClipboard(
  values: CalculatedValue[],
  segments: AudienceSegment[],
  _currency: string = 'AUD'
): Promise<boolean> {
  try {
    // Tab-separated for easy paste into spreadsheets
    const headers = [
      'Event',
      'Volume',
      'Status',
      'Base Value',
      ...segments.map(s => s.name),
    ].join('\t');

    const rows = values.map(v => [
      v.stepName,
      v.monthlyVolume,
      v.volumeStatus,
      v.baseValue.toFixed(2),
      ...segments.map(s => (v.segmentValues[s.id] || 0).toFixed(2)),
    ].join('\t'));

    const text = [headers, ...rows].join('\n');
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
