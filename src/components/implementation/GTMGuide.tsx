import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import { useCalculator } from '@/hooks/useCalculator';
import { useExport } from '@/hooks/useExport';
import { Card, Input } from '@/components/common';
import { CodeBlock } from './CodeBlock';
import { generateGTMInstructions, generateGTMMarkdown } from '@/lib/generators/gtmConfig';

export const GTMGuide: React.FC = () => {
  const [googleAdsId, setGoogleAdsId] = useState('AW-XXXXXXXXX');
  const [metaPixelId, setMetaPixelId] = useState('XXXXXXXXXX');
  const [ga4MeasurementId, setGa4MeasurementId] = useState('G-XXXXXXXXXX');

  const funnel = useStore((state) => state.funnel);
  const metrics = useStore((state) => state.metrics);
  const { values } = useCalculator();
  const { downloadCode, getTimestamp } = useExport();

  const instructions = generateGTMInstructions(
    funnel,
    values,
    metrics.currency,
    googleAdsId,
    metaPixelId,
    ga4MeasurementId
  );

  const markdown = generateGTMMarkdown(instructions);

  const [activeSection, setActiveSection] = useState(0);

  return (
    <div className="space-y-6">
      <Card title="GTM Tag Configuration Guide">
        <p className="text-gray-600 mb-4">
          Step-by-step instructions for configuring Google Tag Manager with your conversion events for Google
          Ads, Meta Pixel, and GA4.
        </p>
        <div className="grid md:grid-cols-3 gap-4">
          <Input
            label="Google Ads ID"
            value={googleAdsId}
            onChange={(e) => setGoogleAdsId(e.target.value)}
            placeholder="AW-XXXXXXXXX"
          />
          <Input
            label="Meta Pixel ID"
            value={metaPixelId}
            onChange={(e) => setMetaPixelId(e.target.value)}
            placeholder="XXXXXXXXXX"
          />
          <Input
            label="GA4 Measurement ID"
            value={ga4MeasurementId}
            onChange={(e) => setGa4MeasurementId(e.target.value)}
            placeholder="G-XXXXXXXXXX"
          />
        </div>
      </Card>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {instructions.map((instruction, index) => (
          <button
            key={index}
            onClick={() => setActiveSection(index)}
            className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
              activeSection === index
                ? 'bg-primary-100 text-primary-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {instruction.stepNumber}. {instruction.title}
          </button>
        ))}
      </div>

      <Card
        title={`Step ${instructions[activeSection].stepNumber}: ${instructions[activeSection].title}`}
        subtitle={
          instructions[activeSection].platform
            ? `Platform: ${instructions[activeSection].platform?.toUpperCase()}`
            : undefined
        }
      >
        <div className="prose prose-sm max-w-none">
          <div className="whitespace-pre-wrap text-gray-700 text-sm bg-gray-50 p-4 rounded-lg overflow-x-auto">
            {instructions[activeSection].content}
          </div>
        </div>
      </Card>

      <Card title="Complete Guide" subtitle="Download the full GTM configuration guide">
        <CodeBlock
          code={markdown}
          language="markdown"
          title="gtm-configuration-guide.md"
          showLineNumbers={false}
          onDownload={() => downloadCode(markdown, `gtm-guide-${getTimestamp()}.md`, 'text/markdown')}
        />
      </Card>

      <Card title="Quick Setup Checklist">
        <div className="space-y-3">
          {[
            'Enable Consent Mode v2 in GTM container settings',
            'Create Data Layer Variables for event_value, event_id, currency',
            'Create Custom Event Triggers for each funnel event',
            'Configure Google Ads Conversion tags with values',
            'Configure Meta Pixel tags with event_id for deduplication',
            'Configure GA4 Event tags with parameters',
            'Test in GTM Preview mode',
            'Publish container changes',
          ].map((item, index) => (
            <label key={index} className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-primary-600" />
              <span className="text-gray-700">{item}</span>
            </label>
          ))}
        </div>
      </Card>
    </div>
  );
};
