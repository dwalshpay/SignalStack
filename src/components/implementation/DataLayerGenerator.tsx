import React from 'react';
import { useStore } from '@/store/useStore';
import { useCalculator } from '@/hooks/useCalculator';
import { useExport } from '@/hooks/useExport';
import { CodeBlock } from './CodeBlock';
import { Card } from '@/components/common';
import {
  generateDataLayerCode,
  generateHelperFunctions,
  generateCompleteDataLayerCode,
} from '@/lib/generators/dataLayer';

export const DataLayerGenerator: React.FC = () => {
  const funnel = useStore((state) => state.funnel);
  const metrics = useStore((state) => state.metrics);
  const segments = useStore((state) => state.segments);
  const { values } = useCalculator();
  const { downloadJS, getTimestamp } = useExport();

  const events = generateDataLayerCode(funnel, values, segments, metrics.currency);
  const helpers = generateHelperFunctions();
  const completeCode = generateCompleteDataLayerCode(funnel, values, segments, metrics.currency);

  const handleDownload = () => {
    downloadJS(completeCode, `signalstack-datalayer-${getTimestamp()}.js`);
  };

  return (
    <div className="space-y-6">
      <Card title="Data Layer Schema Generator">
        <p className="text-gray-600 mb-4">
          Generate JavaScript data layer code for each funnel event. This code should be added to your website
          to push conversion events to Google Tag Manager.
        </p>
      </Card>

      <Card title="Helper Functions" subtitle="Add these functions to your website's global JavaScript">
        <CodeBlock
          code={helpers}
          language="javascript"
          title="helpers.js"
          showLineNumbers
          onDownload={() => downloadJS(helpers, `signalstack-helpers-${getTimestamp()}.js`)}
        />
      </Card>

      <Card title="Event-Specific Code" subtitle="Fire these data layer pushes when each event occurs">
        <div className="space-y-4">
          {events.map((event) => (
            <div key={event.eventName} className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                <h4 className="font-medium text-gray-900">{event.stepName}</h4>
                <p className="text-sm text-gray-500">{event.description}</p>
              </div>
              <CodeBlock
                code={event.code}
                language="javascript"
                showLineNumbers={false}
              />
            </div>
          ))}
        </div>
      </Card>

      <Card title="Complete Implementation">
        <p className="text-gray-600 mb-4">
          Download the complete implementation file with all helper functions and event code.
        </p>
        <CodeBlock
          code={completeCode}
          language="javascript"
          title="signalstack-datalayer.js"
          showLineNumbers
          onDownload={handleDownload}
        />
      </Card>
    </div>
  );
};
