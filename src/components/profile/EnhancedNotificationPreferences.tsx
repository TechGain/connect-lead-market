
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

// Extract state from location string
const extractStateFromLocation = (location: string): string => {
  // Handle "City, State" format
  if (location.includes(',')) {
    const parts = location.split(',');
    return parts[parts.length - 1].trim();
  }
  
  // For single word locations, map known cities to states
  const cityToStateMap: Record<string, string> = {
    'Las Vegas': 'Nevada',
    'Los Angeles': 'California',
    'San Francisco': 'California',
    'San Bernardino': 'California',
    'Riverside': 'California',
    'Palmdale': 'California',
    'Lancaster': 'California',
    'Irvine': 'California',
    'Beverly Hills': 'California',
    'Sunnyvale': 'California',
    'Palo Alto': 'California',
    'Oakland': 'California',
    'Richmond': 'California',
    'Novato': 'California',
    'Vacaville': 'California',
    'Georgetown': 'Texas'
  };
  
  return cityToStateMap[location] || location;
};

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

  const [availableStates, setAvailableStates] = useState<string[]>([]);
  const [leadTypesOpen, setLeadTypesOpen] = useState(false);
  const [statesOpen, setStatesOpen] = useState(false);

  useEffect(() => {
    const fetchStates = async () => {
      try {
        const { data, error } = await supabase
          .from('leads')
          .select('location')
          .not('location', 'is', null);

        if (error) {
          console.error('Error fetching locations:', error);
          return;
        }

        // Extract unique states from locations
        const states = new Set<string>();
        data.forEach(lead => {
          if (lead.location) {
            const state = extractStateFromLocation(lead.location);
            states.add(state);
          }
        });

        const sortedStates = Array.from(states).sort();
        setAvailableStates(sortedStates);
      } catch (error) {
        console.error('Exception fetching states:', error);
      }
    };

    fetchStates();
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

  const handleStateChange = (state: string, checked: boolean) => {
    const currentStates = preferences.preferred_locations || [];
    let newStates;
    
    if (checked) {
      newStates = [...currentStates, state];
    } else {
      newStates = currentStates.filter(s => s !== state);
    }
    
    updateLocations(newStates);
  };

  const handleSelectAllLeadTypes = () => {
    updateLeadTypes(LEAD_TYPES);
  };

  const handleClearAllLeadTypes = () => {
    updateLeadTypes([]);
  };

  const handleSelectAllStates = () => {
    updateLocations(availableStates);
  };

  const handleClearAllStates = () => {
    updateLocations([]);
  };

  const getSelectionText = (selected: string[], total: number) => {
    if (selected.length === 0) {
      return 'All states (default)';
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
          Choose which types of leads and states you want to receive email notifications for
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

            {/* States Selection */}
            {preferences.email_notifications_enabled && userEmail && (
              <Collapsible open={statesOpen} onOpenChange={setStatesOpen}>
                <CollapsibleTrigger className="flex items-center justify-between w-full p-4 border rounded-lg hover:bg-gray-50">
                  <div className="text-left">
                    <h4 className="font-medium">Service States</h4>
                    <p className="text-sm text-gray-500">
                      {getSelectionText(preferences.preferred_locations, availableStates.length)}
                    </p>
                  </div>
                  {statesOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-4 space-y-4">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleSelectAllStates}>
                      Select All
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleClearAllStates}>
                      Clear All
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {availableStates.map((state) => (
                      <div key={state} className="flex items-center space-x-2">
                        <Checkbox
                          id={`state-${state}`}
                          checked={preferences.preferred_locations.includes(state)}
                          onCheckedChange={(checked) => handleStateChange(state, checked as boolean)}
                        />
                        <Label htmlFor={`state-${state}`} className="text-sm">
                          {state}
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
                <p><strong>Note:</strong> If no lead types or states are selected, you'll receive notifications for all leads (default behavior).</p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedNotificationPreferences;
