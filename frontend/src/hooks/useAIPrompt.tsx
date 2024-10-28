"use client"

import { useState } from 'react';
import { fetchAIPromptServerAction } from '@/app/api/aiprompt/route';

export function useAIPrompt() {
    const [loading, setLoading] = useState<boolean>(false);
    const [prompt, setPrompt] = useState<string>("");
    const [error, setError] = useState<Error | null>(null);

    const fetchAIPrompt = async (): Promise<void> => {
        setLoading(true);
        setPrompt("");
        setError(null);

        try {
            const aIPrompt = await fetchAIPromptServerAction(prompt);
            if (typeof aIPrompt === 'string') {
                setPrompt(aIPrompt);
                console.log('Fetched Prompt:', aIPrompt);
            } else {
                throw new Error('Invalid prompt format received from server.');
            }
        } catch (err) {
            console.error('Error fetching AI prompt:', err);
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    };

    return { loading, prompt, error, fetchAIPrompt };
}
