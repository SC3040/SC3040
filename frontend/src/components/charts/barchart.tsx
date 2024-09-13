"use client"

import React from "react"
import { TrendingUp, TrendingDown } from "lucide-react"
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer, TooltipProps } from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
} from "@/components/ui/chart"

export const description = "A horizontal bar chart showing monthly transactions"

interface TransactionData {
    month: string;
    transactions: number;
    amount: number;
}

const chartData: TransactionData[] = [
    { month: "January", transactions: 186, amount: 5580 },
    { month: "February", transactions: 305, amount: 9150 },
    { month: "March", transactions: 237, amount: 7110 },
    { month: "April", transactions: 173, amount: 5190 },
    { month: "May", transactions: 209, amount: 6270 },
    { month: "June", transactions: 214, amount: 6420 },
]

const chartConfig = {
    transactions: {
        label: "Transactions",
        color: "hsl(var(--chart-1))",
    },
} satisfies ChartConfig

export default function MonthlyTransactionsChart(): React.ReactElement {
    const totalTransactions = chartData.reduce((sum, item) => sum + item.transactions, 0)
    const totalAmount = chartData.reduce((sum, item) => sum + item.amount, 0)
    const lastMonthTransactions = chartData[chartData.length - 1].transactions
    const previousMonthTransactions = chartData[chartData.length - 2].transactions
    const percentageChange = ((lastMonthTransactions - previousMonthTransactions) / previousMonthTransactions) * 100

    return (
        <Card className="bg-transparent">
            <CardHeader>
                <CardTitle>Monthly Transactions</CardTitle>
                <CardDescription>January - June 2024</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Transactions</p>
                        <p className="text-2xl font-bold">{totalTransactions.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                        <p className="text-2xl font-bold">${totalAmount.toLocaleString()}</p>
                    </div>
                </div>
                <ChartContainer config={chartConfig}>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                            data={chartData}
                            layout="vertical"
                            margin={{
                                left: -20,
                            }}
                        >
                            <XAxis type="number" hide />
                            <YAxis
                                dataKey="month"
                                type="category"
                                tickLine={false}
                                tickMargin={10}
                                axisLine={false}
                                tickFormatter={(value: string) => value.slice(0, 3)}
                            />
                            <ChartTooltip
                                cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }}
                                content={<CustomTooltip />}
                            />
                            <Bar dataKey="transactions" fill="var(--color-transactions)" radius={[0, 5, 5, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 text-sm">
                <div className="flex items-center gap-2 font-medium leading-none">
                    {percentageChange >= 0 ? (
                        <>
                            Trending up by {percentageChange.toFixed(1)}% this month
                            <TrendingUp className="h-4 w-4 text-green-500" />
                        </>
                    ) : (
                        <>
                            Trending down by {Math.abs(percentageChange).toFixed(1)}% this month
                            <TrendingDown className="h-4 w-4 text-red-500" />
                        </>
                    )}
                </div>
                <div className="leading-none text-muted-foreground">
                    Showing total transactions for the last 6 months
                </div>
            </CardFooter>
        </Card>
    )
}

interface CustomTooltipProps extends TooltipProps<number, string> {
    active?: boolean;
    payload?: Array<{
        value: number;
        payload: TransactionData;
    }>;
    label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-background p-2 shadow-md rounded-md border">
                <p className="font-bold">{label}</p>
                <p>Transactions: {payload[0].value}</p>
                <p>Amount: ${payload[0].payload.amount.toLocaleString()}</p>
            </div>
        );
    }
    return null;
};