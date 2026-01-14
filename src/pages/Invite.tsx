import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { AuthLayout, AcceptInviteForm } from '@/components/auth';

export const Invite: React.FC = () => {
  const { token } = useParams<{ token: string }>();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <AuthLayout
      title="Join your team"
      subtitle="You've been invited to join an organization"
    >
      <AcceptInviteForm token={token} />
    </AuthLayout>
  );
};
