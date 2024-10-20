"use client"

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useAIPrompt } from '@/hooks/useAIPrompt';
import { Alert, AlertDescription } from "@/components/ui/alert";

const AIAnalysis: React.FC = () => {
  const [userPrompt, setUserPrompt] = useState<string>('');
  const { loading, prompt, error, fetchAIPrompt } = useAIPrompt();

  const handleUserPromptSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: Implement handling of user's custom prompt
    console.log("User prompt submitted:", userPrompt);
    await fetchAIPrompt();
    // You might want to send this to your backend or process it in some way
  };

  return (
    <Card className="w-full bg-transparent">
      <CardHeader>
        <CardTitle>AI Insights ✨</CardTitle>
        <CardDescription>Get AI-powered insights about your spending!</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleUserPromptSubmit} className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Or enter your own prompt here..."
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              className="flex-grow"
            />
            <Button type="submit" disabled={loading || !userPrompt}>
              Submit
            </Button>
          </div>
        </form>

        {prompt && (
          <div className="mt-4 p-4 bg-muted rounded-md">
            <h3 className="font-semibold mb-2">AI Insights:</h3>
            <p>{prompt}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIAnalysis;