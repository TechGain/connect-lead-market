
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface InfoCardProps {
  title: string;
  description: string;
  children?: React.ReactNode;
}

const InfoCard = ({ title, description, children }: InfoCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {children || (
          <div className="text-center py-6">
            <p className="text-sm text-gray-500">
              This feature will be available soon
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InfoCard;
