import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import {
  GTMValidator,
  EMQEstimator,
  ScoringRuleBuilder,
  ScoringImplementation,
} from '@/components/validation';

type ToolId = 'gtm-validator' | 'emq-estimator' | 'lead-scoring' | 'scoring-export';

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
    id: 'gtm-validator',
    name: 'GTM Container Validator',
    shortName: 'GTM Validator',
    description: 'Validate your GTM container export',
    component: GTMValidator,
    icon: '🔍',
  },
  {
    id: 'emq-estimator',
    name: 'EMQ Score Estimator',
    shortName: 'EMQ Score',
    description: 'Estimate Event Match Quality',
    component: EMQEstimator,
    icon: '📊',
  },
  {
    id: 'lead-scoring',
    name: 'Lead Scoring Rules',
    shortName: 'Lead Scoring',
    description: 'Configure predictive lead scoring',
    component: ScoringRuleBuilder,
    icon: '⚡',
  },
  {
    id: 'scoring-export',
    name: 'Scoring Implementation',
    shortName: 'Export',
    description: 'Generate GTM scoring code',
    component: ScoringImplementation,
    icon: '📦',
  },
];

export const Validation: React.FC = () => {
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
              Validation Tools
            </h2>
            <nav className="space-y-1">
              {tools.map((t) => (
                <button
                  key={t.id}
                  onClick={() => navigate(`/validation/${t.id}`)}
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
            <div className="p-3 bg-purple-50 rounded-lg">
              <h3 className="text-xs font-semibold text-purple-800 uppercase mb-1">Phase 3</h3>
              <p className="text-xs text-purple-700">
                Validate your GTM setup, estimate Event Match Quality, and configure lead scoring
                rules to optimise ad platform performance.
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
