"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const AIAnalysis = () => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    // TODO: Replace with actual AI API call
    setTimeout(() => {
      setResponse(`AI analysis for "${prompt}": This is a placeholder response. In a real implementation, this would be the result from an AI model.`);
      setIsLoading(false);
    }, 2000);
  };

  return (
    <Card className="w-full bg-transparent">
      <CardHeader>
        <CardTitle>AI Insights ✨</CardTitle>
        <CardDescription>Enter a prompt to get AI insights about your spending!</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter your prompt here..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="flex-grow"
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Analyze'}
            </Button>
          </div>
          {response && (
            <div className="mt-4 p-4 rounded-md">
              <h3 className="font-semibold mb-2">AI Response:</h3>
              <p>{response}</p>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default AIAnalysis;