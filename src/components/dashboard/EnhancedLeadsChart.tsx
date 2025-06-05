
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { BarChart as BarChartIcon, LineChart as LineChartIcon, PieChart as PieChartIcon } from 'lucide-react';

interface EnhancedLeadsChartProps {
  title: string;
  description: string;
  data: { name: string; value: number; revenue?: number }[];
  categoryData?: { category: string; count: number; revenue: number }[];
  barName: string;
  showRevenue?: boolean;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

const EnhancedLeadsChart = ({ 
  title, 
  description, 
  data, 
  categoryData = [], 
  barName, 
  showRevenue = false 
}: EnhancedLeadsChartProps) => {
  const [chartType, setChartType] = useState<'bar' | 'line' | 'area' | 'pie'>('bar');
  const [showRevenueData, setShowRevenueData] = useState(false);

  const renderChart = () => {
    const chartData = showRevenueData && showRevenue ? 
      data.map(item => ({ ...item, value: item.revenue || 0 })) : data;

    switch (chartType) {
      case 'line':
        return (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#ffffff', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }} 
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#3B82F6" 
              strokeWidth={3}
              dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
              name={showRevenueData ? 'Revenue' : barName}
            />
          </LineChart>
        );
      
      case 'area':
        return (
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#ffffff', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }} 
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="#3B82F6" 
              fill="url(#colorGradient)"
              name={showRevenueData ? 'Revenue' : barName}
            />
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.05}/>
              </linearGradient>
            </defs>
          </AreaChart>
        );
      
      case 'pie':
        if (categoryData.length === 0) {
          return (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No category data available
            </div>
          );
        }
        
        return (
          <PieChart>
            <Pie
              data={categoryData}
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              dataKey={showRevenueData ? 'revenue' : 'count'}
              label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
            >
              {categoryData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        );
      
      default:
        return (
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="name" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#ffffff', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }} 
            />
            <Bar 
              dataKey="value" 
              fill="url(#barGradient)" 
              radius={[4, 4, 0, 0]} 
              name={showRevenueData ? 'Revenue' : barName}
            />
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={1}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.7}/>
              </linearGradient>
            </defs>
          </BarChart>
        );
    }
  };

  return (
    <Card className="mb-8 shadow-lg border-0">
      <CardHeader className="border-b border-gray-100">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-bold text-gray-900">{title}</CardTitle>
            <CardDescription className="text-gray-600 mt-1">{description}</CardDescription>
          </div>
          <div className="flex gap-2 flex-wrap">
            {showRevenue && (
              <Button
                variant={showRevenueData ? "default" : "outline"}
                size="sm"
                onClick={() => setShowRevenueData(!showRevenueData)}
                className="text-xs"
              >
                {showRevenueData ? 'Count' : 'Revenue'}
              </Button>
            )}
            <Button
              variant={chartType === 'bar' ? "default" : "outline"}
              size="sm"
              onClick={() => setChartType('bar')}
            >
              <BarChartIcon className="h-4 w-4" />
            </Button>
            <Button
              variant={chartType === 'line' ? "default" : "outline"}
              size="sm"
              onClick={() => setChartType('line')}
            >
              <LineChartIcon className="h-4 w-4" />
            </Button>
            <Button
              variant={chartType === 'area' ? "default" : "outline"}
              size="sm"
              onClick={() => setChartType('area')}
            >
              <LineChartIcon className="h-4 w-4" />
            </Button>
            {categoryData.length > 0 && (
              <Button
                variant={chartType === 'pie' ? "default" : "outline"}
                size="sm"
                onClick={() => setChartType('pie')}
              >
                <PieChartIcon className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedLeadsChart;
