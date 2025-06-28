import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Mic, Brain, BookOpen, Sparkles } from 'lucide-react';

interface LandingPageProps {
  onStartConversation: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartConversation }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mr-4">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              EchoLearn
            </h1>
          </div>
          <p className="text-xl text-gray-600 mb-4">
            Your AI-powered learning companion
          </p>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Have natural conversations, get personalized summaries, and test your knowledge with AI-generated quizzes.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mic className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle className="text-lg">Voice Conversations</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Speak naturally with your AI tutor using advanced voice recognition and synthesis.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-6 h-6 text-purple-600" />
              </div>
              <CardTitle className="text-lg">Smart Summaries</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Get AI-generated summaries of your conversations to reinforce key concepts.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle className="text-lg">Personalized Quizzes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Test your understanding with AI-generated quizzes based on your conversations.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Button
            onClick={onStartConversation}
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            <Mic className="w-5 h-5 mr-2" />
            Start Learning Conversation
          </Button>
          <p className="text-sm text-gray-500 mt-4">
            Click to begin your personalized learning journey
          </p>
        </div>

        {/* How it works */}
        <div className="mt-16">
          <h2 className="text-2xl font-semibold text-center mb-8 text-gray-800">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-lg font-bold">
                1
              </div>
              <h3 className="font-semibold mb-2">Start Talking</h3>
              <p className="text-sm text-gray-600">Begin a voice conversation about any topic you want to learn</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-lg font-bold">
                2
              </div>
              <h3 className="font-semibold mb-2">Learn Together</h3>
              <p className="text-sm text-gray-600">Engage in natural dialogue with your AI tutor</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-lg font-bold">
                3
              </div>
              <h3 className="font-semibold mb-2">Get Summary</h3>
              <p className="text-sm text-gray-600">Receive an AI-generated summary of key points</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-lg font-bold">
                4
              </div>
              <h3 className="font-semibold mb-2">Test Knowledge</h3>
              <p className="text-sm text-gray-600">Take a personalized quiz to reinforce learning</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 