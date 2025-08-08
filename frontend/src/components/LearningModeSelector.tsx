import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { MessageCircle, Brain, Sparkles, GraduationCap } from 'lucide-react';

interface LearningModeSelectorProps {
  onSelectMode: (mode: 'conversation' | 'blurting' | 'teaching') => void;
}

export const LearningModeSelector: React.FC<LearningModeSelectorProps> = ({ onSelectMode }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2 text-foreground">Choose Your Learning Mode</h2>
        <p className="text-muted-foreground">Select how you'd like to learn today</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onSelectMode('conversation')}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <MessageCircle className="h-6 w-6 text-blue-500" />
              <CardTitle className="text-foreground">Conversation Mode</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Start a natural conversation with your AI tutor. Ask questions, discuss topics, and learn through dialogue.
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4" />
              <span>Perfect for exploring new topics</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onSelectMode('blurting')}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Brain className="h-6 w-6 text-purple-500" />
              <CardTitle className="text-foreground">Blurting Mode</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Write everything you know about a topic, then get personalized feedback and continue learning.
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4" />
              <span>Great for testing your knowledge</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onSelectMode('teaching')}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <GraduationCap className="h-6 w-6 text-green-500" />
              <CardTitle className="text-foreground">Teaching Mode</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Explain concepts back to the AI as if you're the teacher. Solidify your understanding through teaching.
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4" />
              <span>Great for deepening comprehension</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}; 