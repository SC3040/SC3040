"use client"

import { useState, useEffect } from "react"

export type TransactionType = 'groceries' | 'transport' | 'shopping' | 'games' | 'food' | 'insurance';

export type Transaction = {
    date: string;  // Format: YYYY-MM-DD
    type: TransactionType;
    amount: number;
    desc: string;  // Detailed description of the transaction
};

export function useFetchTransactions(userID : string) {

    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [error, setError] = useState<Error | null>(null)
    const [transactions, SetTransactions] = useState<Transaction[]>(transactionsHardCode);

    useEffect(() => {
        async function fetchTransactions() {
            setIsLoading(true);
            setError(null);

            try {
                // TODO: Replace with actual API call
                // const response = await fetch(`/api/transactions/${userID}`);
                // const result = await response.json();
                // SetTransactions(result);

                await new Promise(resolve => setTimeout(resolve, 1000));
                SetTransactions(transactionsHardCode);
            } catch (error) {
                setError(error instanceof Error ? error : new Error('An unknown error occurred'));
            } finally {
                setIsLoading(false);
            }
        }

        fetchTransactions();
    }, [userID]);




    return { isLoading, error, transactions }

}

export const transactionsHardCode: Transaction[] = [
  { date: "2024-09-15", type: "games", amount: 99.99, desc: "Annual subscription to Steam+" },
  { date: "2024-09-14", type: "shopping", amount: 150.50, desc: "New running shoes from Nike" },
  { date: "2024-09-13", type: "transport", amount: 29.95, desc: "Monthly bus pass" },
  { date: "2024-09-11", type: "games", amount: 19.99, desc: "In-game purchases for Fortnite" },
  { date: "2024-09-10", type: "shopping", amount: 299.99, desc: "New smartphone case and screen protector" },
  { date: "2024-09-09", type: "food", amount: 9.99, desc: "Lunch at local cafe" },
  { date: "2024-09-08", type: "games", amount: 49.95, desc: "New release game download" },
  { date: "2024-09-07", type: "groceries", amount: 75.50, desc: "Weekly grocery shopping at Walmart" },
  { date: "2024-09-05", type: "games", amount: 14.99, desc: "Monthly subscription to Xbox Game Pass" },
  { date: "2024-09-04", type: "shopping", amount: 199.99, desc: "New winter jacket from North Face" },
  { date: "2024-09-03", type: "transport", amount: 39.95, desc: "Uber ride to airport" },
  { date: "2024-09-02", type: "games", amount: 59.99, desc: "Pre-order for upcoming RPG game" },
  { date: "2024-09-01", type: "groceries", amount: 89.99, desc: "Bulk purchase of non-perishables" },
  { date: "2024-08-30", type: "games", amount: 24.95, desc: "DLC content for favorite strategy game" },
  { date: "2024-08-29", type: "shopping", amount: 129.99, desc: "New pair of wireless earbuds" },
  { date: "2024-08-28", type: "food", amount: 19.99, desc: "Dinner delivery from local Italian restaurant" },
  { date: "2024-08-27", type: "insurance", amount: 79.99, desc: "Monthly car insurance premium" }
];