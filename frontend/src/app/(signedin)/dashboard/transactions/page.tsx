"use client"

import DataTable from "@/components/table/TransactionTable"
import { columns } from "@/components/table/transactionCols"

import { useFetchTransactions } from "@/hooks/useFetchTransactions";

export default function TransactionHomePage() {

    // TODO: add userID
    const userID : string = "HARDCODE"
    const { isLoading, error, transactions } = useFetchTransactions(userID);

    return (
        <div className="flex min-h-screen flex-col items-center justify-start">
            <h1>Transactions</h1>

            <DataTable columns={columns} data={transactions}/>

        </div>
    )
}