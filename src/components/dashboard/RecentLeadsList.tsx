
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/utils/format-helpers';

interface RecentLeadsListProps {
  title: string;
  description: string;
  leads: any[];
  userRole: 'seller' | 'buyer';
}

const RecentLeadsList = ({ title, description, leads, userRole }: RecentLeadsListProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {leads.length > 0 ? (
          <div className="space-y-4">
            {leads.map(lead => (
              <div key={lead.id} className="border-b pb-3">
                <div className="flex justify-between">
                  <h3 className="font-medium">{lead.type} in {lead.location}</h3>
                  <span className="text-sm font-semibold">${formatCurrency(lead.price)}</span>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(userRole === 'seller' ? lead.created_at : lead.purchased_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-sm text-gray-500">
              No {userRole === 'seller' ? 'sales' : 'purchases'} yet
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentLeadsList;
