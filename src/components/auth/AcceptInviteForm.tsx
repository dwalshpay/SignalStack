import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Button, Input } from '@/components/common';
import { useAuthStore } from '@/store/useAuthStore';
import { getErrorMessage } from '@/lib/api';

interface AcceptInviteFormProps {
  token: string;
  email?: string;
}

interface AcceptInviteFormData {
  name: string;
  password: string;
  confirmPassword: string;
}

export const AcceptInviteForm: React.FC<AcceptInviteFormProps> = ({
  token,
  email,
}) => {
  const navigate = useNavigate();
  const acceptInvite = useAuthStore((state) => state.acceptInvite);
  const isLoading = useAuthStore((state) => state.isLoading);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<AcceptInviteFormData>();

  const password = watch('password');

  const onSubmit = async (data: AcceptInviteFormData) => {
    setError(null);
    try {
      await acceptInvite(token, data.password, data.name);
      navigate('/calculator', { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {email && (
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Email address
          </label>
          <div className="mt-1">
            <Input type="email" value={email} disabled />
          </div>
        </div>
      )}

      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700"
        >
          Your name
        </label>
        <div className="mt-1">
          <Input
            id="name"
            type="text"
            autoComplete="name"
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
          htmlFor="password"
          className="block text-sm font-medium text-gray-700"
        >
          Password
        </label>
        <div className="mt-1">
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            {...register('password', {
              required: 'Password is required',
              minLength: {
                value: 8,
                message: 'Password must be at least 8 characters',
              },
            })}
            error={errors.password?.message}
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium text-gray-700"
        >
          Confirm password
        </label>
        <div className="mt-1">
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            {...register('confirmPassword', {
              required: 'Please confirm your password',
              validate: (value) =>
                value === password || 'Passwords do not match',
            })}
            error={errors.confirmPassword?.message}
          />
        </div>
      </div>

      <div>
        <Button
          type="submit"
          variant="primary"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? 'Joining...' : 'Join organization'}
        </Button>
      </div>
    </form>
  );
};
