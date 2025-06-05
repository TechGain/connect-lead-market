
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EnhancedMetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
    label: string;
  };
  gradient?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  prefix?: string;
  suffix?: string;
  className?: string;
}

const gradientStyles = {
  blue: 'from-blue-500 to-blue-600',
  green: 'from-green-500 to-green-600',
  purple: 'from-purple-500 to-purple-600',
  orange: 'from-orange-500 to-orange-600',
  red: 'from-red-500 to-red-600'
};

const EnhancedMetricCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  gradient = 'blue',
  prefix = '',
  suffix = '',
  className 
}: EnhancedMetricCardProps) => {
  return (
    <Card className={cn("relative overflow-hidden transition-all duration-300 hover:shadow-lg", className)}>
      <div className={`absolute inset-0 bg-gradient-to-br ${gradientStyles[gradient]} opacity-5`} />
      
      <CardHeader className="flex flex-row items-center justify-between pb-2 relative">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        <div className={`p-2 rounded-lg bg-gradient-to-br ${gradientStyles[gradient]} text-white`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      
      <CardContent className="relative">
        <div className="text-2xl font-bold text-gray-900 mb-1">
          {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
        </div>
        
        {trend && (
          <div className="flex items-center gap-1 mb-2">
            {trend.isPositive ? (
              <TrendingUp className="h-3 w-3 text-green-500" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-500" />
            )}
            <span className={`text-xs font-medium ${
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              {Math.abs(trend.value)}% {trend.label}
            </span>
          </div>
        )}
        
        {subtitle && (
          <p className="text-xs text-gray-500">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedMetricCard;
