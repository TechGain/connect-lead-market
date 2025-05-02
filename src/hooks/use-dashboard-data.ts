
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatCurrency, ensureNumber } from '@/utils/format-helpers';

export interface DashboardData {
  totalLeads: number;
  activeLeads: number;
  totalRevenue: number;
  totalSpent: number;
  averagePricePerLead: number;
  conversionRate: number;
  monthlyLeadData: { name: string; value: number }[];
  recentLeads: any[];
}

export const useDashboardData = (isLoggedIn: boolean, role: string | null, userId: string | undefined) => {
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
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
    if (!isLoggedIn || !userId) return;
    
    loadDashboardData();
  }, [isLoggedIn, role, userId]);
  
  const loadDashboardData = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      if (role === 'seller') {
        await loadSellerDashboard(userId);
      } else if (role === 'buyer') {
        await loadBuyerDashboard(userId);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };
  
  const loadSellerDashboard = async (userId: string) => {
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
    
    // Fix - Convert values to numbers before arithmetic operations
    const averagePricePerLead = totalRevenue > 0 && soldLeadsCount > 0 ? 
      ensureNumber(totalRevenue) / ensureNumber(soldLeadsCount) : 0;
    
    // Generate monthly data
    const monthlyData = generateMonthlyData(soldLeads, 'seller');
    
    // Get recent leads (last 5)
    const recentLeads = allLeads
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);
    
    setDashboardData({
      totalLeads,
      activeLeads: activeLeads.length,
      totalRevenue,
      totalSpent: 0, // Not relevant for sellers
      averagePricePerLead: averagePricePerLead || 0,
      conversionRate: totalLeads > 0 ? Math.round((soldLeadsCount / ensureNumber(totalLeads)) * 100) : 0,
      monthlyLeadData: monthlyData,
      recentLeads
    });
  };
  
  const loadBuyerDashboard = async (userId: string) => {
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
    
    // Fix - Convert values to numbers before arithmetic operations
    const averageCostPerLead = totalSpent > 0 && purchasedLeadsCount > 0 ? 
      ensureNumber(totalSpent) / ensureNumber(purchasedLeadsCount) : 0;
    
    // Generate monthly data for purchases
    const monthlyData = generateMonthlyData(purchasedLeads, 'buyer');
    
    // Get recent purchases (last 5)
    const recentLeads = purchasedLeads
      .sort((a, b) => new Date(b.purchased_at).getTime() - new Date(a.purchased_at).getTime())
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
  
  const generateMonthlyData = (leads: any[], userRole: 'seller' | 'buyer') => {
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
      const leadDate = new Date(userRole === 'seller' ? lead.created_at : lead.purchased_at);
      const monthIndex = months.findIndex(m => 
        m.month === leadDate.getMonth() && m.year === leadDate.getFullYear()
      );
      
      if (monthIndex !== -1) {
        months[monthIndex].value += 1;
      }
    });
    
    return months.map(({ name, value }) => ({ name, value }));
  };

  return { isLoading, dashboardData, loadDashboardData };
};
