import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { 
  Mic, 
  Brain, 
  BookOpen, 
  Sparkles, 
  ArrowRight, 
  Star,
  CheckCircle,
  Play,
  Mail,
  Zap,
  Users,
  MessageCircle
} from 'lucide-react';
import Logo from './Logo';

export const WaitlistPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch('https://formspree.io/f/xqabvena', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          message: 'EchoLearn Waitlist Signup'
        }),
      });

      if (response.ok) {
        setIsSubmitted(true);
        setEmail('');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-indigo-400/10 to-cyan-600/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        
        {/* Floating dots */}
        <div className="absolute top-20 left-1/4 w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-200"></div>
        <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-purple-400 rounded-full animate-bounce delay-700"></div>
        <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-1200"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="container mx-auto px-6 py-8">
          <nav className="flex items-center justify-center">
            <div className="flex items-center space-x-3 group">
              <Logo className="h-12 w-auto group-hover:scale-105 transition-transform duration-200" />
            </div>
          </nav>
        </header>

        {/* Main Content */}
        <section className="container mx-auto px-6 py-16 text-center">
          <div className="max-w-4xl mx-auto">
            <Badge className="mb-6 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border-blue-200 animate-fade-in-up">
              <Zap className="w-3 h-3 mr-1" />
              Coming Soon
            </Badge>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight animate-fade-in-up animation-delay-200">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Your AI Learning
              </span>
              <br />
              <span className="text-gray-800">Revolution Starts Here</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed animate-fade-in-up animation-delay-400">
              EchoLearn is almost ready! Be the first to experience natural AI conversations, 
              personalized summaries, and intelligent quizzes that transform how you learn.
            </p>

            {!isSubmitted ? (
              <div className="max-w-md mx-auto mb-12 animate-fade-in-up animation-delay-600">
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-2xl">
                  <CardHeader className="text-center pb-4">
                    <CardTitle className="text-2xl font-bold text-gray-800 flex items-center justify-center">
                      <Mail className="w-6 h-6 mr-2 text-blue-600" />
                      Join the Waitlist
                    </CardTitle>
                    <p className="text-gray-600">Get early access when we launch</p>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email address"
                        required
                        className="w-full px-4 py-3 text-lg border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 text-lg font-semibold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? (
                          <div className="flex items-center justify-center">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            Joining...
                          </div>
                        ) : (
                          <>
                            <Play className="w-5 h-5 mr-2" />
                            Join Waitlist
                            <ArrowRight className="w-5 h-5 ml-2" />
                          </>
                        )}
                      </Button>
                    </form>
                    <p className="text-sm text-gray-500 mt-4 text-center">
                      🔒 We'll never spam you. Unsubscribe anytime.
                    </p>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="max-w-md mx-auto mb-12 animate-fade-in-up">
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-2xl">
                  <CardContent className="text-center py-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">You're In!</h3>
                    <p className="text-gray-600 mb-4">
                      Thanks for joining the waitlist. We'll notify you as soon as EchoLearn launches!
                    </p>
                    <Badge className="bg-green-100 text-green-700 border-green-200">
                      <Star className="w-3 h-3 mr-1" />
                      Early Access Reserved
                    </Badge>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Features Preview */}
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-16 animate-fade-in-up animation-delay-800">
              <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="text-center pb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Mic className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-lg font-bold text-gray-800">Voice Conversations</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600">
                    Speak naturally with AI that understands and responds intelligently
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="text-center pb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-lg font-bold text-gray-800">Smart Summaries</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600">
                    Get AI-generated summaries that capture the key insights from your learning
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="text-center pb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-lg font-bold text-gray-800">Personalized Quizzes</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600">
                    Test your knowledge with AI-generated quizzes tailored to your conversations
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Social Proof */}
            <div className="flex flex-wrap justify-center gap-8 text-center animate-fade-in-up animation-delay-1000">
              <div className="flex items-center space-x-2 group hover:scale-105 transition-transform duration-200">
                <Users className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
                <span className="text-gray-600 font-medium">1,000+ Already Signed Up</span>
              </div>
              <div className="flex items-center space-x-2 group hover:scale-105 transition-transform duration-200">
                <MessageCircle className="w-5 h-5 text-green-600 group-hover:scale-110 transition-transform" />
                <span className="text-gray-600 font-medium">Launching Q2 2025</span>
              </div>
              <div className="flex items-center space-x-2 group hover:scale-105 transition-transform duration-200">
                <Star className="w-5 h-5 text-yellow-500 group-hover:scale-110 transition-transform" />
                <span className="text-gray-600 font-medium">Early Access Benefits</span>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="container mx-auto px-6 py-8 text-center">
          <p className="text-gray-500">
            © 2025 EchoLearn. Transforming education with AI.
          </p>
        </footer>
      </div>
    </div>
  );
}; 