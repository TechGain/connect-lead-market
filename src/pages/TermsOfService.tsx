
import React from "react";
import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageLayout from "@/components/PageLayout";

const TermsOfService = () => {
  return (
    <PageLayout>
      <Helmet>
        <title>Terms of Service | StayConnect</title>
        <meta name="description" content="StayConnect terms of service and user agreement." />
      </Helmet>
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-8">Terms of Service</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600">Last Updated: May 19, 2025</p>
            
            <section className="mt-8 bg-amber-50 p-6 rounded-lg border border-amber-200">
              <h2 className="text-2xl font-semibold mb-4">Refund Policy for Unqualified Leads</h2>
              
              <div className="space-y-4">
                <p className="font-medium">StayConnect provides refunds for unqualified leads under the following conditions:</p>
                
                <div className="pl-4 border-l-4 border-amber-300 ml-2">
                  <h3 className="font-semibold">A) Unconfirmed Leads</h3>
                  <p>Refunds are provided if 48 hours have passed and the buyer couldn't reach the customer over the phone despite documented attempts.</p>
                </div>
                
                <div className="pl-4 border-l-4 border-amber-300 ml-2">
                  <h3 className="font-semibold">B) Confirmed Leads</h3>
                  <p>Refunds are provided if the client didn't open the door or didn't show up to the meeting (client no-show only, not salesperson no-show).</p>
                </div>
                
                <p className="font-medium text-amber-700">
                  <strong>Important:</strong> All refund requests require proof of attempts to reach the customer. This documentation must be submitted with any refund claim.
                </p>
              </div>
            </section>
            
            <section className="mt-8">
              <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
              <p>
                By accessing or using the StayConnect service ("Service"), you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the Service.
              </p>
            </section>
            
            <section className="mt-8">
              <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
              <p>
                StayConnect is a platform that connects lead generation companies with contractors looking for quality leads. The Service includes the website, its API, and any applications, software, products, and services provided by StayConnect.
              </p>
            </section>
            
            <section className="mt-8">
              <h2 className="text-2xl font-semibold mb-4">3. Account Registration and Security</h2>
              <p>
                To use certain features of the Service, you must register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.
              </p>
              <p className="mt-2">
                You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password. You agree not to disclose your password to any third party. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.
              </p>
            </section>
            
            <section className="mt-8">
              <h2 className="text-2xl font-semibold mb-4">4. User Conduct</h2>
              <p>
                You agree not to use the Service:
              </p>
              <ul className="list-disc pl-6 mt-4 space-y-2">
                <li>In any way that violates any applicable federal, state, local, or international law or regulation.</li>
                <li>For the purpose of exploiting, harming, or attempting to exploit or harm minors in any way.</li>
                <li>To transmit any material that is defamatory, obscene, indecent, abusive, offensive, harassing, violent, hateful, inflammatory, or otherwise objectionable.</li>
                <li>To impersonate or attempt to impersonate StayConnect, a StayConnect employee, another user, or any other person or entity.</li>
                <li>To engage in any other conduct that restricts or inhibits anyone's use or enjoyment of the Service, or which, as determined by us, may harm StayConnect or users of the Service or expose them to liability.</li>
              </ul>
            </section>
            
            <section className="mt-8">
              <h2 className="text-2xl font-semibold mb-4">5. Leads and Transactions</h2>
              <p>
                StayConnect facilitates connections between lead sellers and contractors. We do not guarantee:
              </p>
              <ul className="list-disc pl-6 mt-4 space-y-2">
                <li>The accuracy or quality of any lead information.</li>
                <li>That any lead will result in business or revenue for the buyer.</li>
                <li>The performance or reliability of any seller or buyer on the platform.</li>
              </ul>
              <p className="mt-2">
                Users are responsible for evaluating the suitability of leads for their business needs before making a purchase. All transactions are final unless otherwise specified in our refund policy.
              </p>
            </section>
            
            <section className="mt-8">
              <h2 className="text-2xl font-semibold mb-4">6. Fees and Payment</h2>
              <p>
                We may charge fees for certain features or services. You agree to pay all fees and charges incurred in connection with your account. Fees are non-refundable except as required by law or as explicitly stated in our refund policy.
              </p>
            </section>
            
            <section className="mt-8">
              <h2 className="text-2xl font-semibold mb-4">7. Intellectual Property</h2>
              <p>
                The Service and its original content, features, and functionality are and will remain the exclusive property of StayConnect and its licensors. The Service is protected by copyright, trademark, and other laws.
              </p>
            </section>
            
            <section className="mt-8">
              <h2 className="text-2xl font-semibold mb-4">8. Termination</h2>
              <p>
                We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
              </p>
              <p className="mt-2">
                Upon termination, your right to use the Service will immediately cease. If you wish to terminate your account, you may simply discontinue using the Service or contact us to request account deletion.
              </p>
            </section>
            
            <section className="mt-8">
              <h2 className="text-2xl font-semibold mb-4">9. Limitation of Liability</h2>
              <p>
                In no event shall StayConnect, its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
              </p>
            </section>
            
            <section className="mt-8">
              <h2 className="text-2xl font-semibold mb-4">10. Changes to Terms</h2>
              <p>
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
              </p>
            </section>
            
            <section className="mt-8">
              <h2 className="text-2xl font-semibold mb-4">11. Contact Us</h2>
              <p>
                If you have any questions about these Terms, please contact us at:
              </p>
              <p className="mt-2">
                <strong>Email:</strong> stayconnectorg@gmail.com<br />
                <strong>Phone:</strong> +1 (818) 967-4781
              </p>
            </section>
          </div>
        </div>
      </main>
    </PageLayout>
  );
};

export default TermsOfService;
