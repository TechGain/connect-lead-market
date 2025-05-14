
import { useCallback, useEffect } from 'react';

/**
 * Hook to prevent page refreshes in forms and links
 * This is specifically designed to solve refresh issues in the Lovable interface
 */
export const usePreventRefresh = () => {
  const preventRefresh = useCallback((e: Event) => {
    console.log('Preventing default behavior for event:', e.type);
    e.preventDefault();
    e.stopPropagation();
    return false;
  }, []);

  useEffect(() => {
    // Apply to all forms in the document to prevent refreshes
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
      console.log('Adding preventRefresh listener to form:', form);
      form.addEventListener('submit', preventRefresh, true);
    });

    // Also prevent refreshes on links with # href
    const links = document.querySelectorAll('a[href="#"]');
    links.forEach(link => {
      link.addEventListener('click', preventRefresh, true);
    });

    // Clean up listeners
    return () => {
      forms.forEach(form => {
        form.removeEventListener('submit', preventRefresh, true);
      });
      links.forEach(link => {
        link.removeEventListener('click', preventRefresh, true);
      });
    };
  }, [preventRefresh]);

  return { preventRefresh };
};
