
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserRole } from '@/hooks/use-user-role';
import { toast } from 'sonner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useDashboardData } from '@/hooks/use-dashboard-data';
import DashboardLoading from '@/components/dashboard/DashboardLoading';
import DashboardMetrics from '@/components/dashboard/DashboardMetrics';
import LeadsChart from '@/components/dashboard/LeadsChart';
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
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-gray-600">
            {role === 'seller' 
              ? 'Monitor your lead sales and business performance' 
              : 'Track your lead purchases and conversion metrics'}
          </p>
        </div>
        
        {/* Dashboard Metrics */}
        <DashboardMetrics data={dashboardData} role={role} />
        
        {/* Chart */}
        <LeadsChart 
          title={role === 'seller' ? 'Lead Sales' : 'Lead Purchases'}
          description={role === 'seller' 
            ? 'Number of leads sold per month'
            : 'Number of leads purchased per month'
          }
          data={dashboardData.monthlyLeadData}
          barName={role === 'seller' ? 'Leads Sold' : 'Leads Purchased'}
        />
        
        {/* Additional information section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentLeadsList 
            title={role === 'seller' ? 'Recent Sales' : 'Recent Purchases'}
            description={`Your most recent ${role === 'seller' ? 'lead sales' : 'lead purchases'}`}
            leads={dashboardData.recentLeads}
            userRole={role === 'seller' ? 'seller' : 'buyer'}
          />
          
          <InfoCard
            title={role === 'seller' ? 'Top Performing Leads' : 'Lead Performance'}
            description={role === 'seller' 
              ? 'Your best selling lead categories' 
              : 'How your purchased leads are performing'}
          />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
