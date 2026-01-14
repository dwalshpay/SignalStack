import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import { useCalculator } from '@/hooks/useCalculator';
import { useExport } from '@/hooks/useExport';
import { Card, Input } from '@/components/common';
import { CodeBlock } from './CodeBlock';
import {
  generateMetaCAPIPayloads,
  generateEMQGuidance,
  generateServerImplementation,
} from '@/lib/generators/metaCAPI';

export const MetaCAPIGenerator: React.FC = () => {
  const [pixelId, setPixelId] = useState('YOUR_PIXEL_ID');
  const funnel = useStore((state) => state.funnel);
  const metrics = useStore((state) => state.metrics);
  const segments = useStore((state) => state.segments);
  const { values } = useCalculator();
  const { downloadCode, downloadJS, getTimestamp } = useExport();

  const payloads = generateMetaCAPIPayloads(funnel, values, segments, metrics.currency, pixelId);
  const emqGuidance = generateEMQGuidance();
  const serverCode = generateServerImplementation(metrics.currency);

  return (
    <div className="space-y-6">
      <Card title="Meta Conversions API (CAPI) Generator">
        <p className="text-gray-600 mb-4">
          Generate server-side event payloads for Meta Conversions API. Server-side tracking improves data
          accuracy, especially with browser privacy features and ad blockers.
        </p>
        <Input
          label="Meta Pixel ID"
          value={pixelId}
          onChange={(e) => setPixelId(e.target.value)}
          placeholder="Enter your Pixel ID"
          hint="Find this in Meta Events Manager"
        />
      </Card>

      <Card title="Event Payloads" subtitle="JSON payloads for each conversion event">
        <div className="space-y-4">
          {payloads.map((payload) => (
            <div key={payload.eventName} className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">{payload.stepName}</h4>
                  <p className="text-sm text-gray-500">
                    Meta Event: <code className="bg-gray-100 px-1 rounded">{payload.metaEventName}</code>
                  </p>
                </div>
              </div>
              <CodeBlock
                code={JSON.stringify(payload.payload, null, 2)}
                language="json"
                title={`${payload.eventName}.json`}
              />
            </div>
          ))}
        </div>
      </Card>

      <Card title="cURL Examples" subtitle="Test your CAPI implementation from the command line">
        <div className="space-y-4">
          {payloads.slice(0, 2).map((payload) => (
            <div key={payload.eventName}>
              <h4 className="text-sm font-medium text-gray-700 mb-2">{payload.stepName}</h4>
              <CodeBlock code={payload.curlExample} language="text" title="curl" />
            </div>
          ))}
        </div>
      </Card>

      <Card title="Node.js Server Implementation" subtitle="Complete server-side implementation example">
        <CodeBlock
          code={serverCode}
          language="javascript"
          title="meta-capi-server.js"
          showLineNumbers
          onDownload={() => downloadJS(serverCode, `meta-capi-server-${getTimestamp()}.js`)}
        />
      </Card>

      <Card title="Event Match Quality (EMQ) Guide">
        <div className="prose prose-sm max-w-none">
          <div className="whitespace-pre-wrap text-gray-700 text-sm font-mono bg-gray-50 p-4 rounded-lg overflow-x-auto">
            {emqGuidance}
          </div>
        </div>
        <button
          onClick={() => downloadCode(emqGuidance, `emq-guide-${getTimestamp()}.md`, 'text/markdown')}
          className="mt-4 text-sm text-primary-600 hover:text-primary-700"
        >
          Download EMQ Guide
        </button>
      </Card>

      <Card title="Implementation Checklist">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">Required for CAPI</h4>
            <ul className="text-sm text-green-800 space-y-1">
              <li>✓ Meta Pixel ID</li>
              <li>✓ Access Token (from Events Manager)</li>
              <li>✓ event_name, event_time, action_source</li>
              <li>✓ event_id for deduplication</li>
            </ul>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <h4 className="font-medium text-purple-900 mb-2">Recommended User Data</h4>
            <ul className="text-sm text-purple-800 space-y-1">
              <li>• em (hashed email) - HIGH priority</li>
              <li>• ph (hashed phone) - HIGH priority</li>
              <li>• fbc, fbp cookies - HIGH priority</li>
              <li>• client_ip_address - MEDIUM priority</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};
