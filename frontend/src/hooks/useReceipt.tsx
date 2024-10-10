import { useState } from 'react';
import { getAllReceiptsServerAction, confirmReceiptServerAction, uploadReceiptServerAction, updateReceiptServerAction } from '@/app/api/receipt/route';
import { ReceiptResponse } from '@/app/api/receipt/route';

export function useReceipt() {
    const [isGetting, setIsGetting] = useState(false);
    const [isConfirming, setIsConfirming] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    const getAllReceipts = async (): Promise<ReceiptResponse[]> => {
        setIsGetting(true);
        try {
            const data = await getAllReceiptsServerAction();
            return data;
        } catch (error) {
            console.error('Error getting all receipts:', error);
            throw error;
        } finally {
            setIsGetting(false);
        }
    };

    const confirmReceipt = async (confirmedData: ReceiptResponse): Promise<boolean> => {
        setIsConfirming(true);
        try {
            const result = await confirmReceiptServerAction(confirmedData);
            return result;
        } catch (error) {
            console.error('Error confirming receipt:', error);
            throw error;
        } finally {
            setIsConfirming(false);
        }
    };

    const uploadReceipt = async (formData: FormData): Promise<ReceiptResponse> => {
        setIsUploading(true);
        try {
            const data = await uploadReceiptServerAction(formData);
            return data;
        } catch (error) {
            console.error('Error uploading receipt:', error);
            throw error;
        } finally {
            setIsUploading(false);
        }
    };

    const updateReceipt = async (updatedData: ReceiptResponse): Promise<ReceiptResponse> => {
        setIsUpdating(true);
        try {
            const updatedReceipt = await updateReceiptServerAction(updatedData)
            return updatedReceipt;
        } catch (error) {
            console.error('Error updating receipt:', error);
            throw error;
        } finally {
            setIsUpdating(false);
        }
    };

    return {
        getAllReceipts,
        confirmReceipt,
        uploadReceipt,
        updateReceipt,
        isGetting,
        isConfirming,
        isUploading,
        isUpdating,
    };
}