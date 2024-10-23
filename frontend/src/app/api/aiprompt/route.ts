'use server'

import { cookies } from 'next/headers';

export async function fetchAIPromptServerAction(): Promise<string> {

    const token = cookies().get('jwt')?.value;

    if (!token) {
        console.error('[fetchPromptServerAction] No JWT token found in cookies');
        throw new Error('Not authorized. JWT cookie missing or invalid.');
    }

    try {
        const response = await fetch(`${process.env.BACKEND_URL}/api/receipts/review`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': `jwt=${token}`
            },
            credentials: 'include',
        });

        const data = await response.text();
        console.log("[aiprompt route] data:", data);
        
        if (!response.ok) {
            throw new Error(`Error in response for fetch AI prompt: ${data}`);
        }

        return data;
        // return "HARDCODED RESPONSE";

    }catch(error){
        throw error;
    }

}