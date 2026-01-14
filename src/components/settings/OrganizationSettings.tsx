import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, Button, Input, useToast } from '@/components/common';
import { useAuthStore } from '@/store/useAuthStore';

interface OrgFormData {
  name: string;
}

export const OrganizationSettings: React.FC = () => {
  const organization = useAuthStore((state) => state.organization);
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<OrgFormData>({
    defaultValues: {
      name: organization?.name || '',
    },
  });

  const onSubmit = async (_data: OrgFormData) => {
    setIsLoading(true);
    try {
      // API call would go here
      // await updateOrganization(organization.id, _data);
      addToast('success', 'Organization updated successfully');
    } catch {
      addToast('error', 'Failed to update organization');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card title="Organization" subtitle="Manage your organization settings">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label
            htmlFor="orgName"
            className="block text-sm font-medium text-gray-700"
          >
            Organization name
          </label>
          <div className="mt-1">
            <Input
              id="orgName"
              type="text"
              {...register('name', {
                required: 'Organization name is required',
                minLength: {
                  value: 2,
                  message: 'Organization name must be at least 2 characters',
                },
              })}
              error={errors.name?.message}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Organization slug
          </label>
          <div className="mt-1">
            <Input
              type="text"
              value={organization?.slug || ''}
              disabled
              className="bg-gray-50"
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            The slug is auto-generated and cannot be changed.
          </p>
        </div>

        <div className="pt-4">
          <Button
            type="submit"
            variant="primary"
            disabled={!isDirty || isLoading}
          >
            {isLoading ? 'Saving...' : 'Save changes'}
          </Button>
        </div>
      </form>

      <div className="mt-8 pt-8 border-t border-gray-200">
        <h3 className="text-sm font-medium text-gray-900">Organization details</h3>
        <dl className="mt-4 space-y-3">
          <div className="flex justify-between">
            <dt className="text-sm text-gray-500">Organization ID</dt>
            <dd className="text-sm font-mono text-gray-900">
              {organization?.id || '-'}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-sm text-gray-500">Created</dt>
            <dd className="text-sm font-medium text-gray-900">
              {organization?.createdAt
                ? new Date(organization.createdAt).toLocaleDateString()
                : '-'}
            </dd>
          </div>
        </dl>
      </div>
    </Card>
  );
};
