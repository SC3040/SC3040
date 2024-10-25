"use client"

import { useAuth } from '@/hooks/AuthProvider'
import { useEffect, useState } from 'react'
import LineChartC from '@/components/charts/linechart'
import BarChartC from '@/components/charts/barchart'
import TableC from '@/components/table/TableC'
import { createColumns, ReceiptResponse } from "@/components/table/transactionCols"
import { useReceipt } from "@/hooks/useReceipt";
import AIAnalysis from '@/components/shared/AIAnalysis'
import DonutPieChart from '@/components/charts/donutpiechart'

const HomePage = () => {

    const { user } = useAuth();
    const { getAllReceipts, isGetting } = useReceipt();
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
    }, []);

    const columns = createColumns();

    return (
        <div className="flex flex-col w-full gap-4 px-1 py-4">

            <div className="w-full flex justify-center">
                <AIAnalysis />
            </div>

            <div className="flex flex-col md:flex-row gap-4 w-full">
                <div className="w-full md:w-1/2 flex-grow">
                    <LineChartC data={receiptData} />
                </div>
                <div className="w-full md:w-1/2 flex-grow">
                    <DonutPieChart data={receiptData} />
                </div>
            </div>
            
            <div className="w-full flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-1/2">
                    <BarChartC data={receiptData} />
                </div>
                <div className="w-full md:w-1/2">
                    <TableC columns={columns} data={receiptData} displayRows={5} />
                </div>
            </div>

        </div>
    )
}

export default HomePage;
