import React from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { ArrowLeft, Shield, Lock, Eye, Database } from 'lucide-react';
import { Sparkle } from 'phosphor-react';
import { useNavigate } from 'react-router-dom';

export const PrivacyPolicy: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Sparkle size={24} weight="duotone" className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              EchoLearn
            </h1>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-2xl border border-border bg-white/90">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold">Privacy Policy</CardTitle>
              <CardDescription className="text-lg">
                Last updated: {new Date().toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent className="prose prose-lg max-w-none">
              <div className="space-y-6 text-gray-700">
                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
                  <p>
                    EchoLearn, Inc. ("Company," "we," "our," or "us") is committed to protecting your privacy and personal information. This Privacy Policy describes how we collect, use, disclose, and safeguard your information when you use our AI-powered learning platform and related services (collectively, the "Service").
                  </p>
                  <p className="mt-3">
                    By accessing or using our Service, you acknowledge that you have read, understood, and agree to be bound by this Privacy Policy. If you do not agree with the terms of this Privacy Policy, please do not access or use the Service.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>
                  
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">2.1 Personal Information</h3>
                  <p>We collect the following personal information:</p>
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>Email address (for account creation and communication)</li>
                    <li>Name (optional, for personalization)</li>
                    <li>Account credentials and authentication data</li>
                  </ul>

                  <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">2.2 Learning and Usage Data</h3>
                  <p>We automatically collect information related to your use of the Service, including:</p>
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>Learning session data from all modes (Conversation, Teaching, and Blurting)</li>
                    <li>Voice recordings and audio interactions (processed temporarily for AI response generation)</li>
                    <li>Quiz responses, performance metrics, and progress data</li>
                    <li>Device information, browser data, and operating system details</li>
                    <li>Usage patterns, feature interactions, and session analytics</li>
                  </ul>

                  <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">2.3 Technical Data</h3>
                  <p>We collect technical information including:</p>
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>IP addresses and location data</li>
                    <li>Browser type and version</li>
                    <li>Operating system information</li>
                    <li>Device identifiers</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
                  <p>We use your information to:</p>
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>Provide and maintain the EchoLearn service</li>
                    <li>Process your voice and text conversations with AI</li>
                    <li>Generate personalized summaries and quizzes</li>
                    <li>Improve our AI models and learning algorithms</li>
                    <li>Send important service updates and notifications</li>
                    <li>Provide customer support and respond to inquiries</li>
                    <li>Ensure security and prevent fraud</li>
                    <li>Comply with legal obligations</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Data Sharing and Disclosure</h2>
                  <p>We do not sell your personal information. We may share your data in the following circumstances:</p>
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li><strong>Service Providers:</strong> With trusted third-party services that help us operate the platform (e.g., OpenAI for AI processing, Retell for voice)</li>
                    <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
                    <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                    <li><strong>Consent:</strong> With your explicit consent for specific purposes</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Data Security</h2>
                  <p>We implement appropriate security measures to protect your information:</p>
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>Encryption of data in transit and at rest</li>
                    <li>Secure authentication and access controls</li>
                    <li>Regular security audits and updates</li>
                    <li>Limited access to personal data by authorized personnel only</li>
                    <li>Secure hosting infrastructure</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Data Retention</h2>
                  <p>We retain your information for as long as necessary to:</p>
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>Provide our services to you</li>
                    <li>Comply with legal obligations</li>
                    <li>Resolve disputes and enforce agreements</li>
                    <li>Improve our services</li>
                  </ul>
                  <p className="mt-3">
                    You can request deletion of your account and associated data at any time by contacting us.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Your Rights</h2>
                  <p>You have the following rights regarding your personal information:</p>
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li><strong>Access:</strong> Request a copy of your personal data</li>
                    <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                    <li><strong>Deletion:</strong> Request deletion of your account and data</li>
                    <li><strong>Portability:</strong> Export your data in a machine-readable format</li>
                    <li><strong>Objection:</strong> Object to certain processing activities</li>
                    <li><strong>Restriction:</strong> Request limitation of data processing</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Cookies and Tracking</h2>
                  <p>
                    We use cookies and similar technologies to enhance your experience, analyze usage, and provide personalized content. You can control cookie settings through your browser preferences.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Children's Privacy</h2>
                  <p>
                    EchoLearn is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you believe we have collected such information, please contact us immediately.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. International Data Transfers</h2>
                  <p>
                    Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your data in accordance with this Privacy Policy.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Changes to This Policy</h2>
                  <p>
                    We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last updated" date.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Contact Us</h2>
                  <p>
                    If you have any questions about this Privacy Policy or our data practices, please contact us:
                  </p>
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                    <p className="font-medium">Email: tryecholearn@gmail.com</p>
                    <p className="font-medium mt-2">Phone: 925-791-1047</p>
                    <p className="text-sm text-gray-600 mt-2">
                      We will respond to privacy-related inquiries within 48 hours. For general inquiries, please allow up to 72 hours for a response.
                    </p>
                  </div>
                </section>

                <div className="mt-8 p-4 bg-green-50 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Shield className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-green-800 mb-2">Your Privacy Matters</h3>
                      <p className="text-sm text-green-700">
                        We are committed to transparency and protecting your privacy. If you have any concerns about how we handle your data, please don't hesitate to reach out to us.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}; 