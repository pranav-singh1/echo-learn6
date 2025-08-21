import React from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const TermsOfService: React.FC = () => {
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
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              EchoLearn
            </h1>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-2xl border border-border bg-white/90">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold">Terms of Service</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-lg max-w-none">
              <div className="space-y-6 text-gray-700">
                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
                  <p>
                    By accessing and using EchoLearn, Inc.'s services ("the Service"), you acknowledge that you have read, understood, and agree to be bound by these Terms of Service ("Terms"). These Terms constitute a legally binding agreement between you ("User" or "you") and EchoLearn, Inc. ("Company," "we," "our," or "us"). If you do not agree to these Terms, you must not access or use the Service.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
                  <p>
                    EchoLearn is an AI-powered learning platform that provides multiple learning modalities including:
                  </p>
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>Conversation Mode: Interactive dialogue with AI tutors for exploring topics and asking questions</li>
                    <li>Teaching Mode: Practice explaining concepts aloud to reinforce understanding</li>
                    <li>Blurting Mode: Rapid knowledge recall and memory reinforcement exercises</li>
                    <li>AI-generated summaries and personalized assessments</li>
                    <li>Learning progress tracking and analytics</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>
                  <p>
                    To access certain features of the Service, you must create an account. You are responsible for:
                  </p>
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>Maintaining the confidentiality of your account credentials</li>
                    <li>All activities that occur under your account</li>
                    <li>Providing accurate and complete information during registration</li>
                    <li>Notifying us immediately of any unauthorized use of your account</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Acceptable Use</h2>
                  <p>You agree not to use the Service to:</p>
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>Violate any applicable laws or regulations</li>
                    <li>Infringe upon the rights of others</li>
                    <li>Transmit harmful, offensive, or inappropriate content</li>
                    <li>Attempt to gain unauthorized access to the Service</li>
                    <li>Use the Service for commercial purposes without permission</li>
                    <li>Interfere with or disrupt the Service</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Privacy and Data</h2>
                  <p>
                    Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy. By using the Service, you consent to the collection and use of information as outlined in our Privacy Policy.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Intellectual Property</h2>
                  <p>
                    The Service and its original content, features, and functionality are owned by EchoLearn and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. User Content</h2>
                  <p>
                    You retain ownership of any content you submit to the Service. By submitting content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, and distribute your content in connection with the Service.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Service Availability</h2>
                  <p>
                    We strive to maintain the Service's availability but do not guarantee uninterrupted access. We may temporarily suspend the Service for maintenance, updates, or other reasons.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Limitation of Liability</h2>
                  <p>
                    EchoLearn shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Termination</h2>
                  <p>
                    We may terminate or suspend your account and access to the Service immediately, without prior notice, for any reason, including breach of these Terms of Service.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Changes to Terms</h2>
                  <p>
                    We reserve the right to modify these terms at any time. We will notify users of any material changes by posting the new Terms of Service on this page.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Contact Information</h2>
                  <p>
                    If you have any questions about these Terms of Service, please contact us at:
                  </p>
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                    <p className="font-medium">Email: tryecholearn@gmail.com</p>
                    <p className="text-sm text-gray-600 mt-2">
                      We will respond to legal inquiries within 48 hours. For general inquiries, please allow up to 72 hours for a response.
                    </p>
                  </div>
                </section>

                <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <strong>Note:</strong> These terms are effective as of the date listed above. Continued use of the Service after any changes constitutes acceptance of the new terms.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}; 