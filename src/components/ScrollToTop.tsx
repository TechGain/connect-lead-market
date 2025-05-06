
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * ScrollToTop is a utility component that scrolls the window to the top
 * whenever the route changes. It doesn't render anything to the DOM.
 */
export const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top of the page when the route changes
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth" // Add smooth scrolling effect
    });
  }, [pathname]);

  return null; // This component doesn't render anything
};
