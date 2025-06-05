
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserRole } from '@/hooks/use-user-role';
import { toast } from 'sonner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useDashboardData } from '@/hooks/use-dashboard-data';
import DashboardLoading from '@/components/dashboard/DashboardLoading';
import DashboardMetrics from '@/components/dashboard/DashboardMetrics';
import EnhancedLeadsChart from '@/components/dashboard/EnhancedLeadsChart';
import PerformanceOverview from '@/components/dashboard/PerformanceOverview';
import RecentLeadsList from '@/components/dashboard/RecentLeadsList';
import InfoCard from '@/components/dashboard/InfoCard';

const Dashboard = () => {
  const navigate = useNavigate();
  const { isLoggedIn, role, user } = useUserRole();
  const { isLoading, dashboardData } = useDashboardData(isLoggedIn, role, user?.id);
  
  React.useEffect(() => {
    if (!isLoggedIn) {
      toast.error("You must be logged in to view your dashboard");
      navigate('/login');
    }
  }, [isLoggedIn, navigate]);
  
  if (isLoading) {
    return <DashboardLoading />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-gray-600 text-lg">
            {role === 'seller' 
              ? 'Monitor your lead sales and business performance' 
              : 'Track your lead purchases and conversion metrics'}
          </p>
        </div>
        
        {/* Enhanced Dashboard Metrics */}
        <DashboardMetrics data={dashboardData} role={role} />
        
        {/* Performance Overview */}
        <PerformanceOverview data={dashboardData} role={role} />
        
        {/* Enhanced Chart */}
        <EnhancedLeadsChart 
          title={role === 'seller' ? 'Lead Sales Analytics' : 'Purchase Analytics'}
          description={role === 'seller' 
            ? 'Track your lead sales performance and revenue over time'
            : 'Monitor your lead purchases and spending patterns'
          }
          data={dashboardData.monthlyLeadData}
          categoryData={dashboardData.categoryBreakdown}
          barName={role === 'seller' ? 'Leads Sold' : 'Leads Purchased'}
          showRevenue={true}
        />
        
        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentLeadsList 
            title={role === 'seller' ? 'Recent Sales' : 'Recent Purchases'}
            description={`Your most recent ${role === 'seller' ? 'lead sales' : 'lead purchases'}`}
            leads={dashboardData.recentLeads}
            userRole={role === 'seller' ? 'seller' : 'buyer'}
          />
          
          <InfoCard
            title={role === 'seller' ? 'Business Insights' : 'Performance Insights'}
            description={role === 'seller' 
              ? 'Key metrics and growth opportunities' 
              : 'Optimization tips and conversion insights'}
          />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
