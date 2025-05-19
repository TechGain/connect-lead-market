
import React from 'react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Grid2X2, LayoutList, GalleryVertical, GalleryHorizontal } from 'lucide-react';

export type ViewMode = 'largeCards' | 'smallCards' | 'list' | 'compact';

interface MarketplaceViewSelectorProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  compact?: boolean;
}

const MarketplaceViewSelector: React.FC<MarketplaceViewSelectorProps> = ({
  viewMode,
  onViewModeChange,
  compact = false
}) => {
  const iconSize = compact ? 5 : 6;
  const buttonSize = compact ? 'h-9 w-9' : 'h-12 w-12';
  
  return (
    <div className="flex items-center">
      {!compact && <span className="text-sm text-gray-500 mr-3">View:</span>}
      <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && onViewModeChange(value as ViewMode)}>
        <ToggleGroupItem value="largeCards" aria-label="Large Cards View" title="Large Cards" className={buttonSize}>
          <Grid2X2 className={`h-${iconSize} w-${iconSize}`} />
        </ToggleGroupItem>
        <ToggleGroupItem value="smallCards" aria-label="Small Cards View" title="Small Cards" className={buttonSize}>
          <GalleryHorizontal className={`h-${iconSize} w-${iconSize}`} />
        </ToggleGroupItem>
        <ToggleGroupItem value="list" aria-label="List View" title="List View" className={buttonSize}>
          <LayoutList className={`h-${iconSize} w-${iconSize}`} />
        </ToggleGroupItem>
        <ToggleGroupItem value="compact" aria-label="Compact View" title="Compact View" className={buttonSize}>
          <GalleryVertical className={`h-${iconSize} w-${iconSize}`} />
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
};

export default MarketplaceViewSelector;
