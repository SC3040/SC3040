"use client"

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useAIPrompt } from '@/hooks/useAIPrompt';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const useTypewriter = (text: string, speed: number = 30) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!text) {
      setDisplayedText('');
      setIsTyping(false);
      return;
    }

    setIsTyping(true);
    setDisplayedText('');
    
    const characters = Array.from(text);
    let index = 0;

    const typeNextCharacter = () => {
      if (index < characters.length) {
        setDisplayedText(current => current + characters[index]);
        index++;
        timeoutRef.current = setTimeout(typeNextCharacter, speed);
      } else {
        setIsTyping(false);
      }
    };

    // Start the typing immediately
    timeoutRef.current = setTimeout(typeNextCharacter, 0);

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setIsTyping(false);
    };
  }, [text, speed]);

  return { displayedText, isTyping };
};

const AIAnalysis: React.FC = () => {
  const [userPrompt, setUserPrompt] = useState<string>('');
  const { loading, prompt, error, fetchAIPrompt } = useAIPrompt();
  const { displayedText, isTyping } = useTypewriter(prompt || '');

  const handleUserPromptSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("User prompt submitted:", userPrompt);
    
    await fetchAIPrompt();

    if (!error) {
      setUserPrompt("");
    }
  };

  return (
    <Card className="w-full bg-transparent">
      <CardHeader>
        <CardTitle>
          AI Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        )}

        {(displayedText || isTyping) && (
          <div className="mt-4 p-4 bg-muted rounded-md">
            <div className="pb-2">
            <Avatar>
              <AvatarImage src="/images/ai_dp.jpg" />
              <AvatarFallback>AI</AvatarFallback>
            </Avatar>
            </div>
            <div className="flex">
              <p className="whitespace-pre-line">{displayedText}</p>
              {isTyping && (
                <span className="text-primary">▊</span>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleUserPromptSubmit} className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Can you provide some insights into my spending habits..."
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              className="flex-grow"
            />
            <Button type="submit" disabled={loading || !userPrompt || isTyping}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  AI is thinking...
                </>
              ) : (
                'Ask AI ✨'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AIAnalysis;