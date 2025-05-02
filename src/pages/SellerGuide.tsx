
import React from 'react';
import { Helmet } from 'react-helmet-async';
import ProfileMainLayout from '@/components/profile/ProfileMainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Info, CheckCircle, AlertTriangle, HelpCircle, BarChart } from 'lucide-react';

const SellerGuide = () => {
  return (
    <>
      <Helmet>
        <title>Seller's Guide | StayConnect</title>
        <meta name="description" content="Learn how to effectively sell leads and maximize your earnings on StayConnect" />
      </Helmet>
      
      <ProfileMainLayout>
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Seller's Guide</h1>
            <p className="text-gray-600 mt-2">
              Everything you need to know about selling quality leads on StayConnect
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
                  Your first steps to becoming a successful lead seller
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">Create Your Account</h3>
                  <p className="text-gray-600 mt-1">
                    Sign up as a seller to gain access to our lead selling platform. Complete your profile with business information to build credibility with buyers.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg">Upload Your First Leads</h3>
                  <p className="text-gray-600 mt-1">
                    Navigate to the "Upload Leads" section to add your first batch of leads. Make sure to include all relevant details to maximize value.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg">Set Competitive Prices</h3>
                  <p className="text-gray-600 mt-1">
                    Research the marketplace to understand current pricing trends. Quality leads with detailed information can command higher prices.
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="mr-2 h-5 w-5 text-green-600" />
                  Creating High-Quality Leads
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">Gather Complete Information</h3>
                  <p className="text-gray-600 mt-1">
                    Include as much relevant information as possible: contact details, project scope, budget range, timeline, and specific requirements.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg">Verify Contact Information</h3>
                  <p className="text-gray-600 mt-1">
                    Always double-check phone numbers, email addresses, and other contact details before uploading leads. Invalid information will result in refund requests.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg">Qualify Your Leads</h3>
                  <p className="text-gray-600 mt-1">
                    Pre-qualify leads by confirming the prospect's serious interest, budget availability, and decision-making authority.
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart className="mr-2 h-5 w-5 text-indigo-600" />
                  Maximizing Your Sales
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">Optimize Lead Descriptions</h3>
                  <p className="text-gray-600 mt-1">
                    Use clear, concise descriptions highlighting the most valuable aspects of each lead. Emphasize urgency when applicable.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg">Build Your Reputation</h3>
                  <p className="text-gray-600 mt-1">
                    Consistently provide high-quality leads to earn positive ratings. A strong seller rating will attract more buyers and allow for premium pricing.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg">Focus on Niche Markets</h3>
                  <p className="text-gray-600 mt-1">
                    Specialized leads for specific industries often sell faster and at higher prices due to their targeted nature.
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
                  <h3 className="font-semibold text-lg">Uploading Stale Leads</h3>
                  <p className="text-gray-600 mt-1">
                    Leads older than 7-10 days have significantly lower conversion rates and may result in negative ratings. Always prioritize freshness.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg">Insufficient Lead Details</h3>
                  <p className="text-gray-600 mt-1">
                    Bare-minimum information leads are less likely to sell and more likely to receive poor ratings. Always provide comprehensive information.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg">Overpricing</h3>
                  <p className="text-gray-600 mt-1">
                    While quality leads deserve good prices, overpricing can result in slow or no sales. Research similar leads to find the optimal price point.
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
                  <h3 className="font-semibold text-lg">How quickly will my leads sell?</h3>
                  <p className="text-gray-600 mt-1">
                    Sale times vary based on quality, industry, and price. High-quality leads in demand industries typically sell within 24-48 hours.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg">When do I get paid for my leads?</h3>
                  <p className="text-gray-600 mt-1">
                    Payments are processed within 48 hours after a lead is sold and the return period has passed. Funds are deposited directly to your connected payment account.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg">What happens if a buyer requests a refund?</h3>
                  <p className="text-gray-600 mt-1">
                    If a lead is proven to contain invalid information, the buyer may be granted a refund. We review each refund request carefully to ensure fairness.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg">Can I upload leads in bulk?</h3>
                  <p className="text-gray-600 mt-1">
                    Yes, you can upload multiple leads using our CSV import feature. Make sure your file matches our template format for successful imports.
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

export default SellerGuide;
