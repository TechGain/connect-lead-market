
import React, { useEffect } from 'react';
import LeadUploader from '@/components/LeadUploader';
import { usePreventRefresh } from '@/hooks/use-prevent-refresh';

const UploadLeadTab = () => {
  // Use our custom hook to prevent refreshes
  usePreventRefresh();
  
  // Apply additional prevention when this tab is active
  useEffect(() => {
    console.log('UploadLeadTab mounted - applying additional refresh prevention');
    
    // Ensure we intercept any form submits in this tab
    const preventFormSubmit = (e: Event) => {
      console.log('Form submission intercepted in UploadLeadTab');
      e.preventDefault();
      e.stopPropagation();
      return false;
    };
    
    // Find all forms in this tab context
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
      form.addEventListener('submit', preventFormSubmit, true);
    });
    
    return () => {
      forms.forEach(form => {
        form.removeEventListener('submit', preventFormSubmit, true);
      });
    };
  }, []);
  
  return (
    <div 
      className="container mx-auto py-8"
      onClick={(e) => e.stopPropagation()}
    >
      <h1 className="text-3xl font-bold mb-6">Upload New Lead</h1>
      <LeadUploader />
    </div>
  );
};

export default UploadLeadTab;
