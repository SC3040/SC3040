"use client"
import { useEffect, useState, useCallback } from 'react'
import DataTable from "@/components/table/TransactionTable"
import { createColumns, ReceiptResponse } from "@/components/table/transactionCols"
import { useReceipt } from "@/hooks/useReceipt";
import { EditReceiptPopup } from "@/components/shared/EditReceiptPopup";

export default function TransactionHomePage() {
    const { getAllReceipts, updateReceipt, isGetting } = useReceipt();
    const [receiptData, setReceiptData] = useState<ReceiptResponse[]>([]);
    const [editingReceipt, setEditingReceipt] = useState<ReceiptResponse | null>(null);

    const handleEditReceipt = useCallback((receipt: ReceiptResponse) => {
        setEditingReceipt(receipt);
    }, []);

    const columns = createColumns(handleEditReceipt);

    useEffect(() => {
        const fetchReceipts = async () => {
            try {
                const data = await getAllReceipts()
                setReceiptData(data)
            } catch (error) {
                console.error("Error fetching receipts:", error)
            }
        }
        fetchReceipts()
    }, []) 

    const handleCloseEditPopup = () => {
        setEditingReceipt(null);
    };

    const handleSaveReceipt = async (updatedReceipt: ReceiptResponse) => {
        try {
            await updateReceipt(updatedReceipt);
            
            setReceiptData(prevData =>
                prevData.map(receipt =>
                    receipt.id === updatedReceipt.id ? updatedReceipt : receipt
                )
            );
            handleCloseEditPopup();
        } catch (error) {
            console.error("Error updating receipt:", error);
        }
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-start">
            <h1 className="text-2xl font-semibold leading-none tracking-tight">Your Transactions</h1>

            <DataTable columns={columns} data={receiptData} displayRows={10}/>

            {editingReceipt && (
                <EditReceiptPopup
                    receipt={editingReceipt}
                    isOpen={!!editingReceipt}
                    onClose={handleCloseEditPopup}
                    onSave={handleSaveReceipt}
                />
            )}
        </div>
    )
}