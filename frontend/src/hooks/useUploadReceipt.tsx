import { useState } from 'react';

export function useUploadReceipt() {
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const uploadReceipt = async (file: File) => {
    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
        //TODO: authentication bearer tokens
      const response = await fetch(`${process.env.NEXT_PUBLIC_RECEIPT_SERVICE_URL}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      setIsUploading(false);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setIsUploading(false);
      throw err;
    }
  };

  return { uploadReceipt, isUploading, error };
}