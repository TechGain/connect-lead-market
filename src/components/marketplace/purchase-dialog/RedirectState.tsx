
import React from 'react';
import { Loader2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RedirectStateProps {
  stripeUrl: string | null;
  onManualRedirect: () => void;
}

const RedirectState: React.FC<RedirectStateProps> = ({ 
  stripeUrl, 
  onManualRedirect 
}) => {
  return (
    <div className="py-8 flex flex-col items-center justify-center space-y-4">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <div className="text-center">
        <p className="text-lg font-medium">Redirecting to secure checkout...</p>
        <p className="text-sm text-muted-foreground">Please do not close this window.</p>
        
        {stripeUrl && (
          <Button variant="link" className="mt-4 flex items-center gap-2" onClick={onManualRedirect}>
            <ExternalLink className="h-4 w-4" />
            Click here if not redirected automatically
          </Button>
        )}
      </div>
    </div>
  );
};

export default RedirectState;
