
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Global handler to detect and prevent unwanted refreshes in Lovable iframe
const isInLovableIframe = () => {
  try {
    return window !== window.top;
  } catch (e) {
    return true; // If we can't access window.top, we're probably in an iframe
  }
};

if (isInLovableIframe()) {
  console.log('App running in Lovable iframe - applying additional protections');
  
  // Capture and prevent any form submissions at the document level
  document.addEventListener('submit', (e) => {
    console.log('Global form submission intercepted');
    e.preventDefault();
    e.stopPropagation();
    return false;
  }, true);
  
  // Capture clicks on anchor tags to prevent navigation
  document.addEventListener('click', (e) => {
    const target = e.target as Element;
    const anchor = target.closest('a');
    if (anchor && anchor.getAttribute('href') && anchor.getAttribute('href') !== '#') {
      // Only prevent default on anchors that would cause navigation
      const href = anchor.getAttribute('href');
      if (href && (href.startsWith('http') || href.startsWith('/'))) {
        console.log('Global anchor click intercepted:', href);
        e.preventDefault();
        e.stopPropagation();
      }
    }
  }, true);
}

createRoot(document.getElementById("root")!).render(<App />);
