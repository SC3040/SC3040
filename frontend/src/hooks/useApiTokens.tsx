import { useState, useEffect } from 'react';
import { fetchUserApiTokenStatus, updateUserApiTokens } from '@/app/api/settings/route';

export function useApiTokens() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tokenStatus, setTokenStatus] = useState<{
    defaultModel: string;
    geminiKey: string;
    openaiKey: string;
  } | null>(null);

  useEffect(() => {
    async function loadTokenStatus() {
      try {
        const data = await fetchUserApiTokenStatus();
        setTokenStatus(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch token status');
      } finally {
        setLoading(false);
      }
    }

    loadTokenStatus();
  }, []);

  const updateTokens = async (formData: {
    defaultModel: string;
    geminiKey: string;
    openaiKey: string;
  }) => {
    setLoading(true);
    setError(null);

    try {
      await updateUserApiTokens(formData);
      setTokenStatus(formData); // Update the local state after successful submission
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update tokens');
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, tokenStatus, updateTokens };
}
