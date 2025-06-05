
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Log to verify script execution
console.log('Main script executing, checking for Google Analytics presence...');
if (typeof window.gtag !== 'undefined') {
  console.log('Google Analytics detected in main.tsx');
} else {
  console.warn('Google Analytics not detected in main.tsx. This is expected during development, but should work in production.');
}

const container = document.getElementById("root");
if (!container) {
  throw new Error('Root element not found');
}

const root = createRoot(container);
root.render(<App />);
