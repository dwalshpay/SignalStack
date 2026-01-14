import { saveAs } from 'file-saver';

export function useExport() {
  const copyCode = async (code: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(code);
      return true;
    } catch {
      // Fallback for browsers without clipboard API
      try {
        const textarea = document.createElement('textarea');
        textarea.value = code;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        return true;
      } catch {
        return false;
      }
    }
  };

  const downloadCode = (code: string, filename: string, mimeType: string = 'text/plain') => {
    const blob = new Blob([code], { type: `${mimeType};charset=utf-8` });
    saveAs(blob, filename);
  };

  const downloadCSV = (csv: string, filename: string) => {
    downloadCode(csv, filename, 'text/csv');
  };

  const downloadJSON = (data: object, filename: string) => {
    const json = JSON.stringify(data, null, 2);
    downloadCode(json, filename, 'application/json');
  };

  const downloadJS = (code: string, filename: string) => {
    downloadCode(code, filename, 'text/javascript');
  };

  const getTimestamp = () => new Date().toISOString().split('T')[0];

  return {
    copyCode,
    downloadCode,
    downloadCSV,
    downloadJSON,
    downloadJS,
    getTimestamp,
  };
}
