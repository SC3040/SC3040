'use client'

import { useState } from 'react';
import { uploadReceiptServerAction } from '@/app/api/receipt/route';

export function useUploadReceipt() {
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const uploadReceipt = async (file: File) => {
        setIsUploading(true);
        setError(null);
    
        const formData = new FormData();
        formData.append('file', file, file.name);
    
        try {
            const data = await uploadReceiptServerAction(formData);
            return data;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
            throw err;
        } finally {
            setIsUploading(false);
        }
    };

    return { uploadReceipt, isUploading, error };
}