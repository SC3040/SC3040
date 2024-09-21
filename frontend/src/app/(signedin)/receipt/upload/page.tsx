"use client"

import React, { useState, useRef, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { useReceipt } from '@/hooks/useReceipt';
import { useToast } from "@/components/ui/use-toast"
import { ReceiptResponse } from '@/app/api/receipt/route';

const ALLOWED_FILE_TYPES = ['image/png', 'image/jpeg'] as const;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

type AllowedFileType = typeof ALLOWED_FILE_TYPES[number];

const ReceiptImagePage: React.FC = () => {
    const { toast } = useToast()
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { uploadReceipt, confirmReceipt, isUploading, isConfirming, error } = useReceipt();
    const [receiptData, setReceiptData] = useState<ReceiptResponse | null>(null);

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];

        if (selectedFile) {
            if (!ALLOWED_FILE_TYPES.includes(selectedFile.type as AllowedFileType)) {
                toast({
                    variant: "destructive",
                    title: "Invalid file type",
                    description: "Please upload a PNG or JPEG file.",
                });
                return;
            }

            if (selectedFile.size > MAX_FILE_SIZE) {
                toast({
                    variant: "destructive",
                    title: "File too large",
                    description: "File size should not exceed 5MB.",
                });
                return;
            }

            setFile(selectedFile);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(selectedFile);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            toast({
                variant: "destructive",
                title: "No file selected",
                description: "Please select a file to upload.",
            });
            return;
        }
        try {
            const data = await uploadReceipt(file);
            setReceiptData(data);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }

            toast({
                title: "Receipt Uploaded Successfully!",
            });
        } catch (err) {
            console.log("Error in uploading receipt:", err);
            toast({
                variant: "destructive",
                title: "Upload Failed",
                description: "Please try again later.",
            });
        }
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>, field: keyof ReceiptResponse) => {
        if (receiptData) {
            setReceiptData({ ...receiptData, [field]: e.target.value });
        }
    };

    const handleItemizedListChange = (index: number, field: keyof ReceiptResponse['itemizedList'][0], value: string) => {
        if (receiptData) {
            const newItemizedList = [...receiptData.itemizedList];
            newItemizedList[index] = { ...newItemizedList[index], [field]: value };
            setReceiptData({ ...receiptData, itemizedList: newItemizedList });
        }
    };

    const handleSubmit = async () => {
        if (!receiptData) return;

        try {
            const success = await confirmReceipt(receiptData);
            if (success) {
                toast({
                    title: "Receipt Created Successfully!",
                });
                setReceiptData(null);
                setFile(null);
                setPreview('');
            } else {
                throw new Error('Failed to create receipt');
            }
        } catch (err) {
            console.error("Error creating receipt:", err);
            toast({
                variant: "destructive",
                title: "Error Creating Receipt",
                description: "Please try again later.",
            });
        }
    };

    return (
        <div className="flex flex-col md:flex-row gap-6 max-w-6xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
            <div className="md:w-1/2">
                <h1 className="text-2xl font-bold mb-4">Upload Receipt Image</h1>

                <Input
                    type="file"
                    accept={ALLOWED_FILE_TYPES.join(',')}
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    className="hidden"
                    id="file-upload"
                />

                {!file && (
                    <label htmlFor="file-upload" className="cursor-pointer mb-4 block">
                        <div className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
                            <div className="text-center">
                                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                <p className="mt-1 text-sm text-gray-600">Click to upload image</p>
                                <p className="text-xs text-gray-500">PNG or JPEG up to 5MB</p>
                            </div>
                        </div>
                    </label>
                )}

                {error && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {preview && (
                    <div className="mb-4">
                        <img src={preview} alt="Preview" className="max-w-full h-auto rounded-lg mb-2 border border-input" />
                        <label htmlFor="file-upload" className="cursor-pointer block">
                            <Button variant="outline" className="w-full">
                                <ImageIcon className="mr-2 h-4 w-4" />
                                Change Image
                            </Button>
                        </label>
                    </div>
                )}

                <Button onClick={handleUpload} disabled={!file || isUploading} className="w-full">
                    {isUploading ? 'Uploading...' : 'Upload Receipt'}
                </Button>
            </div>

            {receiptData && (
                <div className="md:w-1/2">
                    <h2 className="text-xl font-bold mb-4">Confirm Receipt Details</h2>
                    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
                        <Input
                            value={receiptData.merchantName}
                            onChange={(e) => handleInputChange(e, 'merchantName')}
                            placeholder="Merchant Name"
                        />
                        <Input
                            type="date"
                            value={receiptData.date}
                            onChange={(e) => handleInputChange(e, 'date')}
                        />
                        <Input
                            type="number"
                            value={receiptData.totalCost}
                            onChange={(e) => handleInputChange(e, 'totalCost')}
                            placeholder="Total Cost"
                            step="0.01"
                        />
                        <Input
                            value={receiptData.category}
                            onChange={(e) => handleInputChange(e, 'category')}
                            placeholder="Category"
                        />
                        <h3 className="font-semibold">Itemized List</h3>
                        {receiptData.itemizedList.map((item, index) => (
                            <div key={index} className="space-y-2">
                                <Input
                                    value={item.itemName}
                                    onChange={(e) => handleItemizedListChange(index, 'itemName', e.target.value)}
                                    placeholder="Item Name"
                                />
                                <Input
                                    type="number"
                                    value={item.itemQuantity}
                                    onChange={(e) => handleItemizedListChange(index, 'itemQuantity', e.target.value)}
                                    placeholder="Quantity"
                                />
                                <Input
                                    type="number"
                                    value={item.itemCost}
                                    onChange={(e) => handleItemizedListChange(index, 'itemCost', e.target.value)}
                                    placeholder="Item Cost"
                                    step="0.01"
                                />
                            </div>
                        ))}
                        <Button type="submit" disabled={isConfirming} className="w-full">
                            {isConfirming ? 'Confirming...' : 'Confirm Receipt'}
                        </Button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default ReceiptImagePage;