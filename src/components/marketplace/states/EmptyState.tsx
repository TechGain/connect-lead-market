
import React from 'react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  onResetFilters: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onResetFilters }) => {
  return (
    <div className="col-span-3 py-12 text-center">
      <h3 className="text-xl font-semibold mb-2">No leads match your filters</h3>
      <p className="text-gray-600 mb-4">Try adjusting your search criteria</p>
      <Button 
        onClick={onResetFilters}
        variant="outline"
      >
        Reset Filters
      </Button>
    </div>
  );
};

export default EmptyState;
