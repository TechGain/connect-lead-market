
import React from "react";
import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const PrivacyPolicy = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Helmet>
        <title>Privacy Policy | StayConnect</title>
        <meta name="description" content="StayConnect privacy policy and data protection information." />
      </Helmet>
      
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-8">Privacy Policy</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600">Last Updated: May 6, 2025</p>
            
            <section className="mt-8">
              <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
              <p>
                At StayConnect ("we," "our," or "us"), we respect your privacy and are committed to protecting it through our compliance with this policy. This policy describes the types of information we may collect from you or that you may provide when you visit our website and our practices for collecting, using, maintaining, protecting, and disclosing that information.
              </p>
            </section>
            
            <section className="mt-8">
              <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
              <p>
                We collect several types of information from and about users of our website, including:
              </p>
              <ul className="list-disc pl-6 mt-4 space-y-2">
                <li>Personal information such as name, email address, telephone number, company name, and job title.</li>
                <li>Information about your internet connection, the equipment you use to access our website, and usage details.</li>
                <li>Records and copies of your correspondence if you contact us.</li>
                <li>Details of transactions you carry out through our website and of the fulfillment of your orders.</li>
              </ul>
            </section>
            
            <section className="mt-8">
              <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
              <p>
                We use information that we collect about you or that you provide to us:
              </p>
              <ul className="list-disc pl-6 mt-4 space-y-2">
                <li>To present our website and its contents to you.</li>
                <li>To provide you with information, products, or services that you request from us.</li>
                <li>To fulfill any other purpose for which you provide it.</li>
                <li>To carry out our obligations and enforce our rights arising from any contracts entered into between you and us.</li>
                <li>To notify you about changes to our website or any products or services we offer or provide.</li>
                <li>To improve our website, products or services, marketing, or customer relationships.</li>
              </ul>
            </section>
            
            <section className="mt-8">
              <h2 className="text-2xl font-semibold mb-4">4. Disclosure of Your Information</h2>
              <p>
                We may disclose aggregated information about our users, and information that does not identify any individual, without restriction. We may disclose personal information that we collect or you provide:
              </p>
              <ul className="list-disc pl-6 mt-4 space-y-2">
                <li>To contractors, service providers, and other third parties we use to support our business.</li>
                <li>To a buyer or other successor in the event of a merger, divestiture, restructuring, reorganization, dissolution, or other sale or transfer of some or all of our assets.</li>
                <li>To fulfill the purpose for which you provide it.</li>
                <li>For any other purpose disclosed by us when you provide the information.</li>
                <li>With your consent.</li>
                <li>To comply with any court order, law, or legal process, including to respond to any government or regulatory request.</li>
              </ul>
            </section>
            
            <section className="mt-8">
              <h2 className="text-2xl font-semibold mb-4">5. Data Security</h2>
              <p>
                We have implemented measures designed to secure your personal information from accidental loss and from unauthorized access, use, alteration, and disclosure.
              </p>
            </section>
            
            <section className="mt-8">
              <h2 className="text-2xl font-semibold mb-4">6. Changes to Our Privacy Policy</h2>
              <p>
                It is our policy to post any changes we make to our privacy policy on this page. The date the privacy policy was last revised is identified at the top of the page.
              </p>
            </section>
            
            <section className="mt-8">
              <h2 className="text-2xl font-semibold mb-4">7. Contact Information</h2>
              <p>
                To ask questions or comment about this privacy policy and our privacy practices, contact us at:
              </p>
              <p className="mt-2">
                <strong>Email:</strong> stayconnectorg@gmail.com<br />
                <strong>Phone:</strong> +1 (818) 967-4781
              </p>
            </section>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
