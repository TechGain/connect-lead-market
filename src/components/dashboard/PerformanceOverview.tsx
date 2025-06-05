
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Target, Award, Activity } from 'lucide-react';
import { DashboardData } from '@/hooks/use-dashboard-data';

interface PerformanceOverviewProps {
  data: DashboardData;
  role: string | null;
}

const PerformanceOverview = ({ data, role }: PerformanceOverviewProps) => {
  const getPerformanceLevel = (percentage: number) => {
    if (percentage >= 80) return { level: 'Excellent', color: 'bg-green-500', textColor: 'text-green-700' };
    if (percentage >= 60) return { level: 'Good', color: 'bg-blue-500', textColor: 'text-blue-700' };
    if (percentage >= 40) return { level: 'Average', color: 'bg-yellow-500', textColor: 'text-yellow-700' };
    return { level: 'Needs Improvement', color: 'bg-red-500', textColor: 'text-red-700' };
  };

  if (role === 'seller') {
    const sellThroughPerformance = getPerformanceLevel(data.sellThroughRate);
    const ratingPerformance = getPerformanceLevel((data.averageLeadRating / 5) * 100);
    
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-500" />
              Sales Performance
            </CardTitle>
            <CardDescription>Your lead selling metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Sell-Through Rate</span>
                <Badge variant="outline" className={sellThroughPerformance.textColor}>
                  {sellThroughPerformance.level}
                </Badge>
              </div>
              <Progress value={data.sellThroughRate} className="h-2" />
              <p className="text-xs text-gray-500 mt-1">
                {data.soldLeads} of {data.totalLeads} leads sold ({data.sellThroughRate}%)
              </p>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Success Rate</span>
                <span className="text-sm text-gray-600">{data.successRate}%</span>
              </div>
              <Progress value={data.successRate} className="h-2" />
              <p className="text-xs text-gray-500 mt-1">
                Including active and sold leads
              </p>
            </div>
            
            <div className="flex items-center justify-between pt-2 border-t">
              <span className="text-sm font-medium">Monthly Trend</span>
              <div className="flex items-center gap-1">
                {data.monthlyGrowth > 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                <span className={`text-sm font-medium ${
                  data.monthlyGrowth > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {data.monthlyGrowth > 0 ? '+' : ''}{data.monthlyGrowth}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-500" />
              Quality Metrics
            </CardTitle>
            <CardDescription>Lead quality and ratings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Average Rating</span>
                <Badge variant="outline" className={ratingPerformance.textColor}>
                  {ratingPerformance.level}
                </Badge>
              </div>
              <Progress value={(data.averageLeadRating / 5) * 100} className="h-2" />
              <p className="text-xs text-gray-500 mt-1">
                {data.averageLeadRating > 0 ? `${data.averageLeadRating.toFixed(1)}/5.0` : 'No ratings yet'}
              </p>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Refund Rate</span>
                <span className="text-sm text-gray-600">
                  {data.totalLeads > 0 ? Math.round((data.refundedLeads / data.totalLeads) * 100) : 0}%
                </span>
              </div>
              <Progress 
                value={data.totalLeads > 0 ? (data.refundedLeads / data.totalLeads) * 100 : 0} 
                className="h-2" 
              />
              <p className="text-xs text-gray-500 mt-1">
                {data.refundedLeads} refunded leads
              </p>
            </div>
            
            <div className="flex items-center justify-between pt-2 border-t">
              <span className="text-sm font-medium">Weekly Activity</span>
              <div className="flex items-center gap-1">
                <Activity className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium text-blue-600">
                  {data.weeklyActivity} leads
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Buyer Performance Overview
  const conversionPerformance = getPerformanceLevel(data.conversionRate);
  const roiPerformance = getPerformanceLevel(Math.max(0, data.roiPercentage));
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-green-500" />
            Conversion Performance
          </CardTitle>
          <CardDescription>Your lead conversion metrics</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Conversion Rate</span>
              <Badge variant="outline" className={conversionPerformance.textColor}>
                {conversionPerformance.level}
              </Badge>
            </div>
            <Progress value={data.conversionRate} className="h-2" />
            <p className="text-xs text-gray-500 mt-1">
              {data.conversionRate}% of purchased leads converted
            </p>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">ROI</span>
              <span className={`text-sm font-medium ${
                data.roiPercentage > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {data.roiPercentage > 0 ? '+' : ''}{data.roiPercentage}%
              </span>
            </div>
            <Progress value={Math.max(0, Math.min(100, data.roiPercentage))} className="h-2" />
            <p className="text-xs text-gray-500 mt-1">
              Return on investment
            </p>
          </div>
          
          <div className="flex items-center justify-between pt-2 border-t">
            <span className="text-sm font-medium">Monthly Trend</span>
            <div className="flex items-center gap-1">
              {data.monthlyGrowth > 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <span className={`text-sm font-medium ${
                data.monthlyGrowth > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {data.monthlyGrowth > 0 ? '+' : ''}{data.monthlyGrowth}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-purple-500" />
            Purchase Analytics
          </CardTitle>
          <CardDescription>Your buying patterns and costs</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Refund Rate</span>
              <span className="text-sm text-gray-600">
                {data.totalPurchases > 0 ? Math.round((data.refundedLeads / data.totalPurchases) * 100) : 0}%
              </span>
            </div>
            <Progress 
              value={data.totalPurchases > 0 ? (data.refundedLeads / data.totalPurchases) * 100 : 0} 
              className="h-2" 
            />
            <p className="text-xs text-gray-500 mt-1">
              {data.refundedLeads} refunded purchases
            </p>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Rating Activity</span>
              <span className="text-sm text-gray-600">
                {data.totalPurchases > 0 ? Math.round((data.ratingsGiven / data.totalPurchases) * 100) : 0}%
              </span>
            </div>
            <Progress 
              value={data.totalPurchases > 0 ? (data.ratingsGiven / data.totalPurchases) * 100 : 0} 
              className="h-2" 
            />
            <p className="text-xs text-gray-500 mt-1">
              {data.ratingsGiven} ratings given
            </p>
          </div>
          
          <div className="flex items-center justify-between pt-2 border-t">
            <span className="text-sm font-medium">Weekly Activity</span>
            <div className="flex items-center gap-1">
              <Activity className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium text-purple-600">
                {data.weeklyActivity} purchases
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceOverview;
