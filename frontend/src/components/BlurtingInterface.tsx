import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Brain, Send, Sparkles } from 'lucide-react';

export const BlurtingInterface: React.FC = () => {
  const { 
    blurtContent, 
    setBlurtContent, 
    submitBlurt, 
    isBlurtCompleted, 
    blurtFeedback,
    createNewSession,
    activeSession
  } = useAppContext();
  const [topic, setTopic] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!blurtContent.trim()) return;
    
    setIsSubmitting(true);
    await submitBlurt(blurtContent, topic);
    setIsSubmitting(false);
  };

  if (isBlurtCompleted) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            Blurt Analysis Complete
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-green-600 mb-2">What You Know Well</h4>
                <ul className="space-y-1">
                  {blurtFeedback?.knowledgeStrengths?.map((strength: string, i: number) => (
                    <li key={i} className="text-sm">• {strength}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-orange-600 mb-2">Areas to Improve</h4>
                <ul className="space-y-1">
                  {blurtFeedback?.knowledgeGaps?.map((gap: string, i: number) => (
                    <li key={i} className="text-sm">• {gap}</li>
                  ))}
                </ul>
              </div>
            </div>
            
            {blurtFeedback?.misconceptions && blurtFeedback.misconceptions.length > 0 && (
              <div>
                <h4 className="font-semibold text-red-600 mb-2">Misconceptions to Clarify</h4>
                <ul className="space-y-1">
                  {blurtFeedback.misconceptions.map((misconception: string, i: number) => (
                    <li key={i} className="text-sm">• {misconception}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <div>
              <h4 className="font-semibold text-blue-600 mb-2">Suggestions</h4>
              <ul className="space-y-1">
                {blurtFeedback?.suggestions?.map((suggestion: string, i: number) => (
                  <li key={i} className="text-sm">• {suggestion}</li>
                ))}
              </ul>
            </div>
            
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm">{blurtFeedback?.encouragement}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Brain className="h-5 w-5 text-purple-500" />
          Blurt Everything You Know
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-foreground">
        <div>
          <Label htmlFor="topic" className="text-foreground">Topic (optional)</Label>
          <Input
            id="topic"
            placeholder="e.g., Photosynthesis, World War II, Calculus..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
        </div>
        
        <div>
          <Label htmlFor="blurt" className="text-foreground">Write everything you know about this topic</Label>
          <Textarea
            id="blurt"
            placeholder="Start typing everything you know about the topic. Don't worry about being perfect - just write what comes to mind!"
            value={blurtContent}
            onChange={(e) => setBlurtContent(e.target.value)}
            className="min-h-[300px] text-foreground placeholder:text-muted-foreground"
          />
        </div>
        
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            {blurtContent.length} characters
          </p>
          <Button 
            onClick={handleSubmit}
            disabled={!blurtContent.trim() || isSubmitting}
            className="flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Sparkles className="h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Submit Blurt
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}; 