import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, Button, Input, Select, useToast } from '@/components/common';
import { inviteUser } from '@/lib/api';
import { getErrorMessage } from '@/lib/api/errors';
import { useAuthStore } from '@/store/useAuthStore';
import type { UserRole } from '@/types/api';

interface InviteFormData {
  email: string;
  role: UserRole;
}

export const TeamMembers: React.FC = () => {
  const { addToast } = useToast();
  const user = useAuthStore((state) => state.user);
  const organization = useAuthStore((state) => state.organization);
  const [isInviting, setIsInviting] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InviteFormData>({
    defaultValues: {
      role: 'MEMBER',
    },
  });

  const onSubmit = async (data: InviteFormData) => {
    setIsInviting(true);
    try {
      await inviteUser(data);
      addToast('success', `Invitation sent to ${data.email}`);
      reset();
      setShowInviteForm(false);
    } catch (err) {
      addToast('error', getErrorMessage(err));
    } finally {
      setIsInviting(false);
    }
  };

  // Mock team members - would come from API
  const teamMembers = [
    {
      id: user?.id,
      name: user?.name,
      email: user?.email,
      role: user?.role,
      status: 'active',
    },
  ];

  const roleOptions = [
    { value: 'ADMIN', label: 'Admin - Full access' },
    { value: 'MEMBER', label: 'Member - Can edit data' },
    { value: 'VIEWER', label: 'Viewer - Read only' },
  ];

  return (
    <Card title="Team Members" subtitle="Manage your organization's team">
      {/* Invite form */}
      {showInviteForm ? (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mb-6 p-4 bg-gray-50 rounded-lg"
        >
          <h4 className="text-sm font-medium text-gray-900 mb-4">
            Invite new team member
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <Input
                type="email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
                error={errors.email?.message}
                className="mt-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Role
              </label>
              <Select
                {...register('role')}
                options={roleOptions}
                className="mt-1"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button type="submit" variant="primary" disabled={isInviting}>
              {isInviting ? 'Sending...' : 'Send invite'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowInviteForm(false);
                reset();
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <div className="mb-6">
          <Button variant="primary" onClick={() => setShowInviteForm(true)}>
            Invite team member
          </Button>
        </div>
      )}

      {/* Team list */}
      <div className="space-y-3">
        {teamMembers.map((member) => (
          <div
            key={member.id}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-medium">
                {member.name
                  ?.split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {member.name}
                  {member.id === user?.id && (
                    <span className="ml-2 text-xs text-gray-500">(You)</span>
                  )}
                </p>
                <p className="text-xs text-gray-500">{member.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 capitalize">
                {member.role?.toLowerCase()}
              </span>
              {member.id !== user?.id && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:bg-red-50"
                >
                  Remove
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Organization info */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-sm text-gray-500">
          Team members belong to <strong>{organization?.name}</strong>.
          Invitations expire after 7 days.
        </p>
      </div>
    </Card>
  );
};
