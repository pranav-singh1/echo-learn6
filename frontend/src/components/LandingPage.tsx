import React from 'react';
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
  Users,
  Zap,
  CheckCircle,
  Play,
  MessageCircle,
  TrendingUp,
  Quote,
  Menu,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Logo from './Logo';

interface LandingPageProps {
  onStartConversation: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartConversation }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  
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
          <nav className="flex items-center justify-between">
            <div 
              className="flex items-center space-x-3 group cursor-pointer"
              onClick={() => navigate('/')}
            >
              <Logo className="h-12 w-auto group-hover:scale-105 transition-transform duration-200" />
            </div>
            
            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium">
                Features
              </a>
              <a href="#how-it-works" className="text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium">
                How it Works
              </a>
              <a href="#pricing" className="text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium">
                Pricing
              </a>
              <a href="#faq" className="text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium">
                FAQ
              </a>
              <a href="#contact" className="text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium">
                Contact
              </a>
              {user ? (
                <Button
                  onClick={onStartConversation}
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg transition-all duration-200"
                >
                  Dashboard
                </Button>
              ) : (
                <Button
                  onClick={() => navigate('/auth')}
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg transition-all duration-200"
                >
                  Sign In
                </Button>
              )}
            </div>
            
            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center space-x-4">
              <Badge variant="secondary" className="hidden sm:flex items-center space-x-1">
                <Star className="w-3 h-3" />
                <span>AI-Powered</span>
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </Button>
            </div>
          </nav>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden mt-4 p-4 bg-white/90 backdrop-blur-sm rounded-xl shadow-xl border border-gray-200">
              <div className="flex flex-col space-y-4">
                <a 
                  href="#features" 
                  className="text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Features
                </a>
                <a 
                  href="#how-it-works" 
                  className="text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  How it Works
                </a>
                <a 
                  href="#pricing" 
                  className="text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Pricing
                </a>
                <a 
                  href="#faq" 
                  className="text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  FAQ
                </a>
                <a 
                  href="#contact" 
                  className="text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Contact
                </a>
                <div className="pt-2 border-t border-gray-200">
                  {user ? (
                    <Button
                      onClick={() => {
                        onStartConversation();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg"
                    >
                      Dashboard
                    </Button>
                  ) : (
                    <Button
                      onClick={() => {
                        navigate('/auth');
                        setMobileMenuOpen(false);
                      }}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg"
                    >
                      Sign In
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </header>

        {/* Hero Section */}
        <section className="container mx-auto px-6 py-16 text-center">
          <div className="max-w-4xl mx-auto">
            <Badge className="mb-6 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border-blue-200 animate-fade-in-up">
              <Zap className="w-3 h-3 mr-1" />
              Powered by Advanced AI
            </Badge>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight animate-fade-in-up animation-delay-200">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Your AI Learning
              </span>
              <br />
              <span className="text-gray-800">Companion</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed animate-fade-in-up animation-delay-400">
              Have natural conversations, get personalized summaries, and test your knowledge 
              with AI-generated quizzes. Transform the way you learn.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 animate-fade-in-up animation-delay-600">
              <Button
                onClick={() => {
                  if (user) {
                    onStartConversation();
                  } else {
                    navigate('/auth');
                  }
                }}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 group"
              >
                <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                Start Learning Now
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-gray-200 hover:border-blue-300 px-8 py-4 text-lg rounded-2xl transition-all duration-300 hover:bg-white/80 backdrop-blur-sm"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Watch Demo
              </Button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 text-center animate-fade-in-up animation-delay-800">
              <div className="flex items-center space-x-2 group hover:scale-105 transition-transform duration-200">
                <Users className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
                <span className="text-gray-600 font-medium">10K+ Learners</span>
              </div>
              <div className="flex items-center space-x-2 group hover:scale-105 transition-transform duration-200">
                <TrendingUp className="w-5 h-5 text-green-600 group-hover:scale-110 transition-transform" />
                <span className="text-gray-600 font-medium">95% Success Rate</span>
              </div>
              <div className="flex items-center space-x-2 group hover:scale-105 transition-transform duration-200">
                <Star className="w-5 h-5 text-yellow-500 group-hover:scale-110 transition-transform" />
                <span className="text-gray-600 font-medium">4.9/5 Rating</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="container mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-50 text-blue-700 border-blue-200">
              Features
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Why Choose EchoLearn?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover the features that make learning more engaging and effective
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="group bg-white/70 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Mic className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-center text-gray-900">Voice Conversations</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-800 mb-4 leading-relaxed font-medium">
                  Speak naturally with your AI tutor using cutting-edge voice recognition and synthesis technology.
                </p>
                <div className="flex items-center justify-center space-x-2 text-sm text-blue-600">
                  <CheckCircle className="w-4 h-4" />
                  <span>Natural speech processing</span>
                </div>
              </CardContent>
            </Card>

            <Card className="group bg-white/70 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-center text-gray-900">Smart Summaries</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-800 mb-4 leading-relaxed font-medium">
                  Get AI-generated summaries of your conversations to reinforce key concepts and track progress.
                </p>
                <div className="flex items-center justify-center space-x-2 text-sm text-purple-600">
                  <CheckCircle className="w-4 h-4" />
                  <span>Intelligent content analysis</span>
                </div>
              </CardContent>
            </Card>

            <Card className="group bg-white/70 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-center text-gray-900">Personalized Quizzes</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-800 mb-4 leading-relaxed font-medium">
                  Test your understanding with AI-generated quizzes based on your unique conversations.
                </p>
                <div className="flex items-center justify-center space-x-2 text-sm text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span>Adaptive questioning</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Testimonial Section */}
        <section className="container mx-auto px-6 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-gradient-to-r from-green-100 to-blue-100 text-green-700 border-green-200">
              <Quote className="w-3 h-3 mr-1" />
              Student Success
            </Badge>
            <blockquote className="text-2xl md:text-3xl font-semibold text-gray-800 mb-6 leading-relaxed">
              "EchoLearn transformed how I study. The AI conversations feel natural, and the quizzes help me retain everything perfectly."
            </blockquote>
            <div className="flex items-center justify-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                J
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-800">Josh Ascano</p>
                <p className="text-gray-600">Computer Engineering Student</p>
              </div>
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section id="how-it-works" className="container mx-auto px-6 py-20 bg-white/30 backdrop-blur-sm rounded-3xl mx-6">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-indigo-50 text-indigo-700 border-indigo-200">
              Process
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Four simple steps to transform your learning experience
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {[
              {
                step: "1",
                title: "Start Talking",
                description: "Begin a voice conversation about any topic you want to learn",
                color: "blue",
                icon: Mic
              },
              {
                step: "2", 
                title: "Learn Together",
                description: "Engage in natural dialogue with your AI tutor",
                color: "purple",
                icon: MessageCircle
              },
              {
                step: "3",
                title: "Get Summary", 
                description: "Receive an AI-generated summary of key points",
                color: "green",
                icon: BookOpen
              },
              {
                step: "4",
                title: "Test Knowledge",
                description: "Take a personalized quiz to reinforce learning",
                color: "orange",
                icon: Sparkles
              }
            ].map((item, index) => {
              const Icon = item.icon;
              const colorClasses = {
                blue: "from-blue-500 to-blue-600",
                purple: "from-purple-500 to-purple-600", 
                green: "from-green-500 to-green-600",
                orange: "from-orange-500 to-orange-600"
              };
              
              return (
                <div key={index} className="text-center group">
                  <div className={`w-16 h-16 bg-gradient-to-br ${colorClasses[item.color]} text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <div className={`inline-block w-8 h-8 bg-gradient-to-br ${colorClasses[item.color]} text-white rounded-full flex items-center justify-center mb-3 text-sm font-bold`}>
                    {item.step}
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-gray-800">{item.title}</h3>
                  <p className="text-gray-800 leading-relaxed font-medium">{item.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="container mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-purple-50 text-purple-700 border-purple-200">
              FAQ
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to know about EchoLearn
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            {[
              {
                question: "How does the AI voice conversation work?",
                answer: "EchoLearn uses advanced speech recognition and natural language processing to understand your questions and provide intelligent responses. The AI can discuss any topic and adapt to your learning style."
              },
              {
                question: "Is my conversation data secure and private?",
                answer: "Yes, absolutely. We take privacy seriously. Your conversations are encrypted and stored securely. We never share your personal data with third parties, and you can delete your data at any time."
              },
              {
                question: "Can I use EchoLearn for any subject?",
                answer: "Yes! EchoLearn is designed to help with any subject - from mathematics and science to history, literature, and languages. The AI adapts to different topics and learning contexts."
              },
              {
                question: "How accurate are the AI-generated summaries and quizzes?",
                answer: "Our AI generates highly accurate summaries and relevant quiz questions based on your conversations. The system learns from your interactions to provide increasingly personalized content."
              },
              {
                question: "Do I need any special equipment to use EchoLearn?",
                answer: "No special equipment needed! Just a device with a microphone and internet connection. EchoLearn works on computers, tablets, and smartphones."
              },
              {
                question: "Is there a free trial available?",
                answer: "Yes! You can start using EchoLearn immediately with no signup required. Experience the full features and decide if it's right for your learning journey."
              }
            ].map((faq, index) => (
              <Card key={index} className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-800 text-left">
                    {faq.question}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed text-left">
                    {faq.answer}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="container mx-auto px-6 py-20 bg-white/30 backdrop-blur-sm rounded-3xl mx-6">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-green-50 text-green-700 border-green-200">
              Contact
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Get in Touch
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Have questions or need support? We're here to help you succeed.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="group bg-white/70 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-lg font-bold text-gray-800">Email Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Get help with any questions or technical issues</p>
                <a href="mailto:support@echolearn.ai" className="text-blue-600 hover:text-blue-700 font-medium">
                  support@echolearn.ai
                </a>
              </CardContent>
            </Card>

            <Card className="group bg-white/70 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-lg font-bold text-gray-800">Community</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Join our learning community and connect with other users</p>
                <a href="#" className="text-purple-600 hover:text-purple-700 font-medium">
                  Join Discord
                </a>
              </CardContent>
            </Card>

            <Card className="group bg-white/70 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-lg font-bold text-gray-800">Documentation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Learn how to get the most out of EchoLearn</p>
                <a href="#" className="text-green-600 hover:text-green-700 font-medium">
                  View Docs
                </a>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="container mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border-blue-200">
              Pricing
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose the plan that fits your learning needs. Start free and upgrade anytime.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Starter Plan */}
            <Card className="group relative bg-white/70 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Mic className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-800 mb-2">Starter</CardTitle>
                <p className="text-gray-600 mb-4">Perfect for individual learners and students</p>
                <div className="flex items-baseline justify-center">
                  <span className="text-4xl font-bold text-gray-800">$9</span>
                  <span className="text-lg text-gray-600 ml-1">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">60 minutes of AI conversations</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">Unlimited quiz generation</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">AI-powered summaries</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">Study progress tracking</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">Mobile & desktop access</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">Email support</span>
                  </div>
                </div>
                <Button 
                  className="w-full mt-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-xl transition-all duration-200 group-hover:scale-105"
                  onClick={() => {
                    if (user) {
                      onStartConversation();
                    } else {
                      navigate('/auth');
                    }
                  }}
                >
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <p className="text-sm text-gray-500 text-center">
                  ~$0.15 per minute • Cancel anytime
                </p>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="group relative bg-white/70 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">
              {/* Popular Badge */}
              <div className="absolute -top-0 left-1/2 transform -translate-x-1/2 z-10">
                <Badge className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-1 rounded-b-lg border-0 shadow-lg">
                  Most Popular
                </Badge>
              </div>
              
              <CardHeader className="text-center pb-4 pt-8">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-800 mb-2">Pro</CardTitle>
                <p className="text-gray-600 mb-4">For serious learners and power users</p>
                <div className="flex items-baseline justify-center">
                  <span className="text-4xl font-bold text-gray-800">$29</span>
                  <span className="text-lg text-gray-600 ml-1">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">300 minutes of AI conversations</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">Unlimited quiz generation</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">Advanced AI summaries</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">Priority voice processing</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">Custom learning paths</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">Export study materials</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">Priority support</span>
                  </div>
                </div>
                <Button 
                  className="w-full mt-6 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-3 rounded-xl transition-all duration-200 group-hover:scale-105"
                  onClick={() => {
                    if (user) {
                      onStartConversation();
                    } else {
                      navigate('/auth');
                    }
                  }}
                >
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <p className="text-sm text-gray-500 text-center">
                  ~$0.10 per minute • Cancel anytime
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Additional info */}
          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">
              Need more? <a href="#contact" className="text-blue-600 hover:text-blue-700 font-medium">Contact us</a> for custom enterprise plans.
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>30-day money-back guarantee</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>No setup fees</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-6 py-20 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
              Ready to Transform Your Learning?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Join thousands of learners who have already discovered the power of AI-assisted education.
            </p>
            
            <Button
              onClick={() => {
                if (user) {
                  onStartConversation();
                } else {
                  navigate('/auth');
                }
              }}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-12 py-6 text-xl font-semibold rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 group"
            >
              <Play className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" />
              Start Your Journey
              <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <p className="text-sm text-gray-500 mt-6">
              No signup required • Start learning in seconds
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}; 