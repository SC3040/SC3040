'use server'

import { cookies } from 'next/headers'

type ReceiptItem = {
    itemName: string;
    itemQuantity: number;
    itemCost: number;
}

export type ReceiptResponse = {
    merchantName: string;
    date: string;
    totalCost: number;
    category: string;
    itemizedList: ReceiptItem[];
    image: string;
}


// Helper function to safely log FormData contents
function logFormData(formData: FormData) {
    const formDataEntries = Array.from(formData.entries());
    return formDataEntries.map(([key, value]) => {
        if (value instanceof File) {
            return `${key}: File(name: ${value.name}, type: ${value.type}, size: ${value.size})`;
        }
        return `${key}: ${value}`;
    }).join(', ');
}

export async function uploadReceiptServerAction(formData: FormData): Promise<ReceiptResponse> {
    const token = cookies().get('jwt')?.value;

    if (!token) {
        console.error('[uploadReceiptServerAction] No JWT token found in cookies');
        throw new Error('Not authorized. JWT cookie missing or invalid.');
    }

    try {
        console.log(`[uploadReceiptServerAction] POST to ${process.env.BACKEND_URL}`);
        
        // Log the token (be careful with this in production)
        console.log('[uploadReceiptServerAction] JWT Token:', token);

        // Prepare headers
        const headers = {
            'Cookie': `jwt=${token}`,
        };

        const response = await fetch(`${process.env.BACKEND_URL}/api/receipts/process`, {
            method: 'POST',
            headers: headers,
            body: formData,
            credentials: 'include',
        });

        // Log request details
        console.log('[uploadReceiptServerAction] Request details:');
        console.log('URL:', `${process.env.BACKEND_URL}/api/receipts/process`);
        console.log('Method: POST');
        console.log('Headers:', JSON.stringify(headers, null, 2));
        console.log('FormData contents:', logFormData(formData));
        
        // Log response details
        console.log('[uploadReceiptServerAction] Response details:');
        console.log('Status:', response.status);
        console.log('StatusText:', response.statusText);
        console.log('Headers:', JSON.stringify(Object.fromEntries(response.headers), null, 2));

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[uploadReceiptServerAction] Error response body: ${errorText}`);
            throw new Error(`Failed to upload image: ${errorText}`);
        }

        const data: ReceiptResponse = await response.json();
        console.log("[uploadReceiptServerAction] Received data:", JSON.stringify(data, null, 2));

        return data;
    } catch (err) {
        console.error('Error uploading receipt:', err);
        throw err;
    }
}
