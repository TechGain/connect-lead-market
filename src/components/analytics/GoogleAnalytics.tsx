
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Declare global gtag function
declare global {
  interface Window {
    gtag: (
      command: string,
      action: string,
      params?: Record<string, any>
    ) => void;
    dataLayer: any[];
  }
}

export const GoogleAnalytics = () => {
  const location = useLocation();
  
  useEffect(() => {
    // Track page view when location changes
    if (typeof window.gtag !== 'undefined') {
      console.log('Sending pageview to Google Analytics:', location.pathname);
      window.gtag('config', 'G-LECDK9PYVE', {
        page_path: location.pathname + location.search
      });
    }
  }, [location]);
  
  // This component doesn't render anything
  return null;
};

export default GoogleAnalytics;
