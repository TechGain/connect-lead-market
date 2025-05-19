
import React from 'react';
import { Clock } from 'lucide-react';
import { getConfirmationTimeRemaining, formatTimeRemaining } from '@/lib/utils/datetime';

interface ConfirmationTimerProps {
  purchasedAt: string | null | undefined;
}

const ConfirmationTimer: React.FC<ConfirmationTimerProps> = ({ purchasedAt }) => {
  const [timeRemaining, setTimeRemaining] = React.useState(getConfirmationTimeRemaining(purchasedAt));
  
  // Update the timer every minute
  React.useEffect(() => {
    if (!purchasedAt) return;
    
    const intervalId = setInterval(() => {
      setTimeRemaining(getConfirmationTimeRemaining(purchasedAt));
    }, 60000); // Update every minute
    
    return () => clearInterval(intervalId);
  }, [purchasedAt]);
  
  if (!timeRemaining || !purchasedAt) {
    return null;
  }
  
  // If time has expired
  if (timeRemaining.hours === 0 && timeRemaining.minutes === 0) {
    return (
      <div className="flex items-center text-red-500 font-semibold mt-1">
        <Clock className="h-4 w-4 mr-1" />
        <span>Confirmation period expired</span>
      </div>
    );
  }
  
  return (
    <div className="flex items-center text-amber-600 font-semibold mt-1">
      <Clock className="h-4 w-4 mr-1" />
      <span>
        {timeRemaining.hours > 0 && `${timeRemaining.hours}h `}
        {timeRemaining.minutes}m remaining
      </span>
    </div>
  );
};

export default ConfirmationTimer;
