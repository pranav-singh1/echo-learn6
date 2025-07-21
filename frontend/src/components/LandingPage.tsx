// REDESIGN 2025-01-20
import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { 
  ArrowRight, 
  Play, 
  Mic, 
  MessageSquare, 
  Sparkles, 
  BookOpen, 
  Target, 
  Brain, 
  Users,
  CheckCircle,
  Star,
  Quote,
  Phone,
  Mail,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  X,
  Menu
} from 'lucide-react';
import { 
  Microphone,
  ChatCircle,
  Sparkle,
  BookBookmark,
  Target as TargetIcon,
  Brain as BrainIcon,
  Users as UsersIcon,
  CheckCircle as CheckIcon,
  Star as StarIcon,
  Quotes,
  Phone as PhoneIcon,
  Envelope,
  Chat
} from 'phosphor-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

// Animated benefits component with typewriter effect
const AnimatedBenefits: React.FC<{ className?: string }> = ({ className }) => {
  const benefits = React.useMemo(() => [
    "Learn faster through conversation",
    "Get instant AI feedback", 
    "Track your progress with quizzes"
  ], []);
  
  const [currentBenefit, setCurrentBenefit] = React.useState(0);
  const [displayText, setDisplayText] = React.useState('');
  const [isTyping, setIsTyping] = React.useState(true);
  
  React.useEffect(() => {
    const currentText = benefits[currentBenefit];
    let timeoutId: NodeJS.Timeout;
    
    if (isTyping) {
      // Typing effect
      if (displayText.length < currentText.length) {
        timeoutId = setTimeout(() => {
          setDisplayText(currentText.slice(0, displayText.length + 1));
        }, 50);
      } else {
        // Finished typing, wait then start erasing
        timeoutId = setTimeout(() => {
          setIsTyping(false);
        }, 2000);
      }
    } else {
      // Erasing effect
      if (displayText.length > 0) {
        timeoutId = setTimeout(() => {
          setDisplayText(displayText.slice(0, -1));
        }, 30);
      } else {
        // Finished erasing, move to next benefit
        setCurrentBenefit((prev) => (prev + 1) % benefits.length);
        setIsTyping(true);
      }
    }
    
    return () => clearTimeout(timeoutId);
  }, [benefits, currentBenefit, displayText, isTyping]);
  
  return (
    <div className={`text-sm font-medium transition-all duration-300 ${className} h-6 flex items-center`}>
      <span>{displayText}</span>
      <span className="animate-pulse ml-1 text-brand">|</span>
    </div>
  );
};

