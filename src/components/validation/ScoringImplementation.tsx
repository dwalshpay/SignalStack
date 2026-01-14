import React, { useState, useMemo } from 'react';
import { Card } from '@/components/common/Card';
import { CodeBlock } from '@/components/implementation/CodeBlock';
import { useScoringRules } from '@/store/useStore';
import {
  generateGTMScoringVariable,
  generateDataLayerPush,
  generateGTMTagGuide,
} from '@/lib/generators/scoringTemplate';

type TabId = 'variable' | 'dataLayer' | 'guide';

interface Tab {
  id: TabId;
  label: string;
  description: string;
}

const tabs: Tab[] = [
  {
    id: 'variable',
    label: 'GTM Variable',
    description: 'Custom JavaScript variable for GTM',
  },
  {
    id: 'dataLayer',
    label: 'DataLayer Code',
    description: 'Push scoring data to dataLayer',
  },
  {
    id: 'guide',
    label: 'Setup Guide',
    description: 'Step-by-step implementation guide',
  },
];

export const ScoringImplementation: React.FC = () => {
  const rules = useScoringRules();
  const [activeTab, setActiveTab] = useState<TabId>('variable');

  const enabledRules = rules.filter((r) => r.enabled);

  const generatedCode = useMemo(
    () => ({
      variable: generateGTMScoringVariable(rules),
      dataLayer: generateDataLayerPush(rules),
      guide: generateGTMTagGuide(),
    }),
    [rules]
  );

  if (enabledRules.length === 0) {
    return (
      <Card>
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📋</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Scoring Rules Configured</h3>
          <p className="text-gray-600 mb-4">
            Add some lead scoring rules first, then come back here to generate the implementation
            code.
          </p>
          <a
            href="/validation/lead-scoring"
            className="text-primary-600 hover:underline font-medium"
          >
            Go to Lead Scoring Rules →
          </a>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-medium text-gray-900">Implementation Ready</h3>
            <p className="text-sm text-gray-500">
              {enabledRules.length} scoring rules will be included in the generated code
            </p>
          </div>
          <div className="flex items-center gap-2">
            <RulesSummary rules={enabledRules} />
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'variable' && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-1">GTM Custom JavaScript Variable</h4>
              <p className="text-sm text-blue-700">
                This variable calculates lead scores in real-time. Create a new Custom JavaScript
                Variable in GTM and paste this code.
              </p>
            </div>
            <CodeBlock
              code={generatedCode.variable}
              language="javascript"
              title="lead-scoring-variable.js"
            />
          </div>
        )}

        {activeTab === 'dataLayer' && (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-900 mb-1">DataLayer Integration</h4>
              <p className="text-sm text-green-700">
                Use this code to push scoring data to the dataLayer after form submissions or
                conversion events.
              </p>
            </div>
            <CodeBlock
              code={generatedCode.dataLayer}
              language="javascript"
              title="lead-scoring-datalayer.js"
            />
          </div>
        )}

        {activeTab === 'guide' && (
          <div className="space-y-4">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="font-medium text-purple-900 mb-1">Implementation Guide</h4>
              <p className="text-sm text-purple-700">
                Follow these step-by-step instructions to set up lead scoring in Google Tag
                Manager.
              </p>
            </div>
            <Card>
              <div className="prose prose-sm max-w-none">
                <GuideContent content={generatedCode.guide} />
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Tips */}
      <Card title="Implementation Tips">
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start gap-2">
            <span className="text-primary-500">→</span>
            Test in GTM Preview mode before publishing
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-500">→</span>
            Ensure all data layer variables referenced in rules exist
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-500">→</span>
            The scoring variable returns an object with score and multiplier
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-500">→</span>
            Use the multiplier to adjust conversion values in ad platform tags
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-500">→</span>
            Monitor performance and adjust point values as needed
          </li>
        </ul>
      </Card>
    </div>
  );
};

// Rules Summary Component
interface RulesSummaryProps {
  rules: { category: string }[];
}

const RulesSummary: React.FC<RulesSummaryProps> = ({ rules }) => {
  const counts = {
    firmographic: rules.filter((r) => r.category === 'firmographic').length,
    behavioural: rules.filter((r) => r.category === 'behavioural').length,
    engagement: rules.filter((r) => r.category === 'engagement').length,
  };

  return (
    <div className="flex gap-2">
      {counts.firmographic > 0 && (
        <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded">
          {counts.firmographic} Firmographic
        </span>
      )}
      {counts.behavioural > 0 && (
        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
          {counts.behavioural} Behavioural
        </span>
      )}
      {counts.engagement > 0 && (
        <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
          {counts.engagement} Engagement
        </span>
      )}
    </div>
  );
};

// Guide Content Renderer
interface GuideContentProps {
  content: string;
}

const GuideContent: React.FC<GuideContentProps> = ({ content }) => {
  // Simple markdown-ish rendering
  const lines = content.split('\n');

  return (
    <div className="space-y-2">
      {lines.map((line, idx) => {
        if (line.startsWith('# ')) {
          return (
            <h1 key={idx} className="text-xl font-bold text-gray-900 mt-4">
              {line.slice(2)}
            </h1>
          );
        }
        if (line.startsWith('## ')) {
          return (
            <h2 key={idx} className="text-lg font-semibold text-gray-800 mt-4">
              {line.slice(3)}
            </h2>
          );
        }
        if (line.startsWith('### ')) {
          return (
            <h3 key={idx} className="text-base font-medium text-gray-700 mt-3">
              {line.slice(4)}
            </h3>
          );
        }
        if (line.startsWith('- ')) {
          return (
            <li key={idx} className="ml-4 text-gray-600">
              {line.slice(2)}
            </li>
          );
        }
        if (line.match(/^\d+\./)) {
          return (
            <li key={idx} className="ml-4 text-gray-600 list-decimal list-inside">
              {line.replace(/^\d+\.\s*/, '')}
            </li>
          );
        }
        if (line.startsWith('```')) {
          return null; // Skip code block markers
        }
        if (line.trim() === '') {
          return <div key={idx} className="h-2" />;
        }
        return (
          <p key={idx} className="text-gray-600">
            {line}
          </p>
        );
      })}
    </div>
  );
};
