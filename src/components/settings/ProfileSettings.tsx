import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, Button, Input, useToast } from '@/components/common';
import { useAuthStore } from '@/store/useAuthStore';

interface ProfileFormData {
  name: string;
  email: string;
}

export const ProfileSettings: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
    },
  });

  const onSubmit = async (_data: ProfileFormData) => {
    setIsLoading(true);
    try {
      // API call would go here
      // await updateProfile(_data);
      addToast('success', 'Profile updated successfully');
    } catch {
      addToast('error', 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card title="Profile" subtitle="Manage your personal information">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Name
          </label>
          <div className="mt-1">
            <Input
              id="name"
              type="text"
              {...register('name', {
                required: 'Name is required',
                minLength: {
                  value: 2,
                  message: 'Name must be at least 2 characters',
                },
              })}
              error={errors.name?.message}
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email address
          </label>
          <div className="mt-1">
            <Input
              id="email"
              type="email"
              {...register('email')}
              disabled
              className="bg-gray-50"
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Email cannot be changed. Contact support if you need to update it.
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
        <h3 className="text-sm font-medium text-gray-900">Account details</h3>
        <dl className="mt-4 space-y-3">
          <div className="flex justify-between">
            <dt className="text-sm text-gray-500">Role</dt>
            <dd className="text-sm font-medium text-gray-900 capitalize">
              {user?.role.toLowerCase()}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-sm text-gray-500">Member since</dt>
            <dd className="text-sm font-medium text-gray-900">
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString()
                : '-'}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-sm text-gray-500">Last login</dt>
            <dd className="text-sm font-medium text-gray-900">
              {user?.lastLoginAt
                ? new Date(user.lastLoginAt).toLocaleString()
                : 'Never'}
            </dd>
          </div>
        </dl>
      </div>
    </Card>
  );
};
