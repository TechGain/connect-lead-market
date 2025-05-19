
import React from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ForceShowButtonProps {
  onForceShow: () => void;
}

const ForceShowButton: React.FC<ForceShowButtonProps> = ({ onForceShow }) => {
  const handleForceShow = () => {
    onForceShow();
    toast.info("Showing marketplace content without authentication");
  };

  return (
    <div className="mt-8 text-center">
      <Button variant="outline" onClick={handleForceShow} className="mx-auto">
        Show Content Anyway
      </Button>
    </div>
  );
};

export default ForceShowButton;
