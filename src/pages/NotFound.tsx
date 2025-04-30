
import React, { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center">
        <div className="max-w-md">
          <h1 className="text-9xl font-bold text-brand-600">404</h1>
          <h2 className="text-3xl font-bold mt-4">Page Not Found</h2>
          <p className="mt-4 text-lg text-gray-600">
            The page you are looking for doesn't exist or has been moved.
          </p>
          <div className="mt-8">
            <Link to="/">
              <Button>Return to Home</Button>
            </Link>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default NotFound;
