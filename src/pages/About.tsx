
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Separator } from "@/components/ui/separator";

const About = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-6 text-center bg-gradient-to-r from-brand-600 to-brand-400 bg-clip-text text-transparent">About StayConnect</h1>
          
          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-semibold mb-4 mt-8">Our Mission</h2>
            <p className="mb-6 text-gray-700">
              At StayConnect, we're on a mission to revolutionize how lead generation companies and contractors connect, interact, and do business together. We've created a seamless marketplace that brings quality leads directly to the contractors who need them most.
            </p>

            <div className="my-12 grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-2xl font-semibold mb-4">Bridging The Gap</h2>
                <p className="text-gray-700">
                  For too long, lead generators and contractors have operated in separate worlds, despite having complementary needs. We identified this disconnect and built StayConnect as the solution - a platform where lead quality meets contractor demand.
                </p>
              </div>
              <div className="rounded-lg overflow-hidden shadow-lg">
                <img 
                  src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80" 
                  alt="Business meeting" 
                  className="w-full h-auto"
                />
              </div>
            </div>

            <Separator className="my-12" />
            
            <h2 className="text-2xl font-semibold mb-4">How We Add Value</h2>
            <div className="grid md:grid-cols-2 gap-12 my-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-medium mb-2 text-brand-600">For Lead Generators</h3>
                <ul className="list-disc pl-5 space-y-2 text-gray-700">
                  <li>Connect with legitimate contractors actively seeking new business</li>
                  <li>Monetize your lead generation efforts efficiently</li>
                  <li>Build reputation through our rating system</li>
                  <li>Access analytics on lead performance</li>
                  <li>Expand your market reach beyond traditional channels</li>
                </ul>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-medium mb-2 text-brand-600">For Contractors</h3>
                <ul className="list-disc pl-5 space-y-2 text-gray-700">
                  <li>Access verified, high-quality leads in your service area</li>
                  <li>Purchase only the leads you want when you want them</li>
                  <li>Reduce wasted time on low-quality prospects</li>
                  <li>Scale your business without scaling your marketing costs</li>
                  <li>Review lead seller ratings for confidence in your purchase</li>
                </ul>
              </div>
            </div>

            <div className="my-12 grid md:grid-cols-2 gap-8 items-center">
              <div className="rounded-lg overflow-hidden shadow-lg md:order-2">
                <img 
                  src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80" 
                  alt="Working on laptop" 
                  className="w-full h-auto"
                />
              </div>
              <div className="md:order-1">
                <h2 className="text-2xl font-semibold mb-4">Our Technology</h2>
                <p className="text-gray-700">
                  StayConnect leverages advanced technology to create a secure, efficient marketplace. Our platform includes sophisticated lead verification, instant access to lead information, precise filtering options, and a transparent review system that helps build trust between buyers and sellers.
                </p>
              </div>
            </div>

            <Separator className="my-12" />
            
            <h2 className="text-2xl font-semibold mb-4 text-center">Join Our Community</h2>
            <p className="text-center text-gray-700 mb-8">
              Whether you're generating quality leads or looking to grow your contracting business, StayConnect is the marketplace where valuable connections happen.
            </p>
            
            <div className="bg-gradient-to-r from-brand-600 to-brand-400 text-white p-8 rounded-lg text-center">
              <h3 className="text-xl font-semibold mb-2">Ready to transform your business?</h3>
              <p className="mb-0">
                Create an account today and experience the difference that quality connections can make.
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default About;
