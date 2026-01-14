import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import {
  DataLayerGenerator,
  GTMGuide,
  MetaCAPIGenerator,
  GoogleOfflineTemplate,
  EmailFilter,
  NegativeKeywords,
  GA4Audiences,
} from '@/components/implementation';

type ToolId = 'data-layer' | 'gtm' | 'meta-capi' | 'google-offline' | 'email-filter' | 'negative-keywords' | 'ga4-audiences';

interface Tool {
  id: ToolId;
  name: string;
  shortName: string;
  description: string;
  component: React.ComponentType;
  icon: string;
}

const tools: Tool[] = [
  {
    id: 'data-layer',
    name: 'Data Layer Schema',
    shortName: 'Data Layer',
    description: 'Generate dataLayer.push() code for GTM',
    component: DataLayerGenerator,
    icon: '{ }',
  },
  {
    id: 'gtm',
    name: 'GTM Configuration',
    shortName: 'GTM Guide',
    description: 'Step-by-step GTM tag setup guide',
    component: GTMGuide,
    icon: '🏷️',
  },
  {
    id: 'meta-capi',
    name: 'Meta Conversions API',
    shortName: 'Meta CAPI',
    description: 'Server-side Meta event payloads',
    component: MetaCAPIGenerator,
    icon: '📡',
  },
  {
    id: 'google-offline',
    name: 'Google Offline Conversions',
    shortName: 'Google Offline',
    description: 'CSV templates for offline uploads',
    component: GoogleOfflineTemplate,
    icon: '📄',
  },
  {
    id: 'email-filter',
    name: 'Consumer Email Filter',
    shortName: 'Email Filter',
    description: 'Identify and filter consumer emails',
    component: EmailFilter,
    icon: '📧',
  },
  {
    id: 'negative-keywords',
    name: 'Negative Keywords',
    shortName: 'Negatives',
    description: 'Generate negative keyword lists',
    component: NegativeKeywords,
    icon: '🚫',
  },
  {
    id: 'ga4-audiences',
    name: 'GA4 Audiences',
    shortName: 'GA4',
    description: 'Pre-built audience definitions',
    component: GA4Audiences,
    icon: '👥',
  },
];

export const Implementation: React.FC = () => {
  const { tool } = useParams<{ tool?: string }>();
  const navigate = useNavigate();

  const selectedTool = tools.find((t) => t.id === tool) || tools[0];
  const ToolComponent = selectedTool.component;

  return (
    <MainLayout>
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-50 border-r border-gray-200 overflow-y-auto flex-shrink-0">
          <div className="p-4">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Implementation Tools
            </h2>
            <nav className="space-y-1">
              {tools.map((t) => (
                <button
                  key={t.id}
                  onClick={() => navigate(`/implementation/${t.id}`)}
                  className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                    selectedTool.id === t.id
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{t.icon}</span>
                    <span className="font-medium text-sm">{t.shortName}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 ml-6">{t.description}</p>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-4 border-t border-gray-200">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h3 className="text-xs font-semibold text-blue-800 uppercase mb-1">Tip</h3>
              <p className="text-xs text-blue-700">
                Configure your funnel in the Value Calculator first. These tools use your funnel data to
                generate implementation code.
              </p>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">{selectedTool.name}</h1>
              <p className="text-gray-600">{selectedTool.description}</p>
            </div>
            <ToolComponent />
          </div>
        </main>
      </div>
    </MainLayout>
  );
};
