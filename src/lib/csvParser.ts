/**
 * Native CSV parser (no dependencies)
 * Handles header row parsing, quoted values, and case-insensitive header matching
 */

export interface ParsedCSVRow {
  [key: string]: string;
}

export interface CSVParseResult {
  headers: string[];
  rows: ParsedCSVRow[];
  rawRows: string[][];
}

/**
 * Parse a CSV string into structured data
 */
export function parseCSV(content: string): CSVParseResult {
  const lines = splitCSVLines(content);

  if (lines.length === 0) {
    return { headers: [], rows: [], rawRows: [] };
  }

  const headers = parseCSVLine(lines[0]).map(h => h.trim().toLowerCase());
  const rawRows: string[][] = [];
  const rows: ParsedCSVRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // Skip empty lines

    const values = parseCSVLine(line);
    rawRows.push(values);

    const row: ParsedCSVRow = {};
    headers.forEach((header, index) => {
      row[header] = values[index]?.trim() ?? '';
    });
    rows.push(row);
  }

  return { headers, rows, rawRows };
}

/**
 * Split CSV content into lines, handling quoted newlines
 */
function splitCSVLines(content: string): string[] {
  const lines: string[] = [];
  let currentLine = '';
  let inQuotes = false;

  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const nextChar = content[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        currentLine += '""';
        i++;
      } else {
        inQuotes = !inQuotes;
        currentLine += char;
      }
    } else if ((char === '\n' || (char === '\r' && nextChar === '\n')) && !inQuotes) {
      lines.push(currentLine);
      currentLine = '';
      if (char === '\r') i++; // Skip \n in \r\n
    } else if (char === '\r' && !inQuotes) {
      lines.push(currentLine);
      currentLine = '';
    } else {
      currentLine += char;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

/**
 * Parse a single CSV line into values, handling quoted fields
 */
function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let currentValue = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (!inQuotes) {
        inQuotes = true;
      } else if (nextChar === '"') {
        // Escaped quote inside quoted field
        currentValue += '"';
        i++;
      } else {
        inQuotes = false;
      }
    } else if (char === ',' && !inQuotes) {
      values.push(currentValue);
      currentValue = '';
    } else {
      currentValue += char;
    }
  }

  values.push(currentValue);
  return values;
}

/**
 * Get a value from a row by header name (case-insensitive)
 */
export function getRowValue(row: ParsedCSVRow, headerName: string): string | undefined {
  const normalizedName = headerName.toLowerCase();
  return row[normalizedName];
}

/**
 * Check if required headers are present (case-insensitive)
 */
export function hasRequiredHeaders(
  headers: string[],
  required: string[]
): { valid: boolean; missing: string[] } {
  const normalizedHeaders = headers.map(h => h.toLowerCase());
  const missing = required.filter(r => !normalizedHeaders.includes(r.toLowerCase()));
  return {
    valid: missing.length === 0,
    missing,
  };
}
