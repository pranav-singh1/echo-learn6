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
  Quote
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface LandingPageProps {
  onStartConversation: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartConversation }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
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
            <div className="flex items-center space-x-3 group">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                EchoLearn
              </span>
            </div>
            <Badge variant="secondary" className="hidden md:flex items-center space-x-1 animate-pulse">
              <Star className="w-3 h-3" />
              <span>AI-Powered Learning</span>
            </Badge>
          </nav>
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
        <section className="container mx-auto px-6 py-20">
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
                <CardTitle className="text-xl font-bold text-center">Voice Conversations</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-4 leading-relaxed">
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
                <CardTitle className="text-xl font-bold text-center">Smart Summaries</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-4 leading-relaxed">
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
                <CardTitle className="text-xl font-bold text-center">Personalized Quizzes</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-4 leading-relaxed">
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
                S
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-800">Sarah Chen</p>
                <p className="text-gray-600">Computer Science Student</p>
              </div>
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section className="container mx-auto px-6 py-20 bg-white/30 backdrop-blur-sm rounded-3xl mx-6">
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
                  <p className="text-gray-600 leading-relaxed">{item.description}</p>
                </div>
              );
            })}
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