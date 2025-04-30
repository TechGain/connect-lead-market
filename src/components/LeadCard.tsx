
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import StarRating from './StarRating';
import { MapPin } from 'lucide-react';
import { Lead } from '@/types/lead';
import { formatCurrency } from '@/lib/utils';

interface LeadCardProps {
  lead: Lead;
  onPurchase: (lead: Lead) => void;
  isPurchased?: boolean;
}

const LeadCard = ({ lead, onPurchase, isPurchased = false }: LeadCardProps) => {
  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'new': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'sold': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-bold">{lead.type}</CardTitle>
            <CardDescription className="flex items-center mt-1">
              <MapPin size={16} className="mr-1 text-gray-500" />
              {lead.location}
            </CardDescription>
          </div>
          <Badge 
            variant="outline" 
            className={`${getStatusColor(lead.status)} text-white`}
          >
            {lead.status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pb-3">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Quality Rating:</span>
            <StarRating rating={lead.qualityRating} readOnly />
          </div>
          
          <p className="text-sm text-gray-600 line-clamp-2">
            {isPurchased 
              ? lead.description 
              : `${lead.description.substring(0, 80)}${lead.description.length > 80 ? '...' : ''}`}
          </p>
          
          {isPurchased && (
            <div className="mt-4 p-3 bg-gray-50 rounded-md">
              <p className="font-medium mb-1">Contact Information:</p>
              <p className="text-sm">{lead.contactName}</p>
              <p className="text-sm">{lead.contactPhone}</p>
              <p className="text-sm">{lead.contactEmail}</p>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between items-center pt-1">
        <p className="text-xl font-bold text-brand-600">
          {formatCurrency(lead.price)}
        </p>
        
        {!isPurchased ? (
          <Button 
            onClick={() => onPurchase(lead)}
            variant="default"
            size="sm"
            disabled={lead.status === 'sold'}
          >
            {lead.status === 'sold' ? 'Sold' : 'Purchase Lead'}
          </Button>
        ) : (
          <Badge variant="outline" className="bg-brand-500 text-white">Purchased</Badge>
        )}
      </CardFooter>
    </Card>
  );
};

export default LeadCard;
