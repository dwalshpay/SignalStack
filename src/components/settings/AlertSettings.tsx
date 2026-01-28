import React, { useState } from 'react';
import { Card, Button, Input, Select, Badge } from '@/components/common';
import { useStore } from '@/store/useStore';
import type { AlertRule, AlertSeverity, AlertMetric, AlertCondition, AlertWindow } from '@/types/alerts';
import {
  ALERT_METRICS,
  ALERT_CONDITIONS,
  ALERT_WINDOWS,
  ALERT_SEVERITIES,
  createAlertRule,
  formatAlertRuleDescription,
} from '@/lib/alerts';

export const AlertSettings: React.FC = () => {
  const alertRules = useStore((state) => state.alertRules);
  const notificationPrefs = useStore((state) => state.alertNotificationPreferences);
  const addAlertRule = useStore((state) => state.addAlertRule);
  const updateAlertRule = useStore((state) => state.updateAlertRule);
  const removeAlertRule = useStore((state) => state.removeAlertRule);
  const toggleAlertRule = useStore((state) => state.toggleAlertRule);
  const setNotificationPrefs = useStore((state) => state.setAlertNotificationPreferences);
  const resetAlertRules = useStore((state) => state.resetAlertRules);

  const [isAddingRule, setIsAddingRule] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);

  // Form state for new/edit rule
  const [formState, setFormState] = useState<Partial<AlertRule>>({});

  const handleAddRule = () => {
    setFormState({
      name: '',
      metric: 'event_volume',
      condition: 'drops_by_percent',
      threshold: 20,
      window: '24h',
      severity: 'warning',
    });
    setIsAddingRule(true);
    setEditingRuleId(null);
  };

  const handleEditRule = (rule: AlertRule) => {
    setFormState({ ...rule });
    setEditingRuleId(rule.id);
    setIsAddingRule(false);
  };

  const handleSaveRule = () => {
    if (isAddingRule) {
      const newRule = createAlertRule(formState);
      addAlertRule(newRule);
    } else if (editingRuleId) {
      updateAlertRule(editingRuleId, formState);
    }
    setIsAddingRule(false);
    setEditingRuleId(null);
    setFormState({});
  };

  const handleCancelEdit = () => {
    setIsAddingRule(false);
    setEditingRuleId(null);
    setFormState({});
  };

  const handleDeleteRule = (id: string) => {
    if (confirm('Are you sure you want to delete this alert rule?')) {
      removeAlertRule(id);
    }
  };

  const toggleSeverityNotification = (severity: AlertSeverity) => {
    const current = notificationPrefs.notifyOnSeverity;
    const updated = current.includes(severity)
      ? current.filter((s) => s !== severity)
      : [...current, severity];
    setNotificationPrefs({ ...notificationPrefs, notifyOnSeverity: updated });
  };

  const isEditing = isAddingRule || editingRuleId !== null;

  return (
    <div className="space-y-6">
      {/* Alert Rules */}
      <Card
        title="Alert Rules"
        subtitle="Configure when to receive alerts about your conversion signals"
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={resetAlertRules}>
              Reset to Defaults
            </Button>
            <Button size="sm" onClick={handleAddRule} disabled={isEditing}>
              Add Rule
            </Button>
          </div>
        }
      >
        {/* Rules Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Enabled
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Rule
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Severity
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {alertRules.map((rule) => (
                <tr key={rule.id} className={!rule.enabled ? 'opacity-50' : ''}>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleAlertRule(rule.id)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        rule.enabled ? 'bg-primary-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          rule.enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-gray-900">{rule.name}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-600">
                      {formatAlertRuleDescription(rule)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        rule.severity === 'critical'
                          ? 'error'
                          : rule.severity === 'warning'
                          ? 'warning'
                          : 'info'
                      }
                    >
                      {ALERT_SEVERITIES[rule.severity].label}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleEditRule(rule)}
                      className="text-primary-600 hover:text-primary-800 text-sm mr-3"
                      disabled={isEditing}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteRule(rule.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                      disabled={isEditing}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {alertRules.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    No alert rules configured. Click "Add Rule" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Add/Edit Form */}
        {isEditing && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-4">
              {isAddingRule ? 'Add New Rule' : 'Edit Rule'}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Input
                label="Rule Name"
                value={formState.name || ''}
                onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                placeholder="e.g., EMQ Score Drop"
              />
              <Select
                label="Metric"
                value={formState.metric || 'event_volume'}
                onChange={(e) => setFormState({ ...formState, metric: e.target.value as AlertMetric })}
                options={Object.entries(ALERT_METRICS).map(([value, { label }]) => ({
                  value,
                  label,
                }))}
              />
              <Select
                label="Condition"
                value={formState.condition || 'drops_by_percent'}
                onChange={(e) => setFormState({ ...formState, condition: e.target.value as AlertCondition })}
                options={Object.entries(ALERT_CONDITIONS).map(([value, { label }]) => ({
                  value,
                  label,
                }))}
              />
              <Input
                label={`Threshold ${ALERT_CONDITIONS[formState.condition || 'drops_by_percent'].requiresPercent ? '(%)' : ''}`}
                type="number"
                value={formState.threshold?.toString() || ''}
                onChange={(e) => setFormState({ ...formState, threshold: parseFloat(e.target.value) || 0 })}
              />
              <Select
                label="Time Window"
                value={formState.window || '24h'}
                onChange={(e) => setFormState({ ...formState, window: e.target.value as AlertWindow })}
                options={Object.entries(ALERT_WINDOWS).map(([value, label]) => ({
                  value,
                  label,
                }))}
              />
              <Select
                label="Severity"
                value={formState.severity || 'warning'}
                onChange={(e) => setFormState({ ...formState, severity: e.target.value as AlertSeverity })}
                options={Object.entries(ALERT_SEVERITIES).map(([value, { label }]) => ({
                  value,
                  label,
                }))}
              />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSaveRule} disabled={!formState.name}>
                {isAddingRule ? 'Add Rule' : 'Save Changes'}
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Notification Preferences */}
      <Card title="Notification Preferences" subtitle="Choose how you want to be notified">
        <div className="space-y-4">
          {/* Email Notifications */}
          <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <span className="text-sm font-medium text-gray-900">Email Notifications</span>
              <p className="text-xs text-gray-500">Receive alerts via email</p>
            </div>
            <button
              onClick={() =>
                setNotificationPrefs({
                  ...notificationPrefs,
                  emailNotifications: !notificationPrefs.emailNotifications,
                })
              }
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notificationPrefs.emailNotifications ? 'bg-primary-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notificationPrefs.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </label>

          {/* Browser Notifications */}
          <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <span className="text-sm font-medium text-gray-900">Browser Notifications</span>
              <p className="text-xs text-gray-500">Show desktop notifications (requires permission)</p>
            </div>
            <button
              onClick={() =>
                setNotificationPrefs({
                  ...notificationPrefs,
                  browserNotifications: !notificationPrefs.browserNotifications,
                })
              }
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notificationPrefs.browserNotifications ? 'bg-primary-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notificationPrefs.browserNotifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </label>

          {/* Severity Filter */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium text-gray-900 block mb-3">
              Notify me for these severity levels:
            </span>
            <div className="flex gap-2">
              {(['info', 'warning', 'critical'] as AlertSeverity[]).map((severity) => {
                const config = ALERT_SEVERITIES[severity];
                const isSelected = notificationPrefs.notifyOnSeverity.includes(severity);
                return (
                  <button
                    key={severity}
                    onClick={() => toggleSeverityNotification(severity)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isSelected
                        ? `${config.bgColor} ${config.color} ring-2 ring-offset-1 ring-current`
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {config.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
