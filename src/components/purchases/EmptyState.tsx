
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const EmptyState: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="text-center py-12">
      <h3 className="text-xl font-semibold mb-2">No Purchased Leads</h3>
      <p className="text-gray-600 mb-4">You haven't purchased any leads yet</p>
      <Button onClick={() => navigate('/marketplace')}>Browse Marketplace</Button>
    </div>
  );
};

export default EmptyState;
