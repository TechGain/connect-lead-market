
import React from 'react';
import MetricCard from './MetricCard';
import { ArrowUpRight, DollarSign, UserCheck, Package, Activity } from 'lucide-react';
import { formatCurrency } from '@/utils/format-helpers';
import { DashboardData } from '@/hooks/use-dashboard-data';

interface DashboardMetricsProps {
  data: DashboardData;
  role: string | null;
}

const DashboardMetrics = ({ data, role }: DashboardMetricsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {/* Card 1 */}
      <MetricCard
        title={role === 'seller' ? 'Total Leads Posted' : 'Total Leads Purchased'}
        value={data.totalLeads}
        subtitle="Your lifetime total"
        icon={Package}
      />
      
      {/* Card 2 */}
      <MetricCard
        title={role === 'seller' ? 'Active Leads' : 'Conversion Rate'}
        value={role === 'seller' ? data.activeLeads : `${data.conversionRate}%`}
        trend={<><ArrowUpRight className="h-3 w-3 text-green-500" />{role === 'seller' ? 'Currently active' : 'From total leads'}</>}
        icon={role === 'seller' ? Activity : UserCheck}
      />
      
      {/* Card 3 */}
      <MetricCard
        title={role === 'seller' ? 'Revenue' : 'Total Spent'}
        value={`$${formatCurrency(role === 'seller' ? data.totalRevenue : data.totalSpent)}`}
        trend={<><ArrowUpRight className="h-3 w-3 text-green-500" />Lifetime total</>}
        icon={DollarSign}
      />
      
      {/* Card 4 */}
      <MetricCard
        title={role === 'seller' ? 'Average Price per Lead' : 'Average Cost per Lead'}
        value={`$${formatCurrency(data.averagePricePerLead)}`}
        subtitle={`Based on ${data.totalLeads} leads`}
        icon={DollarSign}
      />
    </div>
  );
};

export default DashboardMetrics;
