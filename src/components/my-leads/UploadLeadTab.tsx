
import React from 'react';
import LeadUploader from '@/components/LeadUploader';

const UploadLeadTab = () => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Upload New Lead</h1>
      <LeadUploader />
    </div>
  );
};

export default UploadLeadTab;
