import React, { useState } from 'react';
import { MainLayout } from '@/components/layout';
import {
  ProfileSettings,
  OrganizationSettings,
  APIKeyManager,
  IntegrationManager,
  TeamMembers,
  AlertSettings,
} from '@/components/settings';
import { usePermissions } from '@/hooks/usePermissions';

type Tab = 'profile' | 'organization' | 'apiKeys' | 'integrations' | 'team' | 'alerts';

interface TabConfig {
  id: Tab;
  label: string;
  adminOnly: boolean;
}

const TABS: TabConfig[] = [
  { id: 'profile', label: 'Profile', adminOnly: false },
  { id: 'organization', label: 'Organization', adminOnly: true },
  { id: 'apiKeys', label: 'API Keys', adminOnly: true },
  { id: 'integrations', label: 'Integrations', adminOnly: true },
  { id: 'team', label: 'Team', adminOnly: true },
  { id: 'alerts', label: 'Alerts', adminOnly: true },
];

export const Settings: React.FC = () => {
  const { isAdmin } = usePermissions();
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  const visibleTabs = TABS.filter((tab) => !tab.adminOnly || isAdmin);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileSettings />;
      case 'organization':
        return isAdmin ? <OrganizationSettings /> : null;
      case 'apiKeys':
        return isAdmin ? <APIKeyManager /> : null;
      case 'integrations':
        return isAdmin ? <IntegrationManager /> : null;
      case 'team':
        return isAdmin ? <TeamMembers /> : null;
      case 'alerts':
        return isAdmin ? <AlertSettings /> : null;
      default:
        return <ProfileSettings />;
    }
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500">
            Manage your account and organization settings
          </p>
        </div>

        {/* Tab navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {visibleTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab content */}
        {renderTabContent()}
      </div>
    </MainLayout>
  );
};
