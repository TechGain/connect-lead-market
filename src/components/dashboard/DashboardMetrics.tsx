
import React from 'react';
import EnhancedMetricCard from './EnhancedMetricCard';
import { 
  DollarSign, 
  Package, 
  Activity, 
  UserCheck, 
  TrendingUp, 
  ShoppingCart,
  RefreshCw,
  Target,
  Zap
} from 'lucide-react';
import { formatCurrency } from '@/utils/format-helpers';
import { DashboardData } from '@/hooks/use-dashboard-data';

interface DashboardMetricsProps {
  data: DashboardData;
  role: string | null;
}

const DashboardMetrics = ({ data, role }: DashboardMetricsProps) => {
  if (role === 'seller') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Leads Posted */}
        <EnhancedMetricCard
          title="Total Leads Posted"
          value={data.totalLeads}
          subtitle="Lifetime total"
          icon={Package}
          gradient="blue"
          trend={{
            value: data.weeklyActivity,
            isPositive: data.weeklyActivity > 0,
            label: "this week"
          }}
        />
        
        {/* Revenue */}
        <EnhancedMetricCard
          title="Total Revenue"
          value={formatCurrency(data.totalRevenue)}
          subtitle={`Avg $${formatCurrency(data.averagePricePerLead)} per lead`}
          icon={DollarSign}
          prefix="$"
          gradient="green"
          trend={{
            value: data.monthlyGrowth,
            isPositive: data.monthlyGrowth > 0,
            label: "vs last month"
          }}
        />
        
        {/* Sell-Through Rate */}
        <EnhancedMetricCard
          title="Sell-Through Rate"
          value={`${data.sellThroughRate}%`}
          subtitle={`${data.soldLeads} of ${data.totalLeads} leads sold`}
          icon={Target}
          gradient="purple"
          trend={{
            value: data.successRate,
            isPositive: data.successRate > 50,
            label: "success rate"
          }}
        />
        
        {/* Active Leads */}
        <EnhancedMetricCard
          title="Active Leads"
          value={data.activeLeads}
          subtitle="Currently available"
          icon={Activity}
          gradient="orange"
        />
        
        {/* Refund Losses */}
        <EnhancedMetricCard
          title="Refund Losses"
          value={formatCurrency(data.refundLosses)}
          subtitle={`${data.refundedLeads} refunded leads`}
          icon={RefreshCw}
          prefix="$"
          gradient="red"
        />
        
        {/* Top Category */}
        <EnhancedMetricCard
          title="Top Category"
          value={data.topPerformingCategory || 'N/A'}
          subtitle="Best performing"
          icon={TrendingUp}
          gradient="green"
        />
        
        {/* Monthly Growth */}
        <EnhancedMetricCard
          title="Monthly Growth"
          value={`${data.monthlyGrowth > 0 ? '+' : ''}${data.monthlyGrowth}%`}
          subtitle="Lead sales trend"
          icon={Zap}
          gradient={data.monthlyGrowth > 0 ? 'green' : 'red'}
          trend={{
            value: Math.abs(data.monthlyGrowth),
            isPositive: data.monthlyGrowth > 0,
            label: "month over month"
          }}
        />
      </div>
    );
  }

  // Buyer Dashboard
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Total Purchases */}
      <EnhancedMetricCard
        title="Total Purchases"
        value={data.totalPurchases}
        subtitle="Leads purchased"
        icon={ShoppingCart}
        gradient="blue"
        trend={{
          value: data.weeklyActivity,
          isPositive: data.weeklyActivity > 0,
          label: "this week"
        }}
      />
      
      {/* Total Spent */}
      <EnhancedMetricCard
        title="Total Spent"
        value={formatCurrency(data.totalSpent)}
        subtitle={`Avg $${formatCurrency(data.averageCostPerLead)} per lead`}
        icon={DollarSign}
        prefix="$"
        gradient="purple"
        trend={{
          value: data.monthlyGrowth,
          isPositive: data.monthlyGrowth < 0, // Lower spending can be positive
          label: "vs last month"
        }}
      />
      
      {/* Conversion Rate */}
      <EnhancedMetricCard
        title="Conversion Rate"
        value={`${data.conversionRate}%`}
        subtitle="Successful conversions"
        icon={Target}
        gradient="green"
        trend={{
          value: data.conversionRate,
          isPositive: data.conversionRate > 20,
          label: "success rate"
        }}
      />
      
      {/* ROI */}
      <EnhancedMetricCard
        title="ROI"
        value={`${data.roiPercentage > 0 ? '+' : ''}${data.roiPercentage}%`}
        subtitle="Return on investment"
        icon={TrendingUp}
        gradient={data.roiPercentage > 0 ? 'green' : 'red'}
      />
      
      {/* Refunded Amount */}
      <EnhancedMetricCard
        title="Refunded"
        value={formatCurrency(data.refundedAmount)}
        subtitle={`${data.refundedLeads} refunded leads`}
        icon={RefreshCw}
        prefix="$"
        gradient="red"
      />
      
      {/* Top Category */}
      <EnhancedMetricCard
        title="Top Category"
        value={data.topPerformingCategory || 'N/A'}
        subtitle="Most purchased"
        icon={Package}
        gradient="blue"
      />
      
      {/* Monthly Activity */}
      <EnhancedMetricCard
        title="Monthly Growth"
        value={`${data.monthlyGrowth > 0 ? '+' : ''}${data.monthlyGrowth}%`}
        subtitle="Purchase trend"
        icon={Activity}
        gradient={data.monthlyGrowth > 0 ? 'green' : 'red'}
      />
    </div>
  );
};

export default DashboardMetrics;
