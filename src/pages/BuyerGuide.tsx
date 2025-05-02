
import React from 'react';
import { Helmet } from 'react-helmet-async';
import ProfileMainLayout from '@/components/profile/ProfileMainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Info, CheckCircle, AlertTriangle, HelpCircle } from 'lucide-react';

const BuyerGuide = () => {
  return (
    <>
      <Helmet>
        <title>Buyer's Guide | StayConnect</title>
        <meta name="description" content="Learn how to effectively find and purchase quality leads on StayConnect" />
      </Helmet>
      
      <ProfileMainLayout>
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Buyer's Guide</h1>
            <p className="text-gray-600 mt-2">
              Everything you need to know about finding and purchasing quality leads on StayConnect
            </p>
          </div>
          
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Info className="mr-2 h-5 w-5 text-brand-600" />
                  Getting Started
                </CardTitle>
                <CardDescription>
                  Your first steps to finding quality leads
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">Create Your Account</h3>
                  <p className="text-gray-600 mt-1">
                    Sign up as a buyer to get access to our marketplace of verified leads. Complete your profile to improve your visibility and trust with sellers.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg">Browse the Marketplace</h3>
                  <p className="text-gray-600 mt-1">
                    Explore our marketplace to find leads that match your business needs. Use filters to narrow down results by industry, location, and quality rating.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg">Purchase Leads</h3>
                  <p className="text-gray-600 mt-1">
                    When you find a lead that interests you, you can purchase it directly through our secure checkout system. Your purchased leads will be immediately available in your "Purchases" section.
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="mr-2 h-5 w-5 text-green-600" />
                  Best Practices
                </CardTitle>
                <CardDescription>
                  How to maximize your success when buying leads
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">Check Seller Ratings</h3>
                  <p className="text-gray-600 mt-1">
                    Before purchasing, review the seller's profile and ratings from other buyers. Higher-rated sellers typically provide better quality leads.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg">Act Quickly</h3>
                  <p className="text-gray-600 mt-1">
                    The freshest leads have the highest conversion rates. Try to contact new leads within 24 hours of purchase.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg">Provide Feedback</h3>
                  <p className="text-gray-600 mt-1">
                    Rate and review the leads you purchase. This helps maintain quality on the platform and guides other buyers.
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="mr-2 h-5 w-5 text-amber-500" />
                  Common Pitfalls to Avoid
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">Ignoring Lead Details</h3>
                  <p className="text-gray-600 mt-1">
                    Make sure to read all the information provided about a lead before purchase. The more you know, the better prepared you'll be for contact.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg">Delayed Follow-up</h3>
                  <p className="text-gray-600 mt-1">
                    Waiting too long to contact leads significantly reduces conversion rates. Implement a system for quick follow-up.
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <HelpCircle className="mr-2 h-5 w-5 text-blue-500" />
                  FAQ
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">What happens after I purchase a lead?</h3>
                  <p className="text-gray-600 mt-1">
                    Once purchased, you'll receive immediate access to the lead's full contact information and details. The lead will be removed from the marketplace and added to your "Purchases" section.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg">Can I request a refund?</h3>
                  <p className="text-gray-600 mt-1">
                    If a lead is verifiably invalid (e.g., incorrect contact information), you may be eligible for a refund. Contact our support team within 48 hours of purchase.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg">How do I know if a lead is high-quality?</h3>
                  <p className="text-gray-600 mt-1">
                    Check the lead details for information on the prospect's interest level, time frame, and project budget. Also review the seller's ratings and the lead's freshness date.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </ProfileMainLayout>
    </>
  );
};

export default BuyerGuide;
