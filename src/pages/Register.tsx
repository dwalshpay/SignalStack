import React from 'react';
import { AuthLayout, RegisterForm } from '@/components/auth';

export const Register: React.FC = () => {
  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start optimizing your ad signals today"
    >
      <RegisterForm />
    </AuthLayout>
  );
};
