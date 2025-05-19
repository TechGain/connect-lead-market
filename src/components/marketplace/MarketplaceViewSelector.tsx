
import React from 'react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Grid2X2, LayoutList, GalleryVertical, GalleryHorizontal } from 'lucide-react';

export type ViewMode = 'largeCards' | 'smallCards' | 'list' | 'compact';

interface MarketplaceViewSelectorProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

const MarketplaceViewSelector: React.FC<MarketplaceViewSelectorProps> = ({
  viewMode,
  onViewModeChange
}) => {
  return (
    <div className="flex items-center">
      <span className="text-sm text-gray-500 mr-3">View:</span>
      <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && onViewModeChange(value as ViewMode)}>
        <ToggleGroupItem value="largeCards" aria-label="Large Cards View" title="Large Cards" className="h-12 w-12">
          <Grid2X2 className="h-6 w-6" />
        </ToggleGroupItem>
        <ToggleGroupItem value="smallCards" aria-label="Small Cards View" title="Small Cards" className="h-12 w-12">
          <GalleryHorizontal className="h-6 w-6" />
        </ToggleGroupItem>
        <ToggleGroupItem value="list" aria-label="List View" title="List View" className="h-12 w-12">
          <LayoutList className="h-6 w-6" />
        </ToggleGroupItem>
        <ToggleGroupItem value="compact" aria-label="Compact View" title="Compact View" className="h-12 w-12">
          <GalleryVertical className="h-6 w-6" />
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
};

export default MarketplaceViewSelector;
