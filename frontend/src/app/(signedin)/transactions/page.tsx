"use client"
import { ColumnDef } from "@tanstack/react-table"
import DataTable from "@/components/table/TransactionTable"
import { columns } from "@/components/table/transactionCols"
import { useEffect, useState } from 'react'
import { useReceipt } from "@/hooks/useReceipt";
import { ReceiptResponse } from "@/app/api/receipt/route";
import { EditReceiptPopup } from "@/components/shared/EditReceiptPopup";

export default function TransactionHomePage() {
    const { getAllReceipts, updateReceipt, isGetting } = useReceipt();
    const [receiptData, setReceiptData] = useState<ReceiptResponse[]>([]);
    const [editingReceipt, setEditingReceipt] = useState<ReceiptResponse | null>(null);

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

    const handleEditReceipt = (receipt: ReceiptResponse) => {
        setEditingReceipt(receipt);
    };

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
        } catch (error) {
            console.error("Error updating receipt:", error);
        }
    };

    const updatedColumns : ColumnDef<ReceiptResponse>[]= [
        ...columns,
        {
            id: "edit",
            cell: ({ row }) => (
                <button onClick={() => handleEditReceipt(row.original)}>Edit</button>
            ),
        },
    ];

    return (
        <div className="flex min-h-screen flex-col items-center justify-start">
            <h1>Transactions</h1>

            <DataTable columns={updatedColumns} data={receiptData} />

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