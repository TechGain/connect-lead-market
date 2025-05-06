
import React from 'react';
import AdminChatDashboard from '@/components/admin/AdminChatDashboard';
import { useUserRole } from '@/hooks/use-user-role';
import { Navigate } from 'react-router-dom';
import Header from '@/components/Header';

const AdminChatDashboardPage = () => {
  const { isAdmin, isLoading } = useUserRole();
  
  if (isLoading) {
    return <div className="container mx-auto py-8 flex justify-center">Loading...</div>;
  }
  
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  return (
    <>
      <Header />
      <div className="container mx-auto py-6">
        <AdminChatDashboard />
      </div>
    </>
  );
};

export default AdminChatDashboardPage;
