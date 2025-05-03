
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { useUserRole } from '@/hooks/use-user-role';
const Index = () => {
  const {
    isLoggedIn
  } = useUserRole();
  return <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-brand-600 to-brand-400 text-white py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 mb-8 md:mb-0">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">Connect, Buy & Sell Quality Leads</h1>
                <p className="text-xl mb-6">The premier marketplace connecting lead generation companies with contractors looking for qualified leads. </p>
                <p className="text-lg mb-6"><strong>100% money back guaranteed for unqualified leads</strong></p>
                <div className="flex flex-wrap gap-4">
                  <Link to={isLoggedIn ? "/marketplace" : "/register"}>
                    <Button className="bg-white text-brand-600 hover:bg-gray-100">
                      {isLoggedIn ? "Browse Marketplace" : "Get Started"}
                    </Button>
                  </Link>
                  <Link to="/about">
                    <Button variant="outline" className="bg-white/10 font-normal">
                      Learn More
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="md:w-1/2">
                <img src="https://images.unsplash.com/photo-1586473219010-2ffc57b0d282?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80" alt="Lead Marketplace" className="rounded-lg shadow-lg w-full" />
              </div>
            </div>
          </div>
        </section>
        
        {/* How It Works Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-2">How It Works</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Our platform makes it easy for lead sellers and contractors to connect and do business.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <Card>
                <CardContent className="flex flex-col items-center text-center pt-6">
                  <div className="h-16 w-16 rounded-full bg-brand-100 flex items-center justify-center mb-4">
                    <span className="text-brand-600 text-2xl font-bold">1</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">Create an Account</h3>
                  <p className="text-gray-600">
                    Sign up as a lead seller or contractor and create your profile.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="flex flex-col items-center text-center pt-6">
                  <div className="h-16 w-16 rounded-full bg-brand-100 flex items-center justify-center mb-4">
                    <span className="text-brand-600 text-2xl font-bold">2</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">Browse or Upload Leads</h3>
                  <p className="text-gray-600">
                    Find qualified leads or list your leads for sale on our marketplace
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="flex flex-col items-center text-center pt-6">
                  <div className="h-16 w-16 rounded-full bg-brand-100 flex items-center justify-center mb-4">
                    <span className="text-brand-600 text-2xl font-bold">3</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">Purchase & Connect</h3>
                  <p className="text-gray-600">
                    Buy leads instantly and connect with potential customers to grow your business.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-2">StayConnect</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Our platform offers powerful features for both lead sellers and contractors.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="font-bold text-lg mb-2">Quality Verified Leads</h3>
                <p className="text-gray-600">
                  All leads are verified and rated for quality to ensure you're getting the best value.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="font-bold text-lg mb-2">Instant Access</h3>
                <p className="text-gray-600">
                  Purchase leads and get immediate access to customer contact information.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="font-bold text-lg mb-2">Seller Ratings</h3>
                <p className="text-gray-600">
                  Review system helps you identify the most reliable lead sellers on the platform.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="font-bold text-lg mb-2">Advanced Filtering</h3>
                <p className="text-gray-600">
                  Find exactly what you need with powerful search and filtering options.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="bg-brand-500 text-white py-12">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-xl mb-6 max-w-2xl mx-auto">
              Join LeadMarket today and start growing your business with quality leads.
            </p>
            <div className="flex justify-center gap-4">
              <Link to="/register?role=seller">
                <Button variant="outline" className="bg-white text-brand-600 text-base">
                  Become a Seller
                </Button>
              </Link>
              <Link to="/register?role=buyer">
                <Button className="bg-white text-brand-600 hover:bg-gray-100">
                  Become a Buyer
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>;
};
export default Index;
