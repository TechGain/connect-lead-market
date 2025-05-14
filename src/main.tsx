
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Check if we're running inside Lovable iframe
const isInLovableIframe = () => {
  try {
    return window.self !== window.top && window.location.hostname.includes('lovableproject.com');
  } catch (e) {
    return true; // If we can't access parent, we're probably in an iframe
  }
};

// Add global event prevention for Lovable environment
if (isInLovableIframe()) {
  console.log("Detected Lovable environment, adding global event prevention");
  
  // Prevent default form submissions
  document.addEventListener('submit', (e) => {
    console.log("Global form submission intercepted in Lovable environment");
    e.preventDefault();
    e.stopPropagation();
  }, true);
  
  // Prevent clicks on links that would cause navigation/refresh
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const closestLink = target.closest('a');
    
    if (closestLink && closestLink.href && !closestLink.getAttribute('target')) {
      console.log("Link click intercepted in Lovable:", closestLink.href);
      // Let React Router handle internal navigation
      if (closestLink.href.includes(window.location.origin)) {
        // Don't prevent default for internal links, React Router will handle it
      } else {
        // Prevent default for external links that would navigate away
        e.preventDefault();
        e.stopPropagation();
      }
    }
  }, true);
}

createRoot(document.getElementById("root")!).render(<App />);
