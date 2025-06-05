
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatCurrency, ensureNumber } from '@/utils/format-helpers';

export interface DashboardData {
  // Common metrics
  totalLeads: number;
  totalRevenue: number;
  totalSpent: number;
  averagePricePerLead: number;
  
  // Seller-specific metrics
  activeLeads: number;
  soldLeads: number;
  refundedLeads: number;
  erasedLeads: number;
  refundLosses: number;
  sellThroughRate: number;
  averageLeadRating: number;
  successRate: number;
  
  // Buyer-specific metrics
  totalPurchases: number;
  refundedAmount: number;
  averageCostPerLead: number;
  conversionRate: number;
  roiPercentage: number;
  ratingsGiven: number;
  
  // Chart data
  monthlyLeadData: { name: string; value: number; revenue?: number }[];
  categoryBreakdown: { category: string; count: number; revenue: number }[];
  recentLeads: any[];
  
  // Performance indicators
  monthlyGrowth: number;
  weeklyActivity: number;
  topPerformingCategory: string;
}

export const useDashboardData = (isLoggedIn: boolean, role: string | null, userId: string | undefined) => {
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalLeads: 0,
    activeLeads: 0,
    soldLeads: 0,
    refundedLeads: 0,
    erasedLeads: 0,
    totalRevenue: 0,
    totalSpent: 0,
    refundLosses: 0,
    averagePricePerLead: 0,
    sellThroughRate: 0,
    averageLeadRating: 0,
    successRate: 0,
    totalPurchases: 0,
    refundedAmount: 0,
    averageCostPerLead: 0,
    conversionRate: 0,
    roiPercentage: 0,
    ratingsGiven: 0,
    monthlyLeadData: [],
    categoryBreakdown: [],
    recentLeads: [],
    monthlyGrowth: 0,
    weeklyActivity: 0,
    topPerformingCategory: ''
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
    console.log('Loading enhanced seller dashboard for user:', userId);
    
    // Fetch all leads posted by this seller
    const { data: allLeads, error: leadsError } = await supabase
      .from('leads')
      .select('*')
      .eq('seller_id', userId);
    
    if (leadsError) {
      console.error('Error fetching seller leads:', leadsError);
      throw leadsError;
    }
    
    // Fetch ratings for sold leads
    const { data: ratings, error: ratingsError } = await supabase
      .from('lead_ratings')
      .select('rating, lead_id')
      .in('lead_id', allLeads.map(lead => lead.id));
    
    if (ratingsError) {
      console.error('Error fetching ratings:', ratingsError);
    }
    
    // Calculate comprehensive metrics
    const totalLeads = allLeads.length;
    const soldLeads = allLeads.filter(lead => lead.status === 'sold');
    const activeLeads = allLeads.filter(lead => lead.status === 'new');
    const refundedLeads = allLeads.filter(lead => lead.status === 'refunded');
    const erasedLeads = allLeads.filter(lead => lead.status === 'deleted');
    
    const totalRevenue = soldLeads.reduce((sum, lead) => sum + ensureNumber(lead.price), 0);
    const refundLosses = refundedLeads.reduce((sum, lead) => sum + ensureNumber(lead.price), 0);
    const soldLeadsCount = ensureNumber(soldLeads.length);
    
    const averagePricePerLead = totalRevenue > 0 && soldLeadsCount > 0 ? 
      ensureNumber(totalRevenue) / ensureNumber(soldLeadsCount) : 0;
    
    const sellThroughRate = totalLeads > 0 ? (soldLeadsCount / totalLeads) * 100 : 0;
    const successRate = totalLeads > 0 ? ((soldLeadsCount + activeLeads.length) / totalLeads) * 100 : 0;
    
    // Calculate average rating
    const leadRatings = ratings?.filter(r => soldLeads.some(lead => lead.id === r.lead_id)) || [];
    const averageLeadRating = leadRatings.length > 0 ? 
      leadRatings.reduce((sum, r) => sum + r.rating, 0) / leadRatings.length : 0;
    
    // Generate enhanced monthly data
    const monthlyData = generateEnhancedMonthlyData(soldLeads, 'seller');
    
    // Calculate monthly growth
    const currentMonth = monthlyData[monthlyData.length - 1]?.value || 0;
    const previousMonth = monthlyData[monthlyData.length - 2]?.value || 0;
    const monthlyGrowth = previousMonth > 0 ? ((currentMonth - previousMonth) / previousMonth) * 100 : 0;
    
    // Calculate weekly activity
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const weeklyActivity = allLeads.filter(lead => 
      new Date(lead.created_at) >= oneWeekAgo
    ).length;
    
    // Category breakdown
    const categoryBreakdown = generateCategoryBreakdown(soldLeads);
    const topPerformingCategory = categoryBreakdown.length > 0 ? 
      categoryBreakdown.sort((a, b) => b.revenue - a.revenue)[0].category : '';
    
    // Get recent leads (last 5)
    const recentLeads = allLeads
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);
    
    setDashboardData({
      totalLeads,
      activeLeads: activeLeads.length,
      soldLeads: soldLeadsCount,
      refundedLeads: refundedLeads.length,
      erasedLeads: erasedLeads.length,
      totalRevenue,
      refundLosses,
      totalSpent: 0,
      averagePricePerLead: averagePricePerLead || 0,
      sellThroughRate: Math.round(sellThroughRate),
      averageLeadRating: Math.round(averageLeadRating * 10) / 10,
      successRate: Math.round(successRate),
      totalPurchases: 0,
      refundedAmount: 0,
      averageCostPerLead: 0,
      conversionRate: 0,
      roiPercentage: 0,
      ratingsGiven: 0,
      monthlyLeadData: monthlyData,
      categoryBreakdown,
      recentLeads,
      monthlyGrowth: Math.round(monthlyGrowth),
      weeklyActivity,
      topPerformingCategory
    });
  };
  
  const loadBuyerDashboard = async (userId: string) => {
    console.log('Loading enhanced buyer dashboard for user:', userId);
    
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
    
    // Fetch refunded leads
    const { data: refundedLeads, error: refundError } = await supabase
      .from('leads')
      .select('*')
      .eq('buyer_id', userId)
      .eq('status', 'refunded');
    
    if (refundError) {
      console.error('Error fetching refunded leads:', refundError);
    }
    
    // Fetch ratings given by this buyer
    const { data: ratingsGiven, error: ratingsError } = await supabase
      .from('lead_ratings')
      .select('*')
      .eq('buyer_id', userId);
    
    if (ratingsError) {
      console.error('Error fetching ratings given:', ratingsError);
    }
    
    const totalPurchases = purchasedLeads.length;
    const totalSpent = purchasedLeads.reduce((sum, lead) => sum + ensureNumber(lead.price), 0);
    const refundedAmount = (refundedLeads || []).reduce((sum, lead) => sum + ensureNumber(lead.price), 0);
    
    const averageCostPerLead = totalSpent > 0 && totalPurchases > 0 ? 
      totalSpent / totalPurchases : 0;
    
    // Calculate conversion rate based on successful sales in ratings
    const successfulConversions = ratingsGiven?.filter(r => r.successful_sale)?.length || 0;
    const conversionRate = totalPurchases > 0 ? (successfulConversions / totalPurchases) * 100 : 0;
    
    // Calculate ROI (simplified - based on successful conversions vs cost)
    const roiPercentage = totalSpent > 0 && successfulConversions > 0 ? 
      ((successfulConversions * averageCostPerLead * 2 - totalSpent) / totalSpent) * 100 : 0;
    
    // Generate monthly data for purchases
    const monthlyData = generateEnhancedMonthlyData(purchasedLeads, 'buyer');
    
    // Calculate monthly growth
    const currentMonth = monthlyData[monthlyData.length - 1]?.value || 0;
    const previousMonth = monthlyData[monthlyData.length - 2]?.value || 0;
    const monthlyGrowth = previousMonth > 0 ? ((currentMonth - previousMonth) / previousMonth) * 100 : 0;
    
    // Calculate weekly activity
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const weeklyActivity = purchasedLeads.filter(lead => 
      new Date(lead.purchased_at || lead.created_at) >= oneWeekAgo
    ).length;
    
    // Category breakdown
    const categoryBreakdown = generateCategoryBreakdown(purchasedLeads);
    const topPerformingCategory = categoryBreakdown.length > 0 ? 
      categoryBreakdown.sort((a, b) => b.count - a.count)[0].category : '';
    
    // Get recent purchases (last 5)
    const recentLeads = purchasedLeads
      .sort((a, b) => new Date(b.purchased_at || b.created_at).getTime() - new Date(a.purchased_at || a.created_at).getTime())
      .slice(0, 5);
    
    setDashboardData({
      totalLeads: totalPurchases,
      activeLeads: 0,
      soldLeads: 0,
      refundedLeads: (refundedLeads || []).length,
      erasedLeads: 0,
      totalRevenue: 0,
      refundLosses: 0,
      totalSpent,
      refundedAmount,
      averagePricePerLead: averageCostPerLead || 0,
      sellThroughRate: 0,
      averageLeadRating: 0,
      successRate: 0,
      totalPurchases,
      averageCostPerLead: averageCostPerLead || 0,
      conversionRate: Math.round(conversionRate),
      roiPercentage: Math.round(roiPercentage),
      ratingsGiven: ratingsGiven?.length || 0,
      monthlyLeadData: monthlyData,
      categoryBreakdown,
      recentLeads,
      monthlyGrowth: Math.round(monthlyGrowth),
      weeklyActivity,
      topPerformingCategory
    });
  };
  
  const generateEnhancedMonthlyData = (leads: any[], userRole: 'seller' | 'buyer') => {
    // Initialize with past 6 months
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthName = date.toLocaleString('default', { month: 'short' });
      months.push({ 
        name: monthName, 
        value: 0,
        revenue: 0,
        month: date.getMonth(),
        year: date.getFullYear()
      });
    }
    
    // Count leads and revenue by month
    leads.forEach(lead => {
      const leadDate = new Date(userRole === 'seller' ? lead.created_at : (lead.purchased_at || lead.created_at));
      const monthIndex = months.findIndex(m => 
        m.month === leadDate.getMonth() && m.year === leadDate.getFullYear()
      );
      
      if (monthIndex !== -1) {
        months[monthIndex].value += 1;
        months[monthIndex].revenue += ensureNumber(lead.price);
      }
    });
    
    return months.map(({ name, value, revenue }) => ({ name, value, revenue }));
  };
  
  const generateCategoryBreakdown = (leads: any[]) => {
    const categories: { [key: string]: { count: number; revenue: number } } = {};
    
    leads.forEach(lead => {
      const category = lead.type || 'Other';
      if (!categories[category]) {
        categories[category] = { count: 0, revenue: 0 };
      }
      categories[category].count += 1;
      categories[category].revenue += ensureNumber(lead.price);
    });
    
    return Object.entries(categories).map(([category, data]) => ({
      category,
      count: data.count,
      revenue: data.revenue
    }));
  };

  return { isLoading, dashboardData, loadDashboardData };
};
