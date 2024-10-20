"use client"

import { useState } from 'react';
import { fetchAIPromptServerAction } from '@/app/api/aiprompt/route';

export function useAIPrompt() {
    const [loading, setLoading] = useState<boolean>(false);
    const [prompt, setPrompt] = useState<string>("");
    const [error, setError] = useState<Error | null>(null);

    const fetchAIPrompt = async () : Promise<Error | null> => {
        setLoading(true);
        setPrompt("");

        try {
            const aIPrompt = await fetchAIPromptServerAction();
            setPrompt(aIPrompt);
        } catch (error) {
            setError(error as Error);
        } finally {
            setLoading(false);
        }


        return error
    }

    return {loading, prompt, error, fetchAIPrompt}

}
