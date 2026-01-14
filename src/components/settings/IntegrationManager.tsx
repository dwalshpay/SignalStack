import React, { useState, useEffect } from 'react';
import { Card, Button, Input, useToast } from '@/components/common';
import {
  listIntegrations,
  createIntegration,
  deleteIntegration,
  testIntegrationConnection,
} from '@/lib/api';
import { getErrorMessage } from '@/lib/api/errors';
import type { Integration, IntegrationType } from '@/types/api';

const INTEGRATION_CONFIGS: Record<
  IntegrationType,
  { name: string; fields: { key: string; label: string; type: string }[] }
> = {
  META_CAPI: {
    name: 'Meta Conversions API',
    fields: [
      { key: 'pixelId', label: 'Pixel ID', type: 'text' },
      { key: 'accessToken', label: 'Access Token', type: 'password' },
    ],
  },
  GOOGLE_ADS: {
    name: 'Google Ads Offline Conversions',
    fields: [
      { key: 'customerId', label: 'Customer ID', type: 'text' },
      { key: 'developerToken', label: 'Developer Token', type: 'password' },
      { key: 'clientId', label: 'OAuth Client ID', type: 'text' },
      { key: 'clientSecret', label: 'OAuth Client Secret', type: 'password' },
      { key: 'refreshToken', label: 'Refresh Token', type: 'password' },
    ],
  },
  AMPLITUDE: {
    name: 'Amplitude',
    fields: [
      { key: 'apiKey', label: 'API Key', type: 'password' },
      { key: 'secretKey', label: 'Secret Key', type: 'password' },
    ],
  },
  SALESFORCE: {
    name: 'Salesforce',
    fields: [
      { key: 'instanceUrl', label: 'Instance URL', type: 'text' },
      { key: 'clientId', label: 'Client ID', type: 'text' },
      { key: 'clientSecret', label: 'Client Secret', type: 'password' },
      { key: 'refreshToken', label: 'Refresh Token', type: 'password' },
    ],
  },
  CLEARBIT: {
    name: 'Clearbit',
    fields: [{ key: 'apiKey', label: 'API Key', type: 'password' }],
  },
};

export const IntegrationManager: React.FC = () => {
  const { addToast } = useToast();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [addingType, setAddingType] = useState<IntegrationType | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    try {
      const data = await listIntegrations();
      setIntegrations(data);
    } catch (err) {
      addToast('error', getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = (type: IntegrationType) => {
    setAddingType(type);
    setFormData({ name: INTEGRATION_CONFIGS[type].name });
  };

  const handleSave = async () => {
    if (!addingType) return;

    setIsSaving(true);
    try {
      const { name, ...credentials } = formData;
      const newIntegration = await createIntegration({
        type: addingType,
        name,
        credentials,
      });
      setIntegrations([...integrations, newIntegration]);
      setAddingType(null);
      setFormData({});
      addToast('success', 'Integration added successfully');
    } catch (err) {
      addToast('error', getErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this integration?')) return;

    try {
      await deleteIntegration(id);
      setIntegrations(integrations.filter((i) => i.id !== id));
      addToast('success', 'Integration deleted');
    } catch (err) {
      addToast('error', getErrorMessage(err));
    }
  };

  const handleTest = async (id: string) => {
    setTestingId(id);
    try {
      const result = await testIntegrationConnection(id);
      if (result.success) {
        addToast('success', 'Connection successful');
      } else {
        addToast('error', result.message || 'Connection failed');
      }
    } catch (err) {
      addToast('error', getErrorMessage(err));
    } finally {
      setTestingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'ERROR':
        return 'bg-red-100 text-red-800';
      case 'DISABLED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const availableTypes = (Object.keys(INTEGRATION_CONFIGS) as IntegrationType[]).filter(
    (type) => !integrations.some((i) => i.type === type)
  );

  return (
    <Card title="Integrations" subtitle="Connect your ad platforms and data sources">
      {/* Add new integration */}
      {availableTypes.length > 0 && !addingType && (
        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-3">Add a new integration:</p>
          <div className="flex flex-wrap gap-2">
            {availableTypes.map((type) => (
              <Button
                key={type}
                variant="outline"
                size="sm"
                onClick={() => handleAdd(type)}
              >
                + {INTEGRATION_CONFIGS[type].name}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Add form */}
      {addingType && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-4">
            Add {INTEGRATION_CONFIGS[addingType].name}
          </h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Display Name
              </label>
              <Input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1"
              />
            </div>
            {INTEGRATION_CONFIGS[addingType].fields.map((field) => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-gray-700">
                  {field.label}
                </label>
                <Input
                  type={field.type}
                  value={formData[field.key] || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, [field.key]: e.target.value })
                  }
                  className="mt-1"
                />
              </div>
            ))}
            <div className="flex gap-2 pt-2">
              <Button variant="primary" onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setAddingType(null);
                  setFormData({});
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Integrations list */}
      {isLoading ? (
        <div className="py-8 text-center text-gray-500">Loading...</div>
      ) : integrations.length === 0 && !addingType ? (
        <div className="py-8 text-center text-gray-500">
          No integrations configured yet.
        </div>
      ) : (
        <div className="space-y-4">
          {integrations.map((integration) => (
            <div
              key={integration.id}
              className="p-4 border border-gray-200 rounded-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-medium text-gray-900">
                      {integration.name}
                    </h4>
                    <span
                      className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(
                        integration.status
                      )}`}
                    >
                      {integration.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {INTEGRATION_CONFIGS[integration.type]?.name || integration.type}
                  </p>
                  {integration.lastSyncAt && (
                    <p className="text-xs text-gray-400 mt-1">
                      Last sync: {new Date(integration.lastSyncAt).toLocaleString()}
                    </p>
                  )}
                  {integration.lastError && (
                    <p className="text-xs text-red-500 mt-1">
                      Error: {integration.lastError}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTest(integration.id)}
                    disabled={testingId === integration.id}
                  >
                    {testingId === integration.id ? 'Testing...' : 'Test'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(integration.id)}
                    className="text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
