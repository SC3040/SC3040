"use client"

import { useAuth } from '@/hooks/AuthProvider'
import { useEffect, useState } from 'react'
import LineChartC from '@/components/charts/linechart'
import BarChartC from '@/components/charts/barchart'
import DataTable from "@/components/table/TransactionTable";
import { columns } from "@/components/table/transactionCols"
import { useReceipt } from "@/hooks/useReceipt";
import { ReceiptResponse } from "@/app/api/receipt/route";

const HomePage = () => {

    const { user } = useAuth();

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
        <div className="flex_col_center w-full gap-4">

            <div className="flex justify-between items-center w-1/2">
                <p>User ID: {user?.id}</p>
                <p>User email: {user?.email}</p>
            </div>

            <div className="w-full">
                <LineChartC data={receiptData}/>
            </div>

            <div className="w-full flex gap-4">
                <div className="w-1/2">
                    <BarChartC data={receiptData}/>
                </div>
                <div className="w-1/2">
                    <DataTable columns={columns} data={receiptData}/>
                </div>
            </div>
        </div>
    )
}

export default HomePage;