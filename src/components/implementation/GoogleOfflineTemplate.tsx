import React from 'react';
import { useStore } from '@/store/useStore';
import { useCalculator } from '@/hooks/useCalculator';
import { useExport } from '@/hooks/useExport';
import { Card } from '@/components/common';
import { CodeBlock } from './CodeBlock';
import {
  generateGoogleOfflineTemplate,
  generateEmptyTemplate,
  generateGoogleOfflineInstructions,
} from '@/lib/generators/googleOffline';

export const GoogleOfflineTemplate: React.FC = () => {
  const funnel = useStore((state) => state.funnel);
  const metrics = useStore((state) => state.metrics);
  const { values } = useCalculator();
  const { downloadCSV, getTimestamp } = useExport();

  const csvTemplate = generateGoogleOfflineTemplate(funnel, values, metrics.currency);
  const emptyTemplate = generateEmptyTemplate(metrics.currency);
  const instructions = generateGoogleOfflineInstructions();

  return (
    <div className="space-y-6">
      <Card title="Google Ads Offline Conversion Template">
        <p className="text-gray-600">
          Generate CSV templates for uploading offline conversions to Google Ads. This allows you to import
          conversion data from your CRM or backend systems into Google Ads for optimization.
        </p>
      </Card>

      <Card title="CSV Template with Your Values" subtitle="Pre-filled with your calculated conversion values">
        <CodeBlock
          code={csvTemplate}
          language="csv"
          title="google-offline-template.csv"
          onDownload={() => downloadCSV(csvTemplate, `google-offline-template-${getTimestamp()}.csv`)}
        />
        <p className="mt-4 text-sm text-gray-500">
          Replace <code className="bg-gray-100 px-1 rounded">{'{{GCLID}}'}</code> with the actual Google Click ID and{' '}
          <code className="bg-gray-100 px-1 rounded">{'{{YYYY-MM-DD HH:MM:SS+TZ}}'}</code> with the conversion
          timestamp.
        </p>
      </Card>

      <Card title="Example CSV" subtitle="Sample data showing the correct format">
        <CodeBlock
          code={emptyTemplate}
          language="csv"
          title="example.csv"
          onDownload={() => downloadCSV(emptyTemplate, `google-offline-example-${getTimestamp()}.csv`)}
        />
      </Card>

      <Card title="Implementation Guide">
        <div className="prose prose-sm max-w-none">
          <div className="whitespace-pre-wrap text-gray-700 text-sm font-mono bg-gray-50 p-4 rounded-lg overflow-x-auto">
            {instructions}
          </div>
        </div>
      </Card>

      <Card title="Quick Reference">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Required Columns</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Google Click ID (GCLID)</li>
              <li>• Conversion Name</li>
              <li>• Conversion Time</li>
              <li>• Conversion Value</li>
              <li>• Conversion Currency</li>
            </ul>
          </div>
          <div className="p-4 bg-amber-50 rounded-lg">
            <h4 className="font-medium text-amber-900 mb-2">Important Notes</h4>
            <ul className="text-sm text-amber-800 space-y-1">
              <li>• GCLID expires after 90 days</li>
              <li>• Time must include timezone</li>
              <li>• Conversion names must match Google Ads</li>
              <li>• Upload within 90 days of click</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};
