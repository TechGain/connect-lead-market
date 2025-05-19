
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from '@/components/ui/label';
import { Search, Filter, X } from 'lucide-react';

interface LeadFiltersProps {
  onFilterChange: (filters: {
    search: string;
    type: string;
    location: string;
    minPrice: number;
    maxPrice: number;
    minRating: number;
  }) => void;
  compact?: boolean;
}

const LeadFilters = ({ onFilterChange, compact = false }: LeadFiltersProps) => {
  const [search, setSearch] = React.useState('');
  const [type, setType] = React.useState('');
  const [location, setLocation] = React.useState('');
  const [priceRange, setPriceRange] = React.useState([0, 500]);
  const [minRating, setMinRating] = React.useState(0);
  const [isExpanded, setIsExpanded] = React.useState(false);
  
  const applyFilters = () => {
    onFilterChange({
      search,
      type,
      location,
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
      minRating,
    });
  };
  
  const resetFilters = () => {
    setSearch('');
    setType('');
    setLocation('');
    setPriceRange([0, 500]);
    setMinRating(0);
    
    onFilterChange({
      search: '',
      type: '',
      location: '',
      minPrice: 0,
      maxPrice: 500,
      minRating: 0,
    });
  };

  return (
    <div className={`bg-white rounded-lg border ${compact ? 'p-1.5' : 'p-4'}`}>
      <div className="flex items-center justify-between">
        <div className="relative flex-1">
          <Search className={`absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 ${compact ? 'h-3.5 w-3.5' : 'h-5 w-5'}`} />
          <Input
            placeholder={compact ? "Search..." : "Search leads by keyword..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`pl-7 ${compact ? 'h-8 text-xs py-1' : ''}`}
          />
        </div>
        <Button 
          variant="outline"
          size={compact ? "sm" : "icon"}
          className={`ml-1 ${compact ? 'h-8 w-8 p-1' : ''}`}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <Filter size={compact ? 14 : 18} />
        </Button>
      </div>
      
      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="space-y-2">
            <Label>Lead Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="roofing">Roofing</SelectItem>
                <SelectItem value="plumbing">Plumbing</SelectItem>
                <SelectItem value="electrical">Electrical</SelectItem>
                <SelectItem value="hvac">HVAC</SelectItem>
                <SelectItem value="landscaping">Landscaping</SelectItem>
                <SelectItem value="solar">Solar</SelectItem>
                <SelectItem value="concrete">Concrete</SelectItem>
                <SelectItem value="bathroom-remodel">Bathroom Remodel</SelectItem>
                <SelectItem value="kitchen-remodel">Kitchen Remodel</SelectItem>
                <SelectItem value="full-home-renovation">Full Home Renovation</SelectItem>
                <SelectItem value="garage-conversion">Garage Conversion</SelectItem>
                <SelectItem value="new-construction">New Construction</SelectItem>
                <SelectItem value="locksmith-services">Locksmith Services</SelectItem>
                <SelectItem value="garage-doors-repair">Garage Doors Repair</SelectItem>
                <SelectItem value="sliding-door-repair">Sliding Door Repair</SelectItem>
                <SelectItem value="flooring-services">Flooring Services</SelectItem>
                <SelectItem value="home-cleaning">Home Cleaning</SelectItem>
                <SelectItem value="pool-services">Pool Services</SelectItem>
                <SelectItem value="insulation-services">Insulation Services</SelectItem>
                <SelectItem value="smart-home-services">Smart Home Services</SelectItem>
                <SelectItem value="foundation-repair">Foundation Repair</SelectItem>
                <SelectItem value="exterior-paint">Exterior Paint</SelectItem>
                <SelectItem value="interior-paint">Interior Paint</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Location</Label>
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger>
                <SelectValue placeholder="All Locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="new york">New York</SelectItem>
                <SelectItem value="los angeles">Los Angeles</SelectItem>
                <SelectItem value="chicago">Chicago</SelectItem>
                <SelectItem value="houston">Houston</SelectItem>
                <SelectItem value="phoenix">Phoenix</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Minimum Rating</Label>
            <Select value={minRating.toString()} onValueChange={(value) => setMinRating(Number(value))}>
              <SelectTrigger>
                <SelectValue placeholder="Any Rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Any Rating</SelectItem>
                <SelectItem value="1">★ and above</SelectItem>
                <SelectItem value="2">★★ and above</SelectItem>
                <SelectItem value="3">★★★ and above</SelectItem>
                <SelectItem value="4">★★★★ and above</SelectItem>
                <SelectItem value="5">★★★★★ only</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2 md:col-span-3">
            <div className="flex items-center justify-between">
              <Label>Price Range</Label>
              <span className="text-sm text-gray-500">
                ${priceRange[0]} - ${priceRange[1]}
              </span>
            </div>
            <Slider
              defaultValue={[0, 500]}
              min={0}
              max={500}
              step={5}
              value={priceRange}
              onValueChange={setPriceRange}
              className="py-4"
            />
          </div>
          
          <div className="flex gap-2 md:col-span-3">
            <Button onClick={applyFilters} className="flex-1">
              Apply Filters
            </Button>
            <Button 
              onClick={resetFilters} 
              variant="outline" 
              size="icon"
            >
              <X size={16} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadFilters;
