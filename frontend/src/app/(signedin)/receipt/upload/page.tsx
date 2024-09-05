"use client"

import React, { useState, useRef, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload } from 'lucide-react';
import { useUploadReceipt } from '@/hooks/useUploadReceipt';
import { useToast } from "@/components/ui/use-toast"

const ALLOWED_FILE_TYPES = ['image/png', 'image/jpeg'] as const;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

type AllowedFileType = typeof ALLOWED_FILE_TYPES[number];

const ReceiptImagePage: React.FC = () => {

    const { toast } = useToast()
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState<string>('');
    const [preview, setPreview] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { uploadReceipt, isUploading, error: uploadError } = useUploadReceipt(); // Use the custom hook

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        setError('');

        if (selectedFile) {
            if (!ALLOWED_FILE_TYPES.includes(selectedFile.type as AllowedFileType)) {
                setError('Please upload a PNG or JPEG file.');
                return;
            }

            if (selectedFile.size > MAX_FILE_SIZE) {
                setError('File size should not exceed 5MB.');
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
            setError('Please select a file to upload.');
            return;
        }
        try {
            await uploadReceipt(file);
            // Reset the form after successful upload
            setFile(null);
            setPreview('');
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }

            toast({
                title: "Receipt Uploaded Successfuly!",
              })
        } catch (err) {
            toast({
                variant: "destructive",
                title: "Uh oh! Something went wrong!",
                description: "Try again later...",
              })
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-4">Upload Receipt Image</h1>

            <div className="mb-4">
                <Input
                    type="file"
                    accept={ALLOWED_FILE_TYPES.join(',')}
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    className="hidden"
                    id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                    <div className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
                        <div className="text-center">
                            <Upload className="mx-auto h-12 w-12 text-gray-400" />
                            <p className="mt-1 text-sm text-gray-600">Click to upload or drag and drop</p>
                            <p className="text-xs text-gray-500">PNG or JPEG up to 5MB</p>
                        </div>
                    </div>
                </label>
            </div>

            {(error || uploadError) && (
                <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{error || uploadError}</AlertDescription>
                </Alert>
            )}

            {preview && (
                <div className="mb-4">
                    <img src={preview} alt="Preview" className="max-w-full h-auto rounded-lg" />
                </div>
            )}

            <Button onClick={handleUpload} disabled={!file || isUploading} className="w-full">
                {isUploading ? 'Uploading...' : 'Upload Receipt'}
            </Button>
        </div>
    );
};

export default ReceiptImagePage;