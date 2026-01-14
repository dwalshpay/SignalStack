import React, { useState, useCallback } from 'react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { ValidationResultCard } from './ValidationResultCard';
import { EMQScoreDisplay } from './EMQScoreDisplay';
import { useStore, useFunnelSteps, useGTMValidationResult } from '@/store/useStore';
import { validateGTMContainer, parseGTMContainer } from '@/lib/gtmValidator';
import { calculateEMQScore } from '@/lib/emqCalculator';

export const GTMValidator: React.FC = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  const funnel = useFunnelSteps();
  const validationResult = useGTMValidationResult();
  const setGTMValidationResult = useStore((state) => state.setGTMValidationResult);

  const funnelEventNames = funnel
    .filter((s) => s.isTrackable && s.eventName)
    .map((s) => s.eventName as string);

  const handleFileUpload = useCallback(
    (file: File) => {
      setParseError(null);

      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const container = parseGTMContainer(content);

        if (!container) {
          setParseError('Invalid GTM container file. Please upload a valid JSON export.');
          setGTMValidationResult(null);
          return;
        }

        const result = validateGTMContainer(container, funnelEventNames);
        setGTMValidationResult(result);
      };

      reader.onerror = () => {
        setParseError('Failed to read file. Please try again.');
      };

      reader.readAsText(file);
    },
    [funnelEventNames, setGTMValidationResult]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file && file.type === 'application/json') {
        handleFileUpload(file);
      } else {
        setParseError('Please upload a JSON file');
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
    },
    [handleFileUpload]
  );

  const handleReset = useCallback(() => {
    setGTMValidationResult(null);
    setParseError(null);
  }, [setGTMValidationResult]);

  // Calculate EMQ estimate for display
  const emqEstimate = validationResult
    ? calculateEMQScore(
        validationResult.detectedMatchKeys.reduce(
          (acc, key) => ({ ...acc, [key]: true }),
          {} as Record<string, boolean>
        )
      )
    : null;

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card
        title="Upload GTM Container"
        subtitle="Export your container from GTM and upload it here for validation"
      >
        {!validationResult ? (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <div className="text-4xl mb-4">📁</div>
            <p className="text-gray-600 mb-2">Drag and drop your GTM container JSON file here</p>
            <p className="text-sm text-gray-500 mb-4">or</p>
            <label className="cursor-pointer">
              <span className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors">
                Browse Files
              </span>
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleFileInputChange}
                className="hidden"
              />
            </label>

            {parseError && (
              <p className="mt-4 text-sm text-red-600 bg-red-50 p-2 rounded">{parseError}</p>
            )}

            <div className="mt-6 text-xs text-gray-500">
              <p className="font-medium mb-1">How to export your GTM container:</p>
              <ol className="list-decimal list-inside text-left max-w-md mx-auto">
                <li>Go to Google Tag Manager</li>
                <li>Select your container</li>
                <li>Click Admin → Export Container</li>
                <li>Download the JSON file</li>
              </ol>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">{validationResult.containerName}</p>
              <p className="text-sm text-gray-500">
                Validated at {new Date(validationResult.parsedAt).toLocaleString()}
              </p>
            </div>
            <Button variant="outline" onClick={handleReset}>
              Upload New
            </Button>
          </div>
        )}
      </Card>

      {/* Results Summary */}
      {validationResult && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <SummaryCard
              label="Status"
              value={validationResult.isValid ? 'Valid' : 'Issues Found'}
              color={validationResult.isValid ? 'green' : 'red'}
            />
            <SummaryCard
              label="Errors"
              value={validationResult.issueCount.error}
              color={validationResult.issueCount.error > 0 ? 'red' : 'gray'}
            />
            <SummaryCard
              label="Warnings"
              value={validationResult.issueCount.warning}
              color={validationResult.issueCount.warning > 0 ? 'yellow' : 'gray'}
            />
            <SummaryCard label="Info" value={validationResult.issueCount.info} color="blue" />
          </div>

          {/* EMQ Score */}
          {emqEstimate && (
            <Card>
              <div className="flex flex-col md:flex-row items-center gap-6">
                <EMQScoreDisplay estimate={emqEstimate} size="md" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    Estimated Event Match Quality
                  </h3>
                  <p className="text-gray-600 text-sm mb-2">
                    Based on {validationResult.detectedMatchKeys.length} detected match keys
                  </p>
                  {validationResult.detectedMatchKeys.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {validationResult.detectedMatchKeys.map((key) => (
                        <span
                          key={key}
                          className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded"
                        >
                          {key}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Issues List */}
          {validationResult.issues.length > 0 && (
            <Card title="Validation Results">
              <div className="space-y-4">
                {/* Group by severity */}
                {['error', 'warning', 'info'].map((severity) => {
                  const issues = validationResult.issues.filter((i) => i.severity === severity);
                  if (issues.length === 0) return null;

                  return (
                    <div key={severity}>
                      <h4 className="text-sm font-medium text-gray-700 mb-2 capitalize">
                        {severity}s ({issues.length})
                      </h4>
                      <div className="space-y-3">
                        {issues.map((issue) => (
                          <ValidationResultCard key={issue.id} issue={issue} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* All Clear */}
          {validationResult.issues.length === 0 && (
            <Card>
              <div className="text-center py-8">
                <div className="text-4xl mb-4">🎉</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  All Checks Passed!
                </h3>
                <p className="text-gray-600">
                  Your GTM container configuration looks good.
                </p>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

// Summary Card Component
interface SummaryCardProps {
  label: string;
  value: string | number;
  color: 'green' | 'red' | 'yellow' | 'blue' | 'gray';
}

const SummaryCard: React.FC<SummaryCardProps> = ({ label, value, color }) => {
  const colorClasses = {
    green: 'bg-green-50 text-green-700 border-green-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    gray: 'bg-gray-50 text-gray-700 border-gray-200',
  };

  return (
    <div className={`rounded-lg border p-4 ${colorClasses[color]}`}>
      <p className="text-sm font-medium opacity-75">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
};
