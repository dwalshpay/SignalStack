import React from 'react';
import { AuthLayout, LoginForm } from '@/components/auth';

export const Login: React.FC = () => {
  return (
    <AuthLayout
      title="Sign in to your account"
      subtitle="Access your value calculator and optimization tools"
    >
      <LoginForm />
    </AuthLayout>
  );
};
