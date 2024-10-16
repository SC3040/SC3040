'use server';

import { cookies } from 'next/headers';
import { encrypt, decrypt } from '@/lib/encryptions';

type ApiTokenResponse = {
  defaultModel: string;
  geminiKey?: string;
  openaiKey?: string;
};

export async function fetchUserApiTokenStatus(): Promise<ApiTokenResponse> {
  const token = cookies().get('jwt')?.value;

  if (!token) {
    console.error('[fetchUserApiTokenStatus] No JWT token found in cookies');
    throw new Error('Not authorized. JWT cookie missing or invalid.');
  }

  try {
    const headers = {
      'Cookie': `jwt=${token}`,
    };

    console.log('[fetchUserApiTokenStatus] Request details:');
    console.log('URL:', `${process.env.BACKEND_URL}/api/users/api-token`);
    console.log('Method: GET');
    console.log('Headers:', JSON.stringify(headers, null, 2));

    const response = await fetch(`${process.env.BACKEND_URL}/api/users/api-token`, {
      method: 'GET',
      headers: headers,
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Error fetching API token status: ${response.statusText}`);
    }

    const data: ApiTokenResponse = await response.json();
    console.log("[fetchUserApiTokenStatus] Received data:", JSON.stringify(data, null, 2));

    return data;
  } catch (err) {
    console.error('[fetchUserApiTokenStatus] Error:', err);
    throw err;
  }
}

export async function updateUserApiTokens({
  defaultModel,
  geminiKey,
  openaiKey,
}: ApiTokenResponse): Promise<void> {
  const token = cookies().get('jwt')?.value;

  if (!token) {
    console.error('[updateUserApiTokens] No JWT token found in cookies');
    throw new Error('Not authorized. JWT cookie missing or invalid.');
  }

  try {
    const headers = {
      'Cookie': `jwt=${token}`,
      'Content-Type': 'application/json',
    };

    console.log('[updateUserApiTokens] Request details:');
    console.log('URL:', `${process.env.BACKEND_URL}/api/users/api-token`);
    console.log('Method: PUT');
    console.log('Headers:', JSON.stringify(headers, null, 2));
    console.log('Body:', JSON.stringify({ defaultModel, geminiKey, openaiKey }, null, 2));

    const response = await fetch(`${process.env.BACKEND_URL}/api/users/api-token`, {
      method: 'PUT',
      headers: headers,
      body: JSON.stringify({
        defaultModel,
        geminiKey,
        openaiKey,
      }),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[updateUserApiTokens] Error response: ${errorText}`);
      throw new Error(`Error updating API tokens: ${response.statusText}`);
    }

    console.log("[updateUserApiTokens] Successfully updated tokens");
  } catch (err) {
    console.error('[updateUserApiTokens] Error:', err);
    throw err;
  }
}
