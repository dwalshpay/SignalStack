/**
 * CSV import validation for funnel steps
 */

import { parseCSV, hasRequiredHeaders, getRowValue, type ParsedCSVRow } from './csvParser';
import type { FunnelStep } from '@/types';

export interface CSVImportError {
  row?: number;
  field?: string;
  message: string;
}

export interface CSVImportWarning {
  row?: number;
  field?: string;
  message: string;
}

export interface ParsedFunnelStep {
  name: string;
  conversionRate: number;
  monthlyVolume: number;
  eventName: string;
}

export interface CSVImportResult {
  isValid: boolean;
  errors: CSVImportError[];
  warnings: CSVImportWarning[];
  steps: ParsedFunnelStep[];
}

const REQUIRED_HEADERS = ['name', 'conversion_rate', 'monthly_volume'];

const MIN_STEPS = 2;
const MAX_STEPS = 10;
const MIN_CONVERSION_RATE = 0.1;
const MAX_CONVERSION_RATE = 100;

/**
 * Validate and parse CSV content into funnel steps
 */
export function validateAndParseCSV(content: string): CSVImportResult {
  const errors: CSVImportError[] = [];
  const warnings: CSVImportWarning[] = [];
  const steps: ParsedFunnelStep[] = [];

  // Parse CSV
  const { headers, rows } = parseCSV(content);

  // Check for required headers
  const headerCheck = hasRequiredHeaders(headers, REQUIRED_HEADERS);
  if (!headerCheck.valid) {
    errors.push({
      message: `Missing required columns: ${headerCheck.missing.join(', ')}`,
    });
    return { isValid: false, errors, warnings, steps };
  }

  // Check for empty file
  if (rows.length === 0) {
    errors.push({
      message: 'CSV file contains no data rows',
    });
    return { isValid: false, errors, warnings, steps };
  }

  // Validate row count
  if (rows.length < MIN_STEPS) {
    errors.push({
      message: `At least ${MIN_STEPS} funnel steps are required (found ${rows.length})`,
    });
  }

  if (rows.length > MAX_STEPS) {
    errors.push({
      message: `Maximum ${MAX_STEPS} funnel steps allowed (found ${rows.length})`,
    });
  }

  // Validate each row
  rows.forEach((row, index) => {
    const rowNum = index + 2; // +2 for 1-indexed and header row
    const result = validateRow(row, rowNum);

    errors.push(...result.errors);
    warnings.push(...result.warnings);

    if (result.step) {
      steps.push(result.step);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    steps,
  };
}

interface RowValidationResult {
  errors: CSVImportError[];
  warnings: CSVImportWarning[];
  step: ParsedFunnelStep | null;
}

function validateRow(row: ParsedCSVRow, rowNum: number): RowValidationResult {
  const errors: CSVImportError[] = [];
  const warnings: CSVImportWarning[] = [];

  // Validate name
  const name = getRowValue(row, 'name') ?? '';
  if (!name.trim()) {
    errors.push({
      row: rowNum,
      field: 'name',
      message: `Row ${rowNum}: Name is required`,
    });
  }

  // Validate conversion_rate
  const conversionRateStr = getRowValue(row, 'conversion_rate') ?? '';
  const conversionRate = parseFloat(conversionRateStr);

  if (!conversionRateStr.trim()) {
    errors.push({
      row: rowNum,
      field: 'conversion_rate',
      message: `Row ${rowNum}: Conversion rate is required`,
    });
  } else if (isNaN(conversionRate)) {
    errors.push({
      row: rowNum,
      field: 'conversion_rate',
      message: `Row ${rowNum}: Conversion rate must be a number`,
    });
  } else if (conversionRate < MIN_CONVERSION_RATE || conversionRate > MAX_CONVERSION_RATE) {
    errors.push({
      row: rowNum,
      field: 'conversion_rate',
      message: `Row ${rowNum}: Conversion rate must be between ${MIN_CONVERSION_RATE} and ${MAX_CONVERSION_RATE}`,
    });
  }

  // Validate monthly_volume
  const monthlyVolumeStr = getRowValue(row, 'monthly_volume') ?? '';
  const monthlyVolume = parseInt(monthlyVolumeStr, 10);

  if (!monthlyVolumeStr.trim()) {
    errors.push({
      row: rowNum,
      field: 'monthly_volume',
      message: `Row ${rowNum}: Monthly volume is required`,
    });
  } else if (isNaN(monthlyVolume)) {
    errors.push({
      row: rowNum,
      field: 'monthly_volume',
      message: `Row ${rowNum}: Monthly volume must be a number`,
    });
  } else if (monthlyVolume < 0) {
    errors.push({
      row: rowNum,
      field: 'monthly_volume',
      message: `Row ${rowNum}: Monthly volume cannot be negative`,
    });
  }

  // Handle event_name (optional)
  let eventName = getRowValue(row, 'event_name') ?? '';
  if (!eventName.trim()) {
    // Auto-generate from name
    eventName = generateEventName(name);
    if (name.trim()) {
      warnings.push({
        row: rowNum,
        field: 'event_name',
        message: `Row ${rowNum}: Event name auto-generated as "${eventName}"`,
      });
    }
  }

  // Only create step if no errors for this row
  const rowHasErrors = errors.some(e => e.row === rowNum);

  return {
    errors,
    warnings,
    step: rowHasErrors ? null : {
      name: name.trim(),
      conversionRate,
      monthlyVolume,
      eventName,
    },
  };
}

/**
 * Generate an event name from a step name
 * Converts to snake_case
 */
export function generateEventName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '_');
}

/**
 * Convert parsed steps to FunnelStep format
 */
export function convertToFunnelSteps(
  parsedSteps: ParsedFunnelStep[],
  startOrder: number = 0
): Omit<FunnelStep, 'id'>[] {
  return parsedSteps.map((step, index) => ({
    name: step.name,
    order: startOrder + index,
    conversionRate: step.conversionRate,
    monthlyVolume: step.monthlyVolume,
    isTrackable: true,
    eventName: step.eventName,
  }));
}

/**
 * Generate CSV template content
 */
export function generateCSVTemplate(): string {
  return `name,conversion_rate,monthly_volume,event_name
Website Visit,8,10000,website_visit
Email Captured,25,800,email_captured
Application Started,60,200,application_started
Application Completed,80,160,application_completed`;
}
