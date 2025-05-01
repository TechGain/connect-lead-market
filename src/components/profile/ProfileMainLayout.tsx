
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface ProfileMainLayoutProps {
  children: React.ReactNode;
}

const ProfileMainLayout: React.FC<ProfileMainLayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>
      
      <Footer />
    </div>
  );
};

export default ProfileMainLayout;
