import React, { useState, useMemo } from 'react';
import { Card, Input } from '@/components/common';
import { CodeBlock } from './CodeBlock';
import { useExport } from '@/hooks/useExport';
import {
  getAllNegativeKeywordLists,
  exportNegativeKeywords,
  getKeywordCounts,
  type NegativeKeywordCategory,
  type ExportFormat,
} from '@/lib/generators/negativeKeywords';

export const NegativeKeywords: React.FC = () => {
  const [selectedCategories, setSelectedCategories] = useState<NegativeKeywordCategory[]>([
    'free_seeker',
    'job_seeker',
    'student',
    'informational',
  ]);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('plain');
  const [campaignName, setCampaignName] = useState('[Campaign Name]');
  const { downloadCode, getTimestamp } = useExport();

  const allLists = useMemo(() => getAllNegativeKeywordLists(), []);
  const keywordCounts = useMemo(() => getKeywordCounts(allLists), [allLists]);

  const exportedKeywords = useMemo(
    () => exportNegativeKeywords(selectedCategories, exportFormat, campaignName),
    [selectedCategories, exportFormat, campaignName]
  );

  const totalSelected = useMemo(
    () => selectedCategories.reduce((sum, cat) => sum + (keywordCounts[cat] || 0), 0),
    [selectedCategories, keywordCounts]
  );

  const toggleCategory = (category: NegativeKeywordCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const categoryLabels: Record<NegativeKeywordCategory, { label: string; description: string }> = {
    free_seeker: {
      label: 'Free/Discount Seekers',
      description: 'People looking for free or discounted alternatives',
    },
    job_seeker: {
      label: 'Job Seekers',
      description: 'People looking for employment, not your product',
    },
    student: {
      label: 'Students/Academic',
      description: 'Students researching for assignments, not buyers',
    },
    informational: {
      label: 'Informational Searches',
      description: 'Research queries, not purchase intent',
    },
    // Industry-specific categories
    payments: {
      label: 'Payments - Personal Use',
      description: 'Block searches for personal payment solutions (Venmo, PayPal personal, etc.)',
    },
    saas: {
      label: 'SaaS - Free Alternatives',
      description: 'Exclude searches for free alternatives or open source replacements',
    },
    finance: {
      label: 'Finance - Personal Banking',
      description: 'Block personal banking and retail banking searches',
    },
    healthcare: {
      label: 'Healthcare - Consumer',
      description: 'Exclude consumer health and personal wellness searches',
    },
    consumer_email: {
      label: 'Consumer Email Domains',
      description: 'Block ads to consumer email domain searches',
    },
  };

  const getFileExtension = () => {
    switch (exportFormat) {
      case 'google_editor':
        return 'csv';
      default:
        return 'txt';
    }
  };

  return (
    <div className="space-y-6">
      <Card title="Negative Keyword Generator">
        <p className="text-gray-600">
          Generate negative keyword lists to exclude low-quality traffic from your ad campaigns. Filter out
          job seekers, students, freebie hunters, and other non-commercial searches.
        </p>
      </Card>

      <Card title="Select Categories">
        <div className="grid md:grid-cols-2 gap-4">
          {Object.entries(categoryLabels).map(([category, { label, description }]) => (
            <label
              key={category}
              className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                selectedCategories.includes(category as NegativeKeywordCategory)
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedCategories.includes(category as NegativeKeywordCategory)}
                onChange={() => toggleCategory(category as NegativeKeywordCategory)}
                className="mt-1 w-4 h-4 rounded border-gray-300 text-primary-600"
              />
              <div>
                <div className="font-medium text-gray-900">{label}</div>
                <div className="text-sm text-gray-500">{description}</div>
                <div className="text-xs text-gray-400 mt-1">
                  {keywordCounts[category as NegativeKeywordCategory]} keywords
                </div>
              </div>
            </label>
          ))}
        </div>
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <span className="text-gray-600">Total selected:</span>
          <span className="ml-2 font-medium text-gray-900">{totalSelected} keywords</span>
        </div>
      </Card>

      <Card title="Export Options">
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Export Format</label>
            <div className="space-y-2">
              {[
                { value: 'plain', label: 'Plain Text (one per line)' },
                { value: 'google_editor', label: 'Google Ads Editor (CSV)' },
                { value: 'meta', label: 'Meta Ads Manager (text)' },
              ].map((option) => (
                <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="exportFormat"
                    value={option.value}
                    checked={exportFormat === option.value}
                    onChange={(e) => setExportFormat(e.target.value as ExportFormat)}
                    className="w-4 h-4 border-gray-300 text-primary-600"
                  />
                  <span className="text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
          {exportFormat === 'google_editor' && (
            <Input
              label="Campaign Name"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              placeholder="Enter campaign name"
              hint="Used in the CSV export for Google Ads Editor"
            />
          )}
        </div>
      </Card>

      <Card title="Preview & Export">
        <CodeBlock
          code={exportedKeywords}
          language="text"
          title={`negative-keywords.${getFileExtension()}`}
          showLineNumbers={false}
          onDownload={() =>
            downloadCode(
              exportedKeywords,
              `negative-keywords-${getTimestamp()}.${getFileExtension()}`,
              exportFormat === 'google_editor' ? 'text/csv' : 'text/plain'
            )
          }
        />
      </Card>

      <Card title="Usage Tips">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Google Ads</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Add at campaign level for broad coverage</li>
              <li>• Use "Phrase match" for balanced control</li>
              <li>• Review search terms report weekly</li>
              <li>• Import via Google Ads Editor for bulk upload</li>
            </ul>
          </div>
          <div className="p-4 bg-indigo-50 rounded-lg">
            <h4 className="font-medium text-indigo-900 mb-2">Meta Ads</h4>
            <ul className="text-sm text-indigo-800 space-y-1">
              <li>• Use Advantage+ Audience exclusions</li>
              <li>• Create custom audiences to exclude</li>
              <li>• Layer with interest exclusions</li>
              <li>• Monitor placement reports</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};
