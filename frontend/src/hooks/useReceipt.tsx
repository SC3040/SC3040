'use client'

import { useState } from 'react';
import { uploadReceiptServerAction, confirmReceiptServerAction, getAllReceiptsServerAction, ReceiptResponse } from '@/app/api/receipt/route';

export function useReceipt() {
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [isConfirming, setIsConfirming] = useState<boolean>(false);
    const [isGetting, setIsGetting] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null);

    const uploadReceipt = async (file: File) => {
        setIsUploading(true);
        setError(null);
    
        const formData = new FormData();
        formData.append('image', file, file.name);
    
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

    const confirmReceipt = async (receiptData: ReceiptResponse) => {
        setIsConfirming(true);
        setError(null);

        try {
            const success = await confirmReceiptServerAction(receiptData);
            return success;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
            throw err;
        } finally {
            setIsConfirming(false);
        }
    };

    const getAllReceipts = async () => {
        setIsGetting(true);
        setError(null);

        try {
            const data = await getAllReceiptsServerAction();
            return data;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
            throw err;
        } finally {
            setIsGetting(false);
        }
    };

    return { uploadReceipt, confirmReceipt, getAllReceipts, isUploading, isConfirming, isGetting, error };
}