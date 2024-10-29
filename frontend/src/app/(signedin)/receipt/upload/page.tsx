"use client"

import React, { useState, useRef, ChangeEvent, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { useReceipt } from '@/hooks/useReceipt';
import { useToast } from "@/components/ui/use-toast"
import { ReceiptResponse, Category, ReceiptItem } from "@/components/table/transactionCols"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const ALLOWED_FILE_TYPES = ['image/png', 'image/jpeg', 'application/pdf'] as const;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

type AllowedFileType = typeof ALLOWED_FILE_TYPES[number];

const ReceiptImagePage: React.FC = () => {
    const { toast } = useToast()
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { uploadReceipt, confirmReceipt, isUploading, isConfirming, error } = useReceipt();
    const [formTouched, setFormTouched] = useState(false);
    const [receiptData, setReceiptData] = useState<Omit<ReceiptResponse, 'id'>>({
        merchantName: '',
        date: '',
        totalCost: '',
        category: Category.OTHERS,
        itemizedList: [],
        image: ''
    });

    useEffect(() => {
        console.log("[Upload Page.tsx] Receipt data state updated:", receiptData);
    }, [receiptData]);

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
                setReceiptData(prev => ({ 
                    ...prev, 
                    image: reader.result as string,
                    merchantName: '',
                    date: '',
                    totalCost: '',
                    category: Category.OTHERS,
                    itemizedList: []
                }));
            };
            reader.readAsDataURL(selectedFile);
            
            // Reset form touched state
            setFormTouched(false);
        }
    };


    // Helper function to parse category string into enum
    function parseCategory(category: string): Category {
        const processedCat = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
        return processedCat as Category
    }

    const handleUpload = async () => {
        setFormTouched(false);
        if (!file) {
            toast({
                variant: "destructive",
                title: "No file selected",
                description: "Please select a file to upload.",
            });
            return;
        }
        try {
            const formData = new FormData();
            formData.append('image', file);
            
            console.log("[Upload Page.tsx] Uploading receipt...");
            const data = await uploadReceipt(formData);
            console.log("[Upload Page.tsx] Received data from server:", data);
    
            // Clean up data
            const cleanedData: ReceiptResponse = {
                ...data,
                itemizedList: data.itemizedList.map(item => ({
                    ...item,
                    itemQuantity: item.itemQuantity || 1
                })),
                category: parseCategory(data.category)
            };
    
            console.log("[Upload Page.tsx] cleanedData: ", cleanedData);
    
            setReceiptData(cleanedData);
            console.log("State updated with new receipt data");
    
            // Clear the file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
    
            toast({
                title: "Receipt Data Extracted Successfully!",
            });
        } catch (err) {
            console.error("Error in uploading receipt:", err);
            toast({
                variant: "destructive",
                title: "Upload Failed",
                description: "Please try again later.",
            });
        }
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>, field: keyof Omit<ReceiptResponse, 'id' | 'category' | 'itemizedList'>) => {
        if (formTouched) {
            setReceiptData({ ...receiptData, [field]: e.target.value });
        }
    };
    
    const handleCategoryChange = (value: Category) => {
        if (formTouched) {
            setReceiptData({ ...receiptData, category: value });
        }
    };

    const handleInputFocus = () => {
        setFormTouched(true);
    };
    
    const handleItemizedListChange = (index: number, field: keyof ReceiptItem, value: string) => {
        if (formTouched) {
            const newItemizedList = [...receiptData.itemizedList];
            newItemizedList[index] = { 
                ...newItemizedList[index], 
                [field]: field === 'itemQuantity' ? parseInt(value, 10) : value 
            };
            setReceiptData({ ...receiptData, itemizedList: newItemizedList });
        }
    };

    const handleAddItem = () => {
        setReceiptData({
            ...receiptData,
            itemizedList: [...receiptData.itemizedList, { itemName: '', itemQuantity: 0, itemCost: '' }]
        });
    };

    const handleRemoveItem = (index: number) => {
        const newItemizedList = receiptData.itemizedList.filter((_, i) => i !== index);
        setReceiptData({ ...receiptData, itemizedList: newItemizedList });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const success = await confirmReceipt(receiptData as ReceiptResponse);
            if (success) {
                toast({
                    title: "Receipt Created Successfully!",
                });
                setReceiptData({
                    merchantName: '',
                    date: '',
                    totalCost: '',
                    category: Category.OTHERS,
                    itemizedList: [],
                    image: ''
                });
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
        <div className="max-w-6xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-4">Create Receipt</h1>
            
            <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Upload Receipt Image</h2>
                <Input
                    type="file"
                    accept={ALLOWED_FILE_TYPES.join(',')}
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    className="hidden"
                    id="file-upload"
                />

                {!file && (
                    <label htmlFor="file-upload" className="cursor-pointer mb-4 block hover:bg-slate-50 transition duration-150 ease-in-out">
                        <div className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
                            <div className="text-center">
                                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                <p className="mt-1 text-sm text-gray-600">Click to upload image (optional)</p>
                                <p className="text-xs text-gray-500">PNG or JPEG up to 5MB</p>
                            </div>
                        </div>
                    </label>
                )}

                {error && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertDescription>{error.message}</AlertDescription>
                    </Alert>
                )}

                {preview && (
                    <div className="mb-4">
                        <img src={preview} alt="Preview" className="max-w-full h-auto rounded-lg mb-2 border border-input" />
                        <div className="flex gap-2">
                            <label htmlFor="file-upload" className="cursor-pointer block flex-1">
                                <Button variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()}>
                                    <ImageIcon className="mr-2 h-4 w-4" />
                                    Change Image
                                </Button>
                            </label>
                            <Button onClick={handleUpload} disabled={!file || isUploading} className="flex-1">
                                {isUploading ? 'Extracting...' : 'Extract Details'}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                
                <div className="flex flex-col gap-2">
                    <Label>Merchant:</Label>
                    <Input
                        value={receiptData.merchantName}
                        onChange={(e) => handleInputChange(e, 'merchantName')}
                        onFocus={handleInputFocus}
                        placeholder="Starbucks"
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <Label>Date:</Label>
                    <Input
                        type="date"
                        value={receiptData.date}
                        onChange={(e) => handleInputChange(e, 'date')}
                        onFocus={handleInputFocus}
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <Label>Cost:</Label>
                    <Input
                        type="number"
                        value={receiptData.totalCost}
                        onChange={(e) => handleInputChange(e, 'totalCost')}
                        onFocus={handleInputFocus}
                        placeholder="Total Cost"
                        step="0.01"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <Label>Category:</Label>
                    <Select value={receiptData.category} onValueChange={handleCategoryChange}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.values(Category).map((category) => (
                                <SelectItem key={category} value={category}>
                                    {category}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>             
                
                <div className="flex flex-col gap-2">

                <Label>Items</Label>
                {receiptData.itemizedList.map((item, index) => (
                    <div key={`receiptData_i${index}`} className="space-y-2">
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
                        <Button type="button" onClick={() => handleRemoveItem(index)} variant="destructive" className="px-3 py-2">
                            Remove
                        </Button>
                    </div>
                ))}
                </div >
                <Button type="button" onClick={handleAddItem} variant="outline" className="bg-green-200 hover:bg-green-300">
                    + Item
                </Button>
                <Button type="submit" disabled={isConfirming} className="w-full">
                    {isConfirming ? 'Creating Receipt...' : 'Create Receipt'}
                </Button>
            </form>
        </div>
    );
};

export default ReceiptImagePage;