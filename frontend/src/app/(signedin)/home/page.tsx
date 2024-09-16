"use client"

import { useAuth } from '@/hooks/AuthProvider'
import LineChartC from '@/components/charts/linechart'
import BarChartC from '@/components/charts/barchart'
import DataTable from "@/components/table/TransactionTable";
import { columns } from "@/components/table/transactionCols"
import { useFetchTransactions } from "@/hooks/useFetchTransactions";

const HomePage = () => {

    const { user } = useAuth();

    // TODO: add userID
    const userID : string = "HARDCODE"
    const { isLoading, error, transactions } = useFetchTransactions(userID);

    return (
        <div className="flex_col_center w-full gap-4">

            <div className="flex justify-between items-center w-1/2">
                <p>User ID: {user?.id}</p>
                <p>User email: {user?.email}</p>
            </div>

            <div className="w-full">
                <LineChartC/>
            </div>

            <div className="w-full flex gap-4">
                <div className="w-1/2">
                    <BarChartC/>
                </div>
                <div className="w-1/2">
                    <DataTable columns={columns} data={transactions}/>
                </div>
            </div>
        </div>
    )
}

export default HomePage;