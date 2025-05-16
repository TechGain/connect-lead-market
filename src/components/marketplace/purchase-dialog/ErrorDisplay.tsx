
import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorDisplayProps {
  error: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error }) => {
  if (!error) return null;
  
  return (
    <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded flex items-start gap-2 text-sm">
      <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-500" />
      <div>
        <p className="font-medium">Error</p>
        <p>{error}</p>
        <p className="mt-1 text-xs">Please try again with a different payment method or contact support if this issue persists.</p>
      </div>
    </div>
  );
};

export default ErrorDisplay;
