
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useEnhancedNotificationPreferences } from '@/hooks/use-enhanced-notification-preferences';
import { useUserRole } from '@/hooks/use-user-role';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { Checkbox } from '@/components/ui/checkbox';

interface EnhancedNotificationPreferencesProps {
  userEmail?: string | null;
}

const LEAD_TYPES = [
  'HVAC', 'Plumbing', 'Electrical', 'Solar', 'Roofing', 'Flooring', 'Kitchen Remodeling',
  'Bathroom Remodeling', 'Windows', 'Doors', 'Painting', 'Landscaping', 'Pool Installation',
  'Fence Installation', 'Deck Building', 'Garage Door', 'Insulation', 'Drywall',
  'Concrete Work', 'Pest Control', 'Home Security', 'Cleaning Services', 'Moving Services',
  'Handyman Services', 'Tree Services', 'Gutter Services', 'Siding', 'Foundation Repair'
];

export const EnhancedNotificationPreferences = ({ userEmail }: EnhancedNotificationPreferencesProps) => {
  const { user } = useUserRole();
  const userId = user?.id;
  
  const { 
    preferences, 
    isLoading, 
    isSaving, 
    updateEmailEnabled,
    updateLeadTypes,
    updateLocations
  } = useEnhancedNotificationPreferences(userId);

  const [availableLocations, setAvailableLocations] = useState<string[]>([]);
  const [leadTypesOpen, setLeadTypesOpen] = useState(false);
  const [locationsOpen, setLocationsOpen] = useState(false);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const { data, error } = await supabase
          .from('leads')
          .select('location')
          .not('location', 'is', null);

        if (error) {
          console.error('Error fetching locations:', error);
          return;
        }

        const uniqueLocations = [...new Set(data.map(lead => lead.location))].sort();
        setAvailableLocations(uniqueLocations);
      } catch (error) {
        console.error('Exception fetching locations:', error);
      }
    };

    fetchLocations();
  }, []);

  const handleEmailToggle = async (checked: boolean) => {
    await updateEmailEnabled(checked);
  };

  const handleLeadTypeChange = (leadType: string, checked: boolean) => {
    const currentTypes = preferences.preferred_lead_types || [];
    let newTypes;
    
    if (checked) {
      newTypes = [...currentTypes, leadType];
    } else {
      newTypes = currentTypes.filter(type => type !== leadType);
    }
    
    updateLeadTypes(newTypes);
  };

  const handleLocationChange = (location: string, checked: boolean) => {
    const currentLocations = preferences.preferred_locations || [];
    let newLocations;
    
    if (checked) {
      newLocations = [...currentLocations, location];
    } else {
      newLocations = currentLocations.filter(loc => loc !== location);
    }
    
    updateLocations(newLocations);
  };

  const handleSelectAllLeadTypes = () => {
    updateLeadTypes(LEAD_TYPES);
  };

  const handleClearAllLeadTypes = () => {
    updateLeadTypes([]);
  };

  const handleSelectAllLocations = () => {
    updateLocations(availableLocations);
  };

  const handleClearAllLocations = () => {
    updateLocations([]);
  };

  const getSelectionText = (selected: string[], total: number) => {
    if (selected.length === 0) {
      return 'All types (default)';
    }
    if (selected.length === total) {
      return 'All selected';
    }
    return `${selected.length} of ${total} selected`;
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Email Notification Preferences</CardTitle>
        <CardDescription>
          Choose which types of leads and locations you want to receive email notifications for
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <>
            <div className="flex items-center space-x-4">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-6 w-[50px]" />
            </div>
            <Skeleton className="h-20 w-full" />
          </>
        ) : (
          <>
            {/* Main Email Toggle */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="email-notifications" className="font-medium">
                  Email Lead Notifications
                </Label>
                <p className="text-sm text-gray-500">
                  Receive email alerts when new leads matching your preferences are available
                </p>
                {!userEmail && (
                  <p className="text-sm text-amber-600">
                    Add an email address to your profile to enable email notifications
                  </p>
                )}
                {userEmail && (
                  <p className="text-sm text-gray-500">
                    Notifications will be sent to: {userEmail}
                  </p>
                )}
              </div>
              <Switch
                id="email-notifications"
                checked={preferences.email_notifications_enabled}
                onCheckedChange={handleEmailToggle}
                disabled={isSaving || !userEmail}
              />
            </div>

            {/* Lead Types Selection */}
            {preferences.email_notifications_enabled && userEmail && (
              <Collapsible open={leadTypesOpen} onOpenChange={setLeadTypesOpen}>
                <CollapsibleTrigger className="flex items-center justify-between w-full p-4 border rounded-lg hover:bg-gray-50">
                  <div className="text-left">
                    <h4 className="font-medium">Lead Types</h4>
                    <p className="text-sm text-gray-500">
                      {getSelectionText(preferences.preferred_lead_types, LEAD_TYPES.length)}
                    </p>
                  </div>
                  {leadTypesOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-4 space-y-4">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleSelectAllLeadTypes}>
                      Select All
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleClearAllLeadTypes}>
                      Clear All
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
                    {LEAD_TYPES.map((leadType) => (
                      <div key={leadType} className="flex items-center space-x-2">
                        <Checkbox
                          id={`type-${leadType}`}
                          checked={preferences.preferred_lead_types.includes(leadType)}
                          onCheckedChange={(checked) => handleLeadTypeChange(leadType, checked as boolean)}
                        />
                        <Label htmlFor={`type-${leadType}`} className="text-sm">
                          {leadType}
                        </Label>
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* Locations Selection */}
            {preferences.email_notifications_enabled && userEmail && (
              <Collapsible open={locationsOpen} onOpenChange={setLocationsOpen}>
                <CollapsibleTrigger className="flex items-center justify-between w-full p-4 border rounded-lg hover:bg-gray-50">
                  <div className="text-left">
                    <h4 className="font-medium">Service Areas</h4>
                    <p className="text-sm text-gray-500">
                      {getSelectionText(preferences.preferred_locations, availableLocations.length)}
                    </p>
                  </div>
                  {locationsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-4 space-y-4">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleSelectAllLocations}>
                      Select All
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleClearAllLocations}>
                      Clear All
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
                    {availableLocations.map((location) => (
                      <div key={location} className="flex items-center space-x-2">
                        <Checkbox
                          id={`location-${location}`}
                          checked={preferences.preferred_locations.includes(location)}
                          onCheckedChange={(checked) => handleLocationChange(location, checked as boolean)}
                        />
                        <Label htmlFor={`location-${location}`} className="text-sm">
                          {location}
                        </Label>
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* Info about empty selections */}
            {preferences.email_notifications_enabled && userEmail && (
              <div className="text-sm text-gray-500 bg-blue-50 p-3 rounded-lg">
                <p><strong>Note:</strong> If no lead types or locations are selected, you'll receive notifications for all leads (default behavior).</p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedNotificationPreferences;
