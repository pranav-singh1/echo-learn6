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
  X,
  Home,
  Footprints,
  GraduationCap,
  Train,
  Moon,
  Clock,
  Headphones,
  Target,
  Coffee
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Logo from './Logo';
import AnimatedBenefits from './AnimatedBenefits';

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

      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <nav className="flex items-center justify-between">
            <div 
              className="flex items-center space-x-3 group cursor-pointer"
              onClick={() => navigate('/')}
            >
              <Logo className="h-12 w-auto group-hover:scale-105 transition-transform duration-200" forceBlack={true} />
            </div>
            
            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium">
                Features
              </a>
              <a href="#use-cases" className="text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium">
                Use Cases
              </a>
              <a href="#how-it-works" className="text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium">
                How it Works
              </a>
              <a href="#faq" className="text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium">
                FAQ
              </a>
              <a href="#contact" className="text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium">
                Contact
              </a>
              <a href="#pricing" className="text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium">
                Pricing
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
            <div className="lg:hidden mt-4 p-4 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-gray-200">
              <div className="flex flex-col space-y-4">
                <a 
                  href="#features" 
                  className="text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Features
                </a>
                <a 
                  href="#use-cases" 
                  className="text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Use Cases
                </a>
                <a 
                  href="#how-it-works" 
                  className="text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  How it Works
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
                <a 
                  href="#pricing" 
                  className="text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Pricing
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
        </div>
      </header>

      <div className="relative z-10 pt-20">
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
                className="!bg-white !text-gray-700 !border-2 !border-gray-200 hover:!border-blue-300 hover:!bg-white/90 px-8 py-4 text-lg rounded-2xl transition-all duration-300 backdrop-blur-sm shadow-lg hover:shadow-xl"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Watch Demo
              </Button>
            </div>

            {/* Replace Stats with AnimatedBenefits */}
            <div className="animate-fade-in-up animation-delay-800">
              <AnimatedBenefits />
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
            <Card className="group bg-white/30 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">
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

            <Card className="group bg-white/30 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">
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

            <Card className="group bg-white/30 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">
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

        {/* Use Cases Section */}
        <section id="use-cases" className="container mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-gradient-to-r from-green-100 to-blue-100 text-green-700 border-green-200">
              Use Cases
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Learn <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Anywhere, Anytime</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              EchoLearn adapts to your lifestyle, turning any moment into a learning opportunity
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Study at Home */}
            <Card className="group bg-white/30 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Home className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-800 mb-3">Study at Home</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-4 leading-relaxed">
                  In your room, no one around to discuss concepts with? Have natural conversations with AI to clarify doubts and reinforce learning.
                </p>
                <div className="flex items-center justify-center space-x-2 text-sm text-indigo-600 font-medium">
                  <Clock className="w-4 h-4" />
                  <span>Anytime, 24/7</span>
                </div>
              </CardContent>
            </Card>

            {/* Walking to Class */}
            <Card className="group bg-white/30 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Footprints className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-800 mb-3">Walking to Class</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-4 leading-relaxed">
                  Refresh key concepts on your way to lectures. Use voice conversations to review material hands-free while walking.
                </p>
                <div className="flex items-center justify-center space-x-2 text-sm text-green-600 font-medium">
                  <Headphones className="w-4 h-4" />
                  <span>Hands-free learning</span>
                </div>
              </CardContent>
            </Card>

            {/* Before Exams */}
            <Card className="group bg-white/30 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <GraduationCap className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-800 mb-3">Exam Preparation</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-4 leading-relaxed">
                  Generate practice quizzes and get instant feedback. Have AI explain complex topics in different ways until you understand.
                </p>
                <div className="flex items-center justify-center space-x-2 text-sm text-orange-600 font-medium">
                  <Target className="w-4 h-4" />
                  <span>Focused prep</span>
                </div>
              </CardContent>
            </Card>

            {/* Commuting */}
            <Card className="group bg-white/30 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Train className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-800 mb-3">During Commute</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-4 leading-relaxed">
                  Turn travel time into productive study sessions. Review notes through voice or practice with AI-generated quizzes.
                </p>
                <div className="flex items-center justify-center space-x-2 text-sm text-blue-600 font-medium">
                  <Zap className="w-4 h-4" />
                  <span>Productive travel</span>
                </div>
              </CardContent>
            </Card>

            {/* Group Study */}
            <Card className="group bg-white/30 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-800 mb-3">Group Study</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-4 leading-relaxed">
                  When your study group can't meet, continue discussions with AI. Get different perspectives and explanations instantly.
                </p>
                <div className="flex items-center justify-center space-x-2 text-sm text-pink-600 font-medium">
                  <MessageCircle className="w-4 h-4" />
                  <span>Always available</span>
                </div>
              </CardContent>
            </Card>

            {/* Late Night Study */}
            <Card className="group bg-white/30 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Moon className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-800 mb-3">Late Night Sessions</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-4 leading-relaxed">
                  When libraries are closed and friends are asleep, get AI assistance for those last-minute study sessions and concept clarification.
                </p>
                <div className="flex items-center justify-center space-x-2 text-sm text-violet-600 font-medium">
                  <Coffee className="w-4 h-4" />
                  <span>Night owl friendly</span>
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
        <section id="how-it-works" className="container mx-auto px-6 py-20">
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
              <Card key={index} className="bg-white/30 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
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
        <section id="contact" className="container mx-auto px-6 py-20">
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

          <div className="flex justify-center max-w-md mx-auto">
            <Card className="group bg-white/30 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 text-center w-full">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-800">Email Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Get help with any questions or technical issues. We typically respond within 24 hours.
                </p>
                <a 
                  href="mailto:support@echolearn.ai" 
                  className="inline-flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  support@echolearn.ai
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
              Start free and feel the magic. Upgrade for more time and premium features.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Free Plan */}
            <Card className="group relative bg-white/30 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-800 mb-2">Free</CardTitle>
                <p className="text-gray-600 mb-4">Try the core experience, no credit card required</p>
                <div className="flex items-baseline justify-center">
                  <span className="text-4xl font-bold text-gray-800">$0</span>
                  <span className="text-lg text-gray-600 ml-1">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">Unlimited AI chat (text or voice)</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">Up to 10 minutes/day real-time voice</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">Unlimited saved sessions</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">1 quiz per session</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">Export transcript (text only)</span>
                  </div>
                  <div className="flex items-center space-x-3 opacity-60">
                    <X className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-500">No premium voices or controls</span>
                  </div>
                  <div className="flex items-center space-x-3 opacity-60">
                    <X className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-500">No downloadable quiz reports</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <div className="w-5 h-5 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                      <span className="text-xs">🔒</span>
                    </div>
                    <span className="text-gray-600">Watermark on transcripts</span>
                  </div>
                </div>
                <Button 
                  className="w-full mt-6 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 rounded-xl transition-all duration-200 group-hover:scale-105"
                  onClick={() => {
                    if (user) {
                      onStartConversation();
                    } else {
                      navigate('/auth');
                    }
                  }}
                >
                  Start Free
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <p className="text-sm text-gray-500 text-center">
                  Feel the magic • No credit card required
                </p>
              </CardContent>
            </Card>

            {/* Basic Plan */}
            <Card className="group relative bg-white/30 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Mic className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-800 mb-2">Basic</CardTitle>
                <p className="text-gray-600 mb-4">For regular learners who want more time</p>
                <div className="flex items-baseline justify-center">
                  <span className="text-4xl font-bold text-gray-800">$12</span>
                  <span className="text-lg text-gray-600 ml-1">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">Unlimited text + 1 hour/day voice</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">Unlimited saved sessions</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">Unlimited quizzes</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">Export transcripts + quizzes</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">Voice pause/resume & replay</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">Priority voice performance</span>
                  </div>
                  <div className="flex items-center space-x-3 opacity-60">
                    <X className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-500">No premium voice selection</span>
                  </div>
                  <div className="flex items-center space-x-3 opacity-60">
                    <X className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-500">No advanced customization</span>
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
                  ~$0.20 per minute • Cancel anytime
                </p>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="group relative bg-white/30 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">
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
                <p className="text-gray-600 mb-4">For power users, educators, or serious learners</p>
                <div className="flex items-baseline justify-center">
                  <span className="text-4xl font-bold text-gray-800">$25</span>
                  <span className="text-lg text-gray-600 ml-1">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">Unlimited text + 5 hours/day voice</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">All Basic features</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">Downloadable PDF reports</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">Premium ElevenLabs voices</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">Teaching style presets</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">AI session insights</span>
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
                  ~$0.14 per minute • Cancel anytime
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