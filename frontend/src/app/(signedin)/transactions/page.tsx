"use client"

import DataTable from "@/components/table/TransactionTable"
import { columns } from "@/components/table/transactionCols"
import { useEffect, useState } from 'react'
import { useReceipt } from "@/hooks/useReceipt";
import { ReceiptResponse } from "@/app/api/receipt/route";

export default function TransactionHomePage() {

    const { getAllReceipts, isGetting} = useReceipt();
    const [receiptData, setReceiptData] = useState<ReceiptResponse[]>([])
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


    return (
        <div className="flex min-h-screen flex-col items-center justify-start">
            <h1>Transactions</h1>

            <div>
                {receiptData.map((receipt, i)=>{
                    return (
                        <p key={`${receipt.id}`}>{receipt.merchantName}</p>
                    )
                })}
            </div>

            {/* <DataTable columns={columns} data={transactions}/> */}

        </div>
    )
}