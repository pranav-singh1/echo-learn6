import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { GraduationCap, Send, Sparkles } from 'lucide-react';

export const TeachingInterface: React.FC = () => {
  const { 
    createTeachingSession,
    activeSession
  } = useAppContext();
  const [topic, setTopic] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleStartTeaching = async () => {
    if (!topic.trim()) return;
    
    setIsCreating(true);
    await createTeachingSession();
    setIsCreating(false);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-green-500" />
          Start Teaching Mode
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center space-y-4">
          <h3 className="text-xl font-semibold text-foreground">
            What would you like to teach me today?
          </h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Choose a topic you want to explain to me. I'll act as your student, asking questions
            and helping you refine your understanding through teaching. This is a great way to
            solidify your knowledge!
          </p>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="topic">Topic to Teach</Label>
            <Input
              id="topic"
              placeholder="e.g., Photosynthesis, World War II, Calculus, How computers work..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="text-lg"
            />
          </div>
          
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-semibold mb-2">How it works:</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• I'll act as a curious student learning from you</li>
              <li>• I'll ask questions to help you think deeper</li>
              <li>• I'll gently point out gaps or ask for clarification</li>
              <li>• This helps you strengthen your understanding through teaching</li>
            </ul>
          </div>
        </div>
        
        <div className="flex justify-center">
          <Button
            onClick={handleStartTeaching}
            disabled={!topic.trim() || isCreating}
            size="lg"
            className="flex items-center gap-2 px-8"
          >
            {isCreating ? (
              <>
                <Sparkles className="h-4 w-4 animate-spin" />
                Starting...
              </>
            ) : (
              <>
                <GraduationCap className="h-4 w-4" />
                Start Teaching
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}; 