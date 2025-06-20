
import React from 'react';
import { Mic, Sparkles, MessageCircle, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import RotatingText from './RotatingText';

interface HeroProps {
  onStartSpeaking: () => void;
}

const Hero: React.FC<HeroProps> = ({ onStartSpeaking }) => {
  const benefits = [
    'active recall',
    'deeper understanding', 
    'better retention',
    'catch mistakes',
    'build confidence'
  ];

  return (
    <div className="flex-1 flex items-center justify-center px-6 py-12">
      <div className="max-w-4xl mx-auto text-center">
        {/* Logo/Brand */}
        <div className="flex items-center justify-center mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-3 mr-3">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">EchoLearn</h1>
        </div>

        {/* Main Tagline with Rotating Text */}
        <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
          Learn better through{" "}
          <RotatingText
            texts={benefits}
            mainClassName="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent inline-block"
            rotationInterval={3000}
            transition={{ type: "spring", damping: 30, stiffness: 400 }}
            staggerDuration={0.025}
            staggerFrom="last"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-120%" }}
          />
        </h2>

        {/* Subtext */}
        <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
          An AI-powered study assistant that listens, guides, and quizzes you. 
          Transform your learning by explaining concepts out loud.
        </p>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12 max-w-3xl mx-auto">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <Mic className="w-8 h-8 text-blue-600 mb-3 mx-auto" />
            <h3 className="font-semibold text-gray-900 mb-2">Voice-First</h3>
            <p className="text-sm text-gray-600">Speak naturally and let AI understand your learning style</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <MessageCircle className="w-8 h-8 text-indigo-600 mb-3 mx-auto" />
            <h3 className="font-semibold text-gray-900 mb-2">Interactive Chat</h3>
            <p className="text-sm text-gray-600">Engage in meaningful conversations about your study topics</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <Sparkles className="w-8 h-8 text-purple-600 mb-3 mx-auto" />
            <h3 className="font-semibold text-gray-900 mb-2">Smart Quizzes</h3>
            <p className="text-sm text-gray-600">Get personalized quizzes based on your explanations</p>
          </div>
        </div>

        {/* CTA Button */}
        <Button 
          onClick={onStartSpeaking}
          size="lg"
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-12 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
        >
          <Mic className="w-6 h-6 mr-3" />
          Start Speaking
        </Button>

        <p className="text-sm text-gray-500 mt-4">
          No sign-up required • Free to try
        </p>
      </div>
    </div>
  );
};

export default Hero;
