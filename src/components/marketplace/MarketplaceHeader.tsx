
import React, { useEffect } from 'react';

interface MarketplaceHeaderProps {
  title: string;
  description: string;
}

const MarketplaceHeader: React.FC<MarketplaceHeaderProps> = ({ 
  title, 
  description 
}) => {
  useEffect(() => {
    console.log('MarketplaceHeader rendered with:', { title, description });
  }, [title, description]);

  return (
    <div className="mb-6">
      <h1 className="text-3xl font-bold mb-2">{title}</h1>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

export default MarketplaceHeader;
