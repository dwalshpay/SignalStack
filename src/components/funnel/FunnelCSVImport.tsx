import React, { useState, useCallback } from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import {
  validateAndParseCSV,
  generateCSVTemplate,
  type ParsedFunnelStep,
  type CSVImportError,
  type CSVImportWarning,
} from '@/lib/csvImportValidation';

export type ImportMode = 'replace' | 'append';

interface FunnelCSVImportProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (steps: ParsedFunnelStep[], mode: ImportMode) => void;
  currentStepCount: number;
}

export const FunnelCSVImport: React.FC<FunnelCSVImportProps> = ({
  isOpen,
  onClose,
  onImport,
  currentStepCount,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [importMode, setImportMode] = useState<ImportMode>('replace');
  const [parsedSteps, setParsedSteps] = useState<ParsedFunnelStep[]>([]);
  const [errors, setErrors] = useState<CSVImportError[]>([]);
  const [warnings, setWarnings] = useState<CSVImportWarning[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);

  const resetState = useCallback(() => {
    setParsedSteps([]);
    setErrors([]);
    setWarnings([]);
    setFileName(null);
    setImportMode('replace');
  }, []);

  const handleClose = useCallback(() => {
    resetState();
    onClose();
  }, [resetState, onClose]);

  const handleFileUpload = useCallback((file: File) => {
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const result = validateAndParseCSV(content);

      setParsedSteps(result.steps);
      setErrors(result.errors);
      setWarnings(result.warnings);
    };

    reader.onerror = () => {
      setErrors([{ message: 'Failed to read file. Please try again.' }]);
      setParsedSteps([]);
      setWarnings([]);
    };

    reader.readAsText(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file && (file.type === 'text/csv' || file.name.endsWith('.csv'))) {
        handleFileUpload(file);
      } else {
        setErrors([{ message: 'Please upload a CSV file' }]);
        setParsedSteps([]);
        setWarnings([]);
      }
    },
    [handleFileUpload]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileUpload(file);
      }
      // Reset input so the same file can be selected again
      e.target.value = '';
    },
    [handleFileUpload]
  );

  const handleDownloadTemplate = useCallback(() => {
    const template = generateCSVTemplate();
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'funnel_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  const handleImport = useCallback(() => {
    if (parsedSteps.length > 0 && errors.length === 0) {
      onImport(parsedSteps, importMode);
      handleClose();
    }
  }, [parsedSteps, errors, importMode, onImport, handleClose]);

  // Check if append would exceed max steps
  const totalStepsAfterAppend = importMode === 'append'
    ? currentStepCount + parsedSteps.length
    : parsedSteps.length;
  const exceedsMaxSteps = totalStepsAfterAppend > 10;

  const canImport = parsedSteps.length > 0 && errors.length === 0 && !exceedsMaxSteps;

  const footer = (
    <>
      <Button variant="outline" onClick={handleClose}>
        Cancel
      </Button>
      <Button
        variant="primary"
        onClick={handleImport}
        disabled={!canImport}
      >
        Import {parsedSteps.length > 0 ? `${parsedSteps.length} Steps` : ''}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Import Funnel from CSV"
      footer={footer}
      size="lg"
    >
      <div className="space-y-6">
        {/* Drop zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            isDragging
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <div className="text-3xl mb-3">📄</div>
          {fileName ? (
            <p className="text-gray-700 font-medium">{fileName}</p>
          ) : (
            <p className="text-gray-600 mb-2">Drag and drop your CSV file here</p>
          )}
          <p className="text-sm text-gray-500 mb-3">or</p>
          <label className="cursor-pointer inline-block">
            <span className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors text-sm">
              Browse Files
            </span>
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileInputChange}
              className="hidden"
            />
          </label>
        </div>

        {/* Template download */}
        <div className="flex items-center justify-center">
          <button
            onClick={handleDownloadTemplate}
            className="text-sm text-primary-600 hover:text-primary-700 underline"
          >
            Download CSV template
          </button>
        </div>

        {/* Import mode selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Import Mode
          </label>
          <div className="flex gap-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="importMode"
                value="replace"
                checked={importMode === 'replace'}
                onChange={() => setImportMode('replace')}
                className="mr-2 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">Replace existing funnel</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="importMode"
                value="append"
                checked={importMode === 'append'}
                onChange={() => setImportMode('append')}
                className="mr-2 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">Append to existing funnel</span>
            </label>
          </div>
          {importMode === 'append' && currentStepCount > 0 && (
            <p className="mt-1 text-xs text-gray-500">
              Current funnel has {currentStepCount} steps
            </p>
          )}
        </div>

        {/* Errors */}
        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-red-800 mb-2">
              Errors ({errors.length})
            </h4>
            <ul className="text-sm text-red-700 space-y-1">
              {errors.map((error, index) => (
                <li key={index}>{error.message}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Append exceeds max warning */}
        {exceedsMaxSteps && errors.length === 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-700">
              Cannot append {parsedSteps.length} steps to existing {currentStepCount} steps.
              Maximum allowed is 10 steps total. Use "Replace" mode or reduce steps in CSV.
            </p>
          </div>
        )}

        {/* Warnings */}
        {warnings.length > 0 && errors.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-yellow-800 mb-2">
              Warnings ({warnings.length})
            </h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              {warnings.map((warning, index) => (
                <li key={index}>{warning.message}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Preview table */}
        {parsedSteps.length > 0 && errors.length === 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Preview ({parsedSteps.length} steps)
            </h4>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Name
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Conv. Rate
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Volume
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Event Name
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {parsedSteps.map((step, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2 text-sm text-gray-900">{step.name}</td>
                      <td className="px-4 py-2 text-sm text-gray-600">{step.conversionRate}%</td>
                      <td className="px-4 py-2 text-sm text-gray-600">
                        {step.monthlyVolume.toLocaleString()}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-600 font-mono text-xs">
                        {step.eventName}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