interface LandingPageProps {
  onStartConversation: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartConversation }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [expandedFaq, setExpandedFaq] = React.useState<number | null>(null);
  
  // FAQ data
  const faqs = [
    {
      question: "How does EchoLearn work?",
      answer: "EchoLearn uses advanced AI to have natural voice conversations with you about any topic you want to learn. After each conversation, it generates personalized summaries and quizzes to reinforce your understanding."
    },
    {
      question: "Is my data secure?",
      answer: "Yes! We use enterprise-grade encryption and never share your personal conversations. Your learning data stays private and is only used to improve your personalized experience."
    },
    {
      question: "Can I use EchoLearn offline?",
      answer: "EchoLearn requires an internet connection for the AI conversations and voice processing. However, you can review your saved summaries and take quizzes offline."
    },
    {
      question: "What subjects can I learn?",
      answer: "EchoLearn works with any subject! Whether it's math, science, history, languages, or professional skills - our AI adapts to your learning needs."
    },
    {
      question: "How much does it cost?",
      answer: "We offer a free plan with 10 conversations per day. Our Pro plan at $9.99/month gives you unlimited conversations and advanced features."
    },
    {
      question: "Can I cancel anytime?",
      answer: "Absolutely! You can cancel your subscription at any time with no penalties. Your account will remain active until the end of your billing period."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-lite via-white to-brand-lite overflow-hidden">
      {/* Morphing Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-brand/20 to-brand-dark/20 rounded-full animate-morph opacity-60"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-brand-dark/20 to-brand/20 rounded-full animate-morph animation-delay-400 opacity-40"></div>
        <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-gradient-to-r from-brand-lite/40 to-brand/10 rounded-full animate-morph animation-delay-800 opacity-50"></div>
      </div>

      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-glass-white backdrop-blur-md border-b border-brand/20 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <nav className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-brand to-brand-dark rounded-xl flex items-center justify-center shadow-lg">
                <Sparkle size={24} weight="duotone" className="text-white" />
              </div>
              <span className="text-2xl font-bold text-neutral tracking-tight">EchoLearn</span>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center space-x-8">
              <a href="#features" className="text-neutral hover:text-brand transition-colors duration-200 font-medium">
                Features
              </a>
              <a href="#how-it-works" className="text-neutral hover:text-brand transition-colors duration-200 font-medium">
                How it Works
              </a>
              <a href="#use-cases" className="text-neutral hover:text-brand transition-colors duration-200 font-medium">
                Use Cases
              </a>
              <a href="#faq" className="text-neutral hover:text-brand transition-colors duration-200 font-medium">
                FAQ
              </a>
              <a href="#contact" className="text-neutral hover:text-brand transition-colors duration-200 font-medium">
                Contact
              </a>
              <a href="#pricing" className="text-neutral hover:text-brand transition-colors duration-200 font-medium">
                Pricing
              </a>
              {user ? (
                <Button
                  onClick={onStartConversation}
                  className="bg-brand hover:bg-brand-dark text-white px-6 py-2 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Launch App
                </Button>
              ) : (
                <Button
                  onClick={() => navigate('/auth')}
                  variant="outline"
                  className="border-2 border-brand/30 bg-glass-white backdrop-blur-sm text-brand hover:bg-brand/5 hover:border-brand/50 px-6 py-2 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Sign In
                </Button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg bg-glass-white backdrop-blur-sm border border-brand/20 hover:bg-brand/5 transition-colors"
            >
              {mobileMenuOpen ? <X size={24} className="text-neutral" /> : <Menu size={24} className="text-neutral" />}
            </button>
          </nav>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="lg:hidden mt-4 p-6 bg-glass-white backdrop-blur-md rounded-2xl border border-brand/20 shadow-xl">
              <div className="flex flex-col space-y-4">
                <a href="#features" className="text-neutral hover:text-brand transition-colors duration-200 font-medium py-2" onClick={() => setMobileMenuOpen(false)}>
                  Features
                </a>
                <a href="#how-it-works" className="text-neutral hover:text-brand transition-colors duration-200 font-medium py-2" onClick={() => setMobileMenuOpen(false)}>
                  How it Works
                </a>
                <a href="#use-cases" className="text-neutral hover:text-brand transition-colors duration-200 font-medium py-2" onClick={() => setMobileMenuOpen(false)}>
                  Use Cases
                </a>
                <a href="#faq" className="text-neutral hover:text-brand transition-colors duration-200 font-medium py-2" onClick={() => setMobileMenuOpen(false)}>
                  FAQ
                </a>
                <a href="#contact" className="text-neutral hover:text-brand transition-colors duration-200 font-medium py-2" onClick={() => setMobileMenuOpen(false)}>
                  Contact
                </a>
                <a href="#pricing" className="text-neutral hover:text-brand transition-colors duration-200 font-medium py-2" onClick={() => setMobileMenuOpen(false)}>
                  Pricing
                </a>
                <div className="pt-4 border-t border-brand/20">
                  {user ? (
                    <Button
                      onClick={() => {
                        onStartConversation();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full bg-brand hover:bg-brand-dark text-white py-3 rounded-xl font-semibold"
                    >
                      Launch App
                    </Button>
                  ) : (
                    <Button
                      onClick={() => {
                        navigate('/auth');
                        setMobileMenuOpen(false);
                      }}
                      variant="outline"
                      className="w-full border-2 border-brand/30 bg-glass-white text-brand hover:bg-brand/5 py-3 rounded-xl"
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

      {/* Hero Section */}
      <section className="relative pt-32 pb-20">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Side - Content */}
            <div className="space-y-8 animate-fade-in-up">
              <div className="space-y-6">
                <Badge 
                  variant="outline" 
                  className="bg-glass-white backdrop-blur-sm border-brand/30 text-brand px-4 py-2 text-sm font-semibold rounded-full shadow-lg animate-float"
                >
                  Smarter Learning with AI
                </Badge>
                
                <h1 className="text-6xl lg:text-7xl font-bold text-neutral leading-tight tracking-tight">
                  Learn by{' '}
                  <span className="bg-gradient-to-r from-brand via-brand-dark to-purple-600 bg-clip-text text-transparent">
                    Teaching
                  </span>{' '}
                  Aloud
                </h1>
                
                <p className="text-xl text-neutral/80 leading-relaxed max-w-2xl">
                  Have natural voice conversations with AI about any topic. EchoLearn helps you learn faster 
                  by letting you explain concepts aloud, then generates personalized quizzes to test your understanding.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={() => {
                    if (user) {
                      onStartConversation();
                    } else {
                      navigate('/auth');
                    }
                  }}
                  size="lg"
                  className="bg-brand hover:bg-brand-dark text-white px-8 py-4 text-lg font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 group"
                >
                  <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                  Start Learning Now
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                
                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 border-brand/30 bg-glass-white backdrop-blur-sm text-brand hover:bg-brand/5 hover:border-brand/50 px-8 py-4 text-lg rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Watch Demo
                </Button>
              </div>

              <div className="pt-4">
                <AnimatedBenefits className="text-brand" />
              </div>
            </div>

            {/* Right Side - Demo Visual */}
            <div className="relative animate-fade-in-up animation-delay-200">
              <div className="relative">
                {/* Main Chat Interface Mockup */}
                <div className="bg-white backdrop-blur-lg rounded-3xl shadow-2xl border border-brand/20 p-6 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-brand to-brand-dark rounded-lg flex items-center justify-center">
                          <Sparkle size={16} weight="duotone" className="text-white" />
                        </div>
                        <span className="font-semibold text-gray-800">Calculus Study Session</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs text-gray-500">Live</span>
                      </div>
                    </div>

                    {/* Chat Messages */}
                    <div className="space-y-3 max-h-48 overflow-hidden">
                      {/* User Message */}
                      <div className="flex items-start space-x-2">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-xs">👤</span>
                        </div>
                        <div className="bg-blue-50 rounded-2xl rounded-tl-md p-3 max-w-[85%] border border-blue-100">
                          <p className="text-sm text-gray-800 leading-relaxed">I'm struggling with derivatives. Can you help me understand how to find the derivative of x³ + 2x² - 5x + 1?</p>
                        </div>
                      </div>
                      
                      {/* AI Response */}
                      <div className="flex items-start space-x-2">
                        <div className="w-6 h-6 bg-gradient-to-r from-brand to-brand-dark rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-xs text-white">🤖</span>
                        </div>
                        <div className="bg-gray-50 rounded-2xl rounded-tl-md p-3 max-w-[85%] border border-gray-200">
                          <p className="text-sm text-gray-800 leading-relaxed">Great question! Let's break this down step by step using the power rule. For each term:</p>
                          <div className="mt-2 text-xs font-mono bg-white p-2 rounded border">
                            <div>• d/dx(x³) = 3x²</div>
                            <div>• d/dx(2x²) = 4x</div>
                            <div>• d/dx(-5x) = -5</div>
                            <div>• d/dx(1) = 0</div>
                          </div>
                          <p className="text-sm text-gray-800 mt-2">So the derivative is: <strong>3x² + 4x - 5</strong></p>
                        </div>
                      </div>

                      {/* Follow-up */}
                      <div className="flex items-start space-x-2">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-xs">👤</span>
                        </div>
                        <div className="bg-blue-50 rounded-2xl rounded-tl-md p-3 max-w-[85%] border border-blue-100">
                          <p className="text-sm text-gray-800">That makes sense! Can you explain why the derivative of a constant is zero?</p>
                        </div>
                      </div>
                    </div>

                    {/* Voice Controls */}
                    <div className="flex items-center justify-center space-x-3 pt-3 border-t border-gray-200">
                      <Button size="sm" className="bg-brand hover:bg-brand-dark text-white rounded-full w-10 h-10 p-0 shadow-lg">
                        <Microphone size={14} weight="duotone" />
                      </Button>
                      <div className="flex-1 max-w-20 h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div className="w-3/4 h-full bg-gradient-to-r from-brand to-brand-dark rounded-full animate-pulse"></div>
                      </div>
                      <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">0:47</div>
                    </div>
                  </div>
                </div>

                {/* Floating Quiz Card */}
                <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl border border-purple-200 p-4 max-w-64 transform rotate-[-6deg] hover:rotate-0 hover:-translate-y-2 transition-transform duration-500 cursor-pointer">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <Sparkle size={12} weight="duotone" className="text-white" />
                    </div>
                    <span className="font-semibold text-gray-800 text-sm">Quiz Ready!</span>
                  </div>
                  <p className="text-xs text-gray-600 mb-3">Test your calculus understanding</p>
                  <div className="text-xs text-gray-700 mb-3 bg-gray-50 p-2 rounded border">
                    <strong>Q1:</strong> What's the derivative of 2x³?
                  </div>
                  <Button size="sm" className="bg-gradient-to-r from-brand to-brand-dark text-white rounded-lg text-xs px-3 py-1 w-full">
                    Take Quiz (3 questions)
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Strip */}
      <section className="py-12 bg-glass-white backdrop-blur-sm border-y border-brand/20">
        <div className="container mx-auto px-6">
          <div className="text-center space-y-6">
            <p className="text-sm font-medium text-neutral/60 uppercase tracking-wide">Trusted by learners worldwide</p>
            <div className="flex items-center justify-center">
              <p className="text-lg md:text-xl text-neutral/80 max-w-2xl mx-auto font-medium italic bg-white/60 rounded-xl px-6 py-4 shadow-sm border border-brand/10">
                Join others who have already cut their study time in half with <span className="text-brand font-semibold">EchoLearn</span>. Start today and spend tonight celebrating progress instead of cramming.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 relative">
        <div 
          className="absolute inset-0 bg-gradient-to-b from-transparent to-brand-lite/30" 
          style={{ clipPath: 'polygon(0 20%, 100% 0%, 100% 80%, 0% 100%)' }}
        ></div>
        
        <div className="container mx-auto px-6 relative">
          <div className="text-center space-y-6 mb-16">
            <Badge 
              variant="outline" 
              className="bg-glass-white backdrop-blur-sm border-brand/30 text-brand px-4 py-2 text-sm font-semibold rounded-full"
            >
              ✨ Powerful Features
            </Badge>
            <h2 className="text-5xl font-bold text-neutral">Why Choose EchoLearn</h2>
            <p className="text-xl text-neutral/70 max-w-3xl mx-auto">
              Our AI-powered platform combines the best of conversational learning with personalized assessment
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Microphone size={32} weight="duotone" className="text-brand" />,
                title: "Voice-First Learning",
                description: "Speak naturally about any topic. Our AI understands context and guides your learning through conversation."
              },
              {
                icon: <ChatCircle size={32} weight="duotone" className="text-brand" />,
                title: "Interactive Dialogue",
                description: "Engage in meaningful conversations that adapt to your learning style and pace."
              },
              {
                icon: <Sparkle size={32} weight="duotone" className="text-brand" />,
                title: "Smart Assessments",
                description: "Get instant quizzes generated from your conversations to reinforce understanding."
              },
              {
                icon: <BookBookmark size={32} weight="duotone" className="text-brand" />,
                title: "Knowledge Retention",
                description: "Track your progress and revisit key concepts with AI-generated summaries."
              },
              {
                icon: <BrainIcon size={32} weight="duotone" className="text-brand" />,
                title: "Adaptive Intelligence",
                description: "Our AI learns your preferences and adjusts teaching methods accordingly."
              },
              {
                icon: <TargetIcon size={32} weight="duotone" className="text-brand" />,
                title: "Goal-Oriented",
                description: "Set learning objectives and let EchoLearn guide you towards achieving them."
              }
            ].map((feature, index) => (
              <Card 
                key={index} 
                className="bg-glass-white backdrop-blur-md border-brand/20 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 group"
              >
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-brand-lite to-brand/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl font-bold text-neutral group-hover:text-brand transition-colors">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-neutral/70 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-24 bg-gradient-to-r from-brand-lite/50 to-white">
        <div className="container mx-auto px-6">
          <div className="text-center space-y-6 mb-16">
            <Badge 
              variant="outline" 
              className="bg-glass-white backdrop-blur-sm border-brand/30 text-brand px-4 py-2 text-sm font-semibold rounded-full"
            >
              🚀 Simple Process
            </Badge>
            <h2 className="text-5xl font-bold text-neutral">How EchoLearn Works</h2>
            <p className="text-xl text-neutral/80 max-w-3xl mx-auto leading-relaxed">
              Three simple steps to transform your learning experience
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                step: "01",
                title: "Start Talking",
                description: "Begin a voice conversation about any topic you want to learn. Just press the microphone and start explaining what you know.",
                icon: <Microphone size={48} weight="duotone" className="text-white" />
              },
              {
                step: "02",
                title: "AI Responds",
                description: "Our AI listens, understands your level, and provides personalized feedback and explanations to help you learn better.",
                icon: <BrainIcon size={48} weight="duotone" className="text-white" />
              },
              {
                step: "03",
                title: "Test Knowledge",
                description: "Get automatically generated quizzes based on your conversation to reinforce learning and track your progress.",
                icon: <CheckIcon size={48} weight="duotone" className="text-white" />
              }
            ].map((step, index) => (
              <div key={index} className="text-center space-y-6 animate-fade-in-up" style={{ animationDelay: `${index * 200}ms` }}>
                <div className="relative">
                  <div className="w-24 h-24 mx-auto bg-gradient-to-r from-brand to-brand-dark rounded-3xl flex items-center justify-center shadow-xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
                    {step.icon}
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center border-2 border-brand shadow-lg">
                    <span className="text-xs font-bold text-brand">{step.step}</span>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-neutral">{step.title}</h3>
                <p className="text-neutral/70 leading-relaxed max-w-sm mx-auto text-base">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section id="use-cases" className="py-24 relative">
        <div className="container mx-auto px-6">
          <div className="text-center space-y-6 mb-16">
            <Badge 
              variant="outline" 
              className="bg-glass-white backdrop-blur-sm border-brand/30 text-brand px-4 py-2 text-sm font-semibold rounded-full"
            >
              📚 Perfect For
            </Badge>
            <h2 className="text-5xl font-bold text-neutral">Who Uses EchoLearn</h2>
            <p className="text-xl text-neutral/70 max-w-3xl mx-auto">
              From students to professionals, EchoLearn adapts to your learning needs
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: "Students",
                description: "Master complex subjects through conversation",
                icon: "🎓",
                color: "from-brand to-brand-dark"
              },
              {
                title: "Professionals",
                description: "Upskill during commutes or breaks",
                icon: "💼",
                color: "from-brand-dark to-purple-600"
              },
              {
                title: "Educators",
                description: "Practice teaching and refine explanations",
                icon: "👨‍🏫",
                color: "from-purple-500 to-pink-500"
              },
              {
                title: "Lifelong Learners",
                description: "Explore new topics and hobbies",
                icon: "🌟",
                color: "from-pink-500 to-brand"
              }
            ].map((useCase, index) => (
              <Card 
                key={index} 
                className="bg-glass-white backdrop-blur-md border-brand/20 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group"
              >
                <CardContent className="p-8 text-center space-y-4">
                  <div className={`w-16 h-16 mx-auto bg-gradient-to-r ${useCase.color} rounded-2xl flex items-center justify-center text-2xl transform group-hover:scale-110 transition-transform duration-300`}>
                    {useCase.icon}
                  </div>
                  <h3 className="text-xl font-bold text-neutral group-hover:text-brand transition-colors">
                    {useCase.title}
                  </h3>
                  <p className="text-neutral/70">{useCase.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-gradient-to-r from-brand-lite/30 to-white">
        <div className="container mx-auto px-6">
          <div className="text-center space-y-6 mb-16">
            <Badge 
              variant="outline" 
              className="bg-glass-white backdrop-blur-sm border-brand/30 text-brand px-4 py-2 text-sm font-semibold rounded-full"
            >
              💬 What Our Users Say
            </Badge>
            <h2 className="text-5xl font-bold text-neutral">Student Success Stories</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Chen",
                role: "Computer Science Student",
                content: "EchoLearn helped me understand algorithms by letting me explain them out loud. The AI caught gaps in my knowledge I didn't even know existed!",
                rating: 5,
                avatar: "👩‍💻"
              },
              {
                name: "Marcus Rodriguez",
                role: "Medical Student",
                content: "Studying anatomy became so much easier when I could discuss it conversationally. The personalized quizzes are incredibly helpful for retention.",
                rating: 5,
                avatar: "👨‍⚕️"
              },
              {
                name: "Emily Watson",
                role: "High School Student",
                content: "Finally, a way to study that doesn't feel like studying! I actually look forward to my learning sessions now.",
                rating: 5,
                avatar: "👩‍🎓"
              }
            ].map((testimonial, index) => (
              <Card key={index} className="bg-glass-white backdrop-blur-md border-brand/20 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-8 space-y-6">
                  <div className="flex items-center space-x-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <StarIcon key={i} size={16} weight="fill" className="text-yellow-400" />
                    ))}
                  </div>
                  <Quotes size={32} weight="duotone" className="text-brand/40" />
                  <p className="text-neutral/80 leading-relaxed italic">"{testimonial.content}"</p>
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{testimonial.avatar}</div>
                    <div>
                      <p className="font-semibold text-neutral">{testimonial.name}</p>
                      <p className="text-sm text-neutral/60">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24">
        <div className="container mx-auto px-6">
          <div className="text-center space-y-6 mb-16">
            <Badge 
              variant="outline" 
              className="bg-glass-white backdrop-blur-sm border-brand/30 text-brand px-4 py-2 text-sm font-semibold rounded-full"
            >
              ❓ Common Questions
            </Badge>
            <h2 className="text-5xl font-bold text-neutral">Frequently Asked Questions</h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index} className="bg-glass-white backdrop-blur-md border-brand/20 shadow-sm hover:shadow-lg transition-all duration-300">
                <CardContent className="p-0">
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                    className="w-full p-6 text-left flex items-center justify-between hover:bg-brand/5 transition-colors rounded-lg"
                  >
                    <h3 className="font-semibold text-neutral">{faq.question}</h3>
                    {expandedFaq === index ? (
                      <ChevronUp className="w-5 h-5 text-brand flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-brand flex-shrink-0" />
                    )}
                  </button>
                  {expandedFaq === index && (
                    <div className="px-6 pb-6">
                      <p className="text-neutral/70 leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-gradient-to-r from-brand-lite/50 to-white">
        <div className="container mx-auto px-6">
          <div className="text-center space-y-6 mb-16">
            <Badge 
              variant="outline" 
              className="bg-glass-white backdrop-blur-sm border-brand/30 text-brand px-4 py-2 text-sm font-semibold rounded-full"
            >
              📞 Get in Touch
            </Badge>
            <h2 className="text-5xl font-bold text-neutral">Contact Us</h2>
            <p className="text-xl text-neutral/70 max-w-2xl mx-auto">
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            {/* Contact Info */}
            <div className="space-y-8">
              <div className="space-y-6">
                <Card className="bg-glass-white backdrop-blur-md border-brand/20 shadow-lg p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-brand to-brand-dark rounded-xl flex items-center justify-center">
                      <Envelope size={24} weight="duotone" className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral">Email Us</h3>
                      <p className="text-neutral/60">hello@echolearn.ai</p>
                    </div>
                  </div>
                </Card>

                <Card className="bg-glass-white backdrop-blur-md border-brand/20 shadow-lg p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-brand to-brand-dark rounded-xl flex items-center justify-center">
                      <Chat size={24} weight="duotone" className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral">Live Chat</h3>
                      <p className="text-neutral/60">Available 24/7</p>
                    </div>
                  </div>
                </Card>

                <Card className="bg-glass-white backdrop-blur-md border-brand/20 shadow-lg p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-brand to-brand-dark rounded-xl flex items-center justify-center">
                      <PhoneIcon size={24} weight="duotone" className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral">Phone Support</h3>
                      <p className="text-neutral/60">+1 (555) 123-4567</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* Contact Form */}
            <Card className="bg-glass-white backdrop-blur-md border-brand/20 shadow-xl">
              <CardContent className="p-8">
                <form className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-neutral block mb-2">First Name</label>
                      <input 
                        type="text" 
                        className="w-full p-3 border border-brand/20 rounded-lg bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-neutral block mb-2">Last Name</label>
                      <input 
                        type="text" 
                        className="w-full p-3 border border-brand/20 rounded-lg bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors"
                        placeholder="Doe"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral block mb-2">Email</label>
                    <input 
                      type="email" 
                      className="w-full p-3 border border-brand/20 rounded-lg bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral block mb-2">Subject</label>
                    <input 
                      type="text" 
                      className="w-full p-3 border border-brand/20 rounded-lg bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors"
                      placeholder="How can we help?"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral block mb-2">Message</label>
                    <textarea 
                      rows={4}
                      className="w-full p-3 border border-brand/20 rounded-lg bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors resize-none"
                      placeholder="Tell us more about your inquiry..."
                    ></textarea>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-brand hover:bg-brand-dark text-white py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24">
        <div className="container mx-auto px-6">
          <div className="text-center space-y-6 mb-16">
            <Badge 
              variant="outline" 
              className="bg-glass-white backdrop-blur-sm border-brand/30 text-brand px-4 py-2 text-sm font-semibold rounded-full"
            >
              💎 Simple Pricing
            </Badge>
            <h2 className="text-5xl font-bold text-neutral">Choose Your Plan</h2>
            <p className="text-xl text-neutral/70 max-w-2xl mx-auto">
              Start free and upgrade when you're ready for unlimited learning
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* Free Plan */}
              <Card className="bg-glass-white backdrop-blur-md border-brand/20 shadow-lg hover:shadow-xl transition-all duration-300 p-6">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-neutral">Free</CardTitle>
                  <p className="text-neutral/60">Perfect for getting started</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-3xl font-bold text-neutral">$0<span className="text-lg text-neutral/60">/month</span></div>
                  <ul className="space-y-2">
                    <li className="flex items-center space-x-2">
                      <CheckIcon className="w-5 h-5 text-brand" />
                      <span className="text-neutral">10 conversations/day</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckIcon className="w-5 h-5 text-brand" />
                      <span className="text-neutral">Basic quizzes</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckIcon className="w-5 h-5 text-brand" />
                      <span className="text-neutral">Community support</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Pro Plan */}
              <Card className="bg-gradient-to-br from-brand to-brand-dark text-white shadow-xl rounded-3xl p-6 transform scale-105">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold">Pro</CardTitle>
                  <p className="text-brand-lite">For serious learners</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-3xl font-bold">$9.99<span className="text-lg text-brand-lite">/month</span></div>
                  <ul className="space-y-2">
                    <li className="flex items-center space-x-2">
                      <CheckIcon className="w-5 h-5 text-brand-lite" />
                      <span>Unlimited conversations</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckIcon className="w-5 h-5 text-brand-lite" />
                      <span>60 voice minutes/month</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckIcon className="w-5 h-5 text-brand-lite" />
                      <span>Advanced quizzes</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
            <div className="text-center mt-8">
              <Button 
                onClick={() => navigate('/auth')}
                size="lg"
                className="bg-brand hover:bg-brand-dark text-white px-8 py-4 text-lg font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
                Start Free Trial
              </Button>
              <p className="text-brand text-sm mt-4">
                Need more? <a href="#contact" className="text-brand-dark hover:text-brand font-medium">Contact us</a> for custom enterprise plans.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-gradient-to-r from-neutral to-neutral border-t border-brand/20">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Logo & Description */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-brand to-brand-dark rounded-lg flex items-center justify-center">
                  <Sparkle size={20} weight="duotone" className="text-white" />
                </div>
                <span className="text-xl font-bold text-white">EchoLearn</span>
              </div>
              <p className="text-white/70 text-sm leading-relaxed">
                Transform your learning experience with AI-powered conversations and personalized assessments.
              </p>
            </div>

            {/* Product Links */}
            <div className="space-y-4">
              <h3 className="font-semibold text-white">Product</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="text-white/70 hover:text-brand transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="text-white/70 hover:text-brand transition-colors">How it Works</a></li>
                <li><a href="#pricing" className="text-white/70 hover:text-brand transition-colors">Pricing</a></li>
                <li><a href="#use-cases" className="text-white/70 hover:text-brand transition-colors">Use Cases</a></li>
              </ul>
            </div>

            {/* Support Links */}
            <div className="space-y-4">
              <h3 className="font-semibold text-white">Support</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#faq" className="text-white/70 hover:text-brand transition-colors">FAQ</a></li>
                <li><a href="#contact" className="text-white/70 hover:text-brand transition-colors">Contact</a></li>
                <li><a href="#" className="text-white/70 hover:text-brand transition-colors">Documentation</a></li>
                <li><a href="#" className="text-white/70 hover:text-brand transition-colors">Community</a></li>
              </ul>
            </div>

            {/* Legal Links */}
            <div className="space-y-4">
              <h3 className="font-semibold text-white">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-white/70 hover:text-brand transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-white/70 hover:text-brand transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-white/70 hover:text-brand transition-colors">Cookie Policy</a></li>
                <li><a href="#" className="text-white/70 hover:text-brand transition-colors">GDPR</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/20 flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <p className="text-white/60 text-sm">© 2024 EchoLearn. All rights reserved.</p>
            <div className="flex items-center space-x-6 text-sm">
              <a href="#" className="text-white/70 hover:text-brand transition-colors">Twitter</a>
              <a href="#" className="text-white/70 hover:text-brand transition-colors">LinkedIn</a>
              <a href="#" className="text-white/70 hover:text-brand transition-colors">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}; 