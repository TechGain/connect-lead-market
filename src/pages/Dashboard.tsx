
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserRole } from '@/hooks/use-user-role';
import { toast } from 'sonner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowUpRight, DollarSign, UserCheck, Package, Activity, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency, ensureNumber } from '@/utils/format-helpers';

const Dashboard = () => {
  const navigate = useNavigate();
  const { isLoggedIn, role, user } = useUserRole();
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalLeads: 0,
    activeLeads: 0,
    totalRevenue: 0,
    totalSpent: 0,
    averagePricePerLead: 0,
    conversionRate: 0,
    monthlyLeadData: [],
    recentLeads: []
  });
  
  useEffect(() => {
    if (!isLoggedIn) {
      toast.error("You must be logged in to view your dashboard");
      navigate('/login');
      return;
    }
    
    loadDashboardData();
  }, [isLoggedIn, navigate, role, user?.id]);
  
  const loadDashboardData = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      if (role === 'seller') {
        await loadSellerDashboard(user.id);
      } else if (role === 'buyer') {
        await loadBuyerDashboard(user.id);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };
  
  const loadSellerDashboard = async (userId) => {
    console.log('Loading seller dashboard for user:', userId);
    
    // Fetch all leads posted by this seller
    const { data: allLeads, error: leadsError } = await supabase
      .from('leads')
      .select('*')
      .eq('seller_id', userId);
    
    if (leadsError) {
      console.error('Error fetching seller leads:', leadsError);
      throw leadsError;
    }
    
    // Calculate dashboard metrics
    const totalLeads = allLeads.length;
    const soldLeads = allLeads.filter(lead => lead.status === 'sold');
    const activeLeads = allLeads.filter(lead => lead.status !== 'sold');
    const totalRevenue = soldLeads.reduce((sum, lead) => sum + ensureNumber(lead.price), 0);
    
    // Fix for the error - Ensure we're using numbers for division
    const soldLeadsCount = ensureNumber(soldLeads.length);
    const averagePricePerLead = soldLeadsCount > 0 ? totalRevenue / soldLeadsCount : 0;
    
    // Generate monthly data
    const monthlyData = generateMonthlyData(soldLeads);
    
    // Get recent leads (last 5)
    const recentLeads = allLeads
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5);
    
    setDashboardData({
      totalLeads,
      activeLeads: activeLeads.length,
      totalRevenue,
      totalSpent: 0, // Not relevant for sellers
      averagePricePerLead: averagePricePerLead || 0,
      conversionRate: totalLeads > 0 ? Math.round((soldLeadsCount / totalLeads) * 100) : 0,
      monthlyLeadData: monthlyData,
      recentLeads
    });
  };
  
  const loadBuyerDashboard = async (userId) => {
    console.log('Loading buyer dashboard for user:', userId);
    
    // Fetch all leads purchased by this buyer
    const { data: purchasedLeads, error: leadsError } = await supabase
      .from('leads')
      .select('*')
      .eq('buyer_id', userId)
      .eq('status', 'sold');
    
    if (leadsError) {
      console.error('Error fetching buyer leads:', leadsError);
      throw leadsError;
    }
    
    const totalLeads = purchasedLeads.length;
    const totalSpent = purchasedLeads.reduce((sum, lead) => sum + ensureNumber(lead.price), 0);
    
    // Fix for the error - Ensure we're using numbers for division
    const purchasedLeadsCount = ensureNumber(totalLeads);
    const averageCostPerLead = purchasedLeadsCount > 0 ? totalSpent / purchasedLeadsCount : 0;
    
    // Generate monthly data for purchases
    const monthlyData = generateMonthlyData(purchasedLeads);
    
    // Get recent purchases (last 5)
    const recentLeads = purchasedLeads
      .sort((a, b) => new Date(b.purchased_at) - new Date(a.purchased_at))
      .slice(0, 5);
    
    setDashboardData({
      totalLeads,
      activeLeads: 0, // Not relevant for buyers
      totalRevenue: 0, // Not relevant for buyers
      totalSpent,
      averagePricePerLead: averageCostPerLead || 0,
      conversionRate: 0, // Not relevant for buyers in this context
      monthlyLeadData: monthlyData,
      recentLeads
    });
  };
  
  const generateMonthlyData = (leads) => {
    // Initialize with past 6 months
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthName = date.toLocaleString('default', { month: 'short' });
      months.push({ 
        name: monthName, 
        value: 0,
        month: date.getMonth(),
        year: date.getFullYear()
      });
    }
    
    // Count leads by month
    leads.forEach(lead => {
      const leadDate = new Date(role === 'seller' ? lead.created_at : lead.purchased_at);
      const monthIndex = months.findIndex(m => 
        m.month === leadDate.getMonth() && m.year === leadDate.getFullYear()
      );
      
      if (monthIndex !== -1) {
        months[monthIndex].value += 1;
      }
    });
    
    return months.map(({ name, value }) => ({ name, value }));
  };
  
  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading dashboard data...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
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
                Your lifetime total
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
                {role === 'seller' ? 'Currently active' : 'From total leads'}
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
                ${role === 'seller' 
                  ? formatCurrency(dashboardData.totalRevenue) 
                  : formatCurrency(dashboardData.totalSpent)}
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3 text-green-500" />
                Lifetime total
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
                ${formatCurrency(dashboardData.averagePricePerLead)}
              </div>
              <p className="text-xs text-muted-foreground">
                Based on {dashboardData.totalLeads} leads
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
              {dashboardData.recentLeads.length > 0 ? (
                <div className="space-y-4">
                  {dashboardData.recentLeads.map(lead => (
                    <div key={lead.id} className="border-b pb-3">
                      <div className="flex justify-between">
                        <h3 className="font-medium">{lead.type} in {lead.location}</h3>
                        <span className="text-sm font-semibold">${formatCurrency(lead.price)}</span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(role === 'seller' ? lead.created_at : lead.purchased_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-sm text-gray-500">
                    No {role === 'seller' ? 'sales' : 'purchases'} yet
                  </p>
                </div>
              )}
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
