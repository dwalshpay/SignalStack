import React from 'react';
import { useStore } from '@/store/useStore';
import { useExport } from '@/hooks/useExport';
import { Card } from '@/components/common';
import { CodeBlock } from './CodeBlock';
import {
  generateGA4Audiences,
  generateGA4AudienceDocumentation,
  exportGA4AudiencesJSON,
} from '@/lib/generators/ga4Audiences';

export const GA4Audiences: React.FC = () => {
  const funnel = useStore((state) => state.funnel);
  const { downloadJSON, downloadCode, getTimestamp } = useExport();

  const audiences = generateGA4Audiences(funnel);
  const documentation = generateGA4AudienceDocumentation(funnel);
  const audiencesJSON = exportGA4AudiencesJSON(audiences);

  const audienceCategories = {
    engagement: audiences.filter((a) => ['high_intent', 'engaged_visitors', 'low_quality_exclude'].includes(a.id)),
    segment: audiences.filter((a) => a.id === 'business_email'),
    funnel: audiences.filter((a) => a.id.startsWith('funnel_') || a.id === 'bottom_funnel'),
  };

  return (
    <div className="space-y-6">
      <Card title="GA4 Audience Definitions">
        <p className="text-gray-600">
          Pre-configured Google Analytics 4 audience definitions optimized for value-based bidding and
          remarketing. These audiences help you target high-value users and exclude low-quality traffic.
        </p>
      </Card>

      {audienceCategories.engagement.length > 0 && (
        <Card title="Engagement-Based Audiences" subtitle="Segment users by their engagement behavior">
          <div className="space-y-4">
            {audienceCategories.engagement.map((audience) => (
              <div key={audience.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-medium text-gray-900">{audience.name}</h4>
                    <p className="text-sm text-gray-500">{audience.description}</p>
                  </div>
                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                    {audience.membershipDurationDays} days
                  </span>
                </div>
                <div className="mt-3 p-3 bg-gray-50 rounded text-sm">
                  <div className="text-gray-600 mb-1">Include when:</div>
                  <ul className="space-y-1">
                    {audience.filterClauses.map((clause, i) => (
                      <li key={i} className="text-gray-800">
                        • {clause.field} {clause.operator} {clause.value}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {audienceCategories.segment.length > 0 && (
        <Card title="Segment-Based Audiences" subtitle="Audiences based on user segments">
          <div className="space-y-4">
            {audienceCategories.segment.map((audience) => (
              <div key={audience.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-medium text-gray-900">{audience.name}</h4>
                    <p className="text-sm text-gray-500">{audience.description}</p>
                  </div>
                  <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">High Value</span>
                </div>
                <div className="mt-3 p-3 bg-gray-50 rounded text-sm">
                  <div className="text-gray-600 mb-1">Include when:</div>
                  <ul className="space-y-1">
                    {audience.filterClauses.map((clause, i) => (
                      <li key={i} className="text-gray-800">
                        • {clause.field} {clause.operator === 'exists' ? 'occurred' : `${clause.operator} ${clause.value}`}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {audienceCategories.funnel.length > 0 && (
        <Card title="Funnel Stage Audiences" subtitle="Target users at specific stages of your funnel">
          <div className="space-y-4">
            {audienceCategories.funnel.map((audience) => (
              <div key={audience.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-medium text-gray-900">{audience.name}</h4>
                    <p className="text-sm text-gray-500">{audience.description}</p>
                  </div>
                  <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded">
                    {audience.membershipDurationDays} days
                  </span>
                </div>
                <div className="mt-3 grid md:grid-cols-2 gap-3">
                  <div className="p-3 bg-green-50 rounded text-sm">
                    <div className="text-green-700 mb-1">Include when:</div>
                    <ul className="space-y-1">
                      {audience.filterClauses.map((clause, i) => (
                        <li key={i} className="text-green-800">
                          • {clause.field} occurred
                        </li>
                      ))}
                    </ul>
                  </div>
                  {audience.exclusionClauses && audience.exclusionClauses.length > 0 && (
                    <div className="p-3 bg-red-50 rounded text-sm">
                      <div className="text-red-700 mb-1">Exclude when:</div>
                      <ul className="space-y-1">
                        {audience.exclusionClauses.map((clause, i) => (
                          <li key={i} className="text-red-800">
                            • {clause.field} occurred
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card title="Export Audience Definitions">
        <div className="space-y-4">
          <CodeBlock
            code={audiencesJSON}
            language="json"
            title="ga4-audiences.json"
            onDownload={() => downloadJSON(audiences, `ga4-audiences-${getTimestamp()}.json`)}
          />
        </div>
      </Card>

      <Card title="Complete Documentation">
        <CodeBlock
          code={documentation}
          language="markdown"
          title="ga4-audiences-guide.md"
          showLineNumbers={false}
          onDownload={() => downloadCode(documentation, `ga4-audiences-guide-${getTimestamp()}.md`, 'text/markdown')}
        />
      </Card>

      <Card title="Quick Tips">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">Use for Targeting</h4>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• High Intent → Higher bids</li>
              <li>• Bottom Funnel → Retargeting</li>
              <li>• Business Email → Priority leads</li>
            </ul>
          </div>
          <div className="p-4 bg-red-50 rounded-lg">
            <h4 className="font-medium text-red-900 mb-2">Use as Exclusions</h4>
            <ul className="text-sm text-red-800 space-y-1">
              <li>• Low Quality → Exclude from all</li>
              <li>• Converted users → Exclude from acquisition</li>
            </ul>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Google Ads Integration</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Link GA4 to Google Ads</li>
              <li>• Enable audience sharing</li>
              <li>• Use for RLSA campaigns</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};
