
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserRole } from '@/hooks/use-user-role';
import { toast } from 'sonner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowUpRight, DollarSign, UserCheck, Package, Activity } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const { isLoggedIn, role } = useUserRole();
  
  React.useEffect(() => {
    if (!isLoggedIn) {
      toast.error("You must be logged in to view your dashboard");
      navigate('/login');
    }
  }, [isLoggedIn, navigate]);
  
  // Reset all mock data to zero
  const dashboardData = {
    totalLeads: 0,
    activeLeads: 0,
    totalRevenue: 0,
    totalSpent: 0,
    conversionRate: 0,
    monthlyLeadData: [
      { name: 'Jan', value: 0 },
      { name: 'Feb', value: 0 },
      { name: 'Mar', value: 0 },
      { name: 'Apr', value: 0 },
      { name: 'May', value: 0 },
    ]
  };

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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Card 1 */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {role === 'seller' ? 'Total Leads Posted' : 'Total Leads Purchased'}
              </CardTitle>
              <Package className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.totalLeads}</div>
              <p className="text-xs text-muted-foreground">
                +0 from last month
              </p>
            </CardContent>
          </Card>
          
          {/* Card 2 */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {role === 'seller' ? 'Active Leads' : 'Conversion Rate'}
              </CardTitle>
              {role === 'seller' 
                ? <Activity className="h-4 w-4 text-gray-500" /> 
                : <UserCheck className="h-4 w-4 text-gray-500" />}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {role === 'seller' ? dashboardData.activeLeads : `${dashboardData.conversionRate}%`}
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3 text-green-500" />
                {role === 'seller' ? '+0 from last month' : '+0% from last month'}
              </p>
            </CardContent>
          </Card>
          
          {/* Card 3 */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {role === 'seller' ? 'Revenue' : 'Total Spent'}
              </CardTitle>
              <DollarSign className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${role === 'seller' ? dashboardData.totalRevenue : dashboardData.totalSpent}
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3 text-green-500" />
                +$0 from last month
              </p>
            </CardContent>
          </Card>
          
          {/* Card 4 */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {role === 'seller' ? 'Average Price per Lead' : 'Average Cost per Lead'}
              </CardTitle>
              <DollarSign className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                $0
              </div>
              <p className="text-xs text-muted-foreground">
                +$0 from last month
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Chart */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{role === 'seller' ? 'Lead Sales' : 'Lead Purchases'} by Month</CardTitle>
            <CardDescription>
              {role === 'seller' 
                ? 'Number of leads sold per month'
                : 'Number of leads purchased per month'}
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-0">
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={dashboardData.monthlyLeadData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar 
                    dataKey="value" 
                    fill="#3B82F6" 
                    radius={[4, 4, 0, 0]} 
                    name={role === 'seller' ? 'Leads Sold' : 'Leads Purchased'} 
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Additional information section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {role === 'seller' ? 'Recent Sales' : 'Recent Purchases'}
              </CardTitle>
              <CardDescription>
                Your most recent {role === 'seller' ? 'lead sales' : 'lead purchases'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6">
                <p className="text-sm text-gray-500">
                  This feature will be available soon
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>
                {role === 'seller' ? 'Top Performing Leads' : 'Lead Performance'}
              </CardTitle>
              <CardDescription>
                {role === 'seller' 
                  ? 'Your best selling lead categories' 
                  : 'How your purchased leads are performing'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6">
                <p className="text-sm text-gray-500">
                  This feature will be available soon
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
