import React, { useState, useEffect } from 'react';
import { Card, Button, Input, useToast } from '@/components/common';
import { listAPIKeys, createAPIKey, deleteAPIKey } from '@/lib/api';
import { getErrorMessage } from '@/lib/api/errors';
import type { APIKey, APIKeyCreateResponse } from '@/types/api';

export const APIKeyManager: React.FC = () => {
  const { addToast } = useToast();
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);

  useEffect(() => {
    loadAPIKeys();
  }, []);

  const loadAPIKeys = async () => {
    try {
      const keys = await listAPIKeys();
      setApiKeys(keys);
    } catch (err) {
      addToast('error', getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) return;

    setIsCreating(true);
    try {
      const response: APIKeyCreateResponse = await createAPIKey({
        name: newKeyName,
        scopes: ['*'],
      });
      setNewlyCreatedKey(response.key);
      setApiKeys([...apiKeys, response]);
      setNewKeyName('');
      setShowCreateForm(false);
      addToast('success', 'API key created successfully');
    } catch (err) {
      addToast('error', getErrorMessage(err));
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteKey = async (id: string) => {
    if (!confirm('Are you sure you want to delete this API key? This cannot be undone.')) {
      return;
    }

    try {
      await deleteAPIKey(id);
      setApiKeys(apiKeys.filter((k) => k.id !== id));
      addToast('success', 'API key deleted');
    } catch (err) {
      addToast('error', getErrorMessage(err));
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    addToast('success', 'Copied to clipboard');
  };

  return (
    <Card title="API Keys" subtitle="Manage API keys for programmatic access">
      {/* New key warning */}
      {newlyCreatedKey && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-amber-800">
                Save your API key now
              </h4>
              <p className="text-sm text-amber-700 mt-1">
                This is the only time you'll see this key. Copy it and store it securely.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <code className="flex-1 px-3 py-2 bg-white border border-amber-300 rounded text-sm font-mono text-gray-900 break-all">
                  {newlyCreatedKey}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(newlyCreatedKey)}
                >
                  Copy
                </Button>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => setNewlyCreatedKey(null)}
              >
                I've saved this key
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Create form */}
      {showCreateForm ? (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Create new API key
          </h4>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Key name (e.g., Production Webhook)"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              className="flex-1"
            />
            <Button
              variant="primary"
              onClick={handleCreateKey}
              disabled={!newKeyName.trim() || isCreating}
            >
              {isCreating ? 'Creating...' : 'Create'}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateForm(false);
                setNewKeyName('');
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="mb-6">
          <Button variant="primary" onClick={() => setShowCreateForm(true)}>
            Create API key
          </Button>
        </div>
      )}

      {/* Keys list */}
      {isLoading ? (
        <div className="py-8 text-center text-gray-500">Loading...</div>
      ) : apiKeys.length === 0 ? (
        <div className="py-8 text-center text-gray-500">
          No API keys yet. Create one to get started.
        </div>
      ) : (
        <div className="space-y-3">
          {apiKeys.map((key) => (
            <div
              key={key.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div>
                <p className="text-sm font-medium text-gray-900">{key.name}</p>
                <p className="text-xs text-gray-500 font-mono mt-1">
                  {key.keyPrefix}...
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Created {new Date(key.createdAt).toLocaleDateString()}
                  {key.lastUsedAt && (
                    <> · Last used {new Date(key.lastUsedAt).toLocaleDateString()}</>
                  )}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDeleteKey(key.id)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                Delete
              </Button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
