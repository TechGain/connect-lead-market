
import React from 'react';
import LeadUploader from '@/components/LeadUploader';

// Check if we're running inside Lovable iframe
const isInLovableIframe = () => {
  try {
    return window.self !== window.top && window.location.hostname.includes('lovableproject.com');
  } catch (e) {
    return true; // If we can't access parent, we're probably in an iframe
  }
};

const UploadLeadTab = () => {
  // Log component render in Lovable environment
  React.useEffect(() => {
    if (isInLovableIframe()) {
      console.log("UploadLeadTab component rendered in Lovable environment");
    }
  }, []);

  return (
    <div 
      className="container mx-auto py-8"
      onClick={(e) => {
        // Prevent propagation in Lovable environment to avoid navigation issues
        if (isInLovableIframe()) {
          e.stopPropagation();
        }
      }}
    >
      <h1 className="text-3xl font-bold mb-6">Upload New Lead</h1>
      <LeadUploader />
    </div>
  );
};

export default UploadLeadTab;
