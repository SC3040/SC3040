import React, { useState, useMemo } from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

export const description = "A monthly summary spending chart";

const chartData = [
    { month: "Jan", year: 2024, groceries: 500, utilities: 200, entertainment: 150 },
    { month: "Feb", year: 2024, groceries: 480, utilities: 220, entertainment: 180 },
    { month: "Mar", year: 2024, groceries: 520, utilities: 190, entertainment: 200 },
    { month: "Apr", year: 2024, groceries: 490, utilities: 210, entertainment: 170 },
    { month: "May", year: 2024, groceries: 510, utilities: 200, entertainment: 190 },
    { month: "Jun", year: 2024, groceries: 530, utilities: 230, entertainment: 160 },
    { month: "Jul", year: 2024, groceries: 550, utilities: 240, entertainment: 220 },
    { month: "Aug", year: 2024, groceries: 540, utilities: 250, entertainment: 200 },
    { month: "Sep", year: 2024, groceries: 500, utilities: 220, entertainment: 180 },
    { month: "Oct", year: 2024, groceries: 520, utilities: 210, entertainment: 190 },
    { month: "Nov", year: 2024, groceries: 510, utilities: 230, entertainment: 170 },
    { month: "Dec", year: 2024, groceries: 570, utilities: 260, entertainment: 250 },
];

const chartConfig = {
    spending: {
        label: "Total Spending",
        color: "hsl(var(--chart-5))",
    },
    groceries: {
        label: "Groceries",
        color: "hsl(var(--chart-1))",
    },
    utilities: {
        label: "Utilities",
        color: "hsl(var(--chart-2))",
    },
    entertainment: {
        label: "Entertainment",
        color: "hsl(var(--chart-3))",
    },
} satisfies ChartConfig;

export default function MonthlySummarySpendingChart() {
    const [activeCategory, setActiveCategory] = useState<keyof typeof chartConfig>("groceries");

    const totalSpending = useMemo(() => ({
        groceries: chartData.reduce((acc, curr) => acc + curr.groceries, 0),
        utilities: chartData.reduce((acc, curr) => acc + curr.utilities, 0),
        entertainment: chartData.reduce((acc, curr) => acc + curr.entertainment, 0),
    }), []);

    const grandTotal = useMemo(() =>
            Object.values(totalSpending).reduce((acc, curr) => acc + curr, 0)
        , [totalSpending]);

    return (
        <Card className="w-full bg-transparent">
            <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
                <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
                    <CardTitle>Monthly Spending Summary</CardTitle>
                    <CardDescription>
                        Showing spending trends for the last 12 months
                    </CardDescription>
                </div>
                <div className="flex">
                    {(Object.keys(chartConfig) as Array<keyof typeof chartConfig>).filter(key => key !== "spending").map((category) => (
                        <button
                            key={category}
                            data-active={activeCategory === category}
                            className="flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6"
                            onClick={() => setActiveCategory(category)}
                        >
              <span className="text-xs text-muted-foreground">
                {chartConfig[category].label}
              </span>
                            <span className="text-lg font-bold leading-none sm:text-3xl">
                ${totalSpending[category as keyof typeof totalSpending].toLocaleString()}
              </span>
                        </button>
                    ))}
                </div>
            </CardHeader>
            <CardContent className="px-2 sm:p-6">
                <div className="mb-4 flex items-center justify-between">
                    <span className="text-sm font-medium">Total Spending</span>
                    <span className="text-2xl font-bold">${grandTotal.toLocaleString()}</span>
                </div>
                <ChartContainer
                    config={chartConfig}
                    className="aspect-auto h-[350px] w-full"
                >
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={chartData}
                            margin={{
                                top: 5,
                                right: 30,
                                left: 20,
                                bottom: 5,
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="month"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                            />
                            <YAxis
                                tickFormatter={(value) => `$${value}`}
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                            />
                            <ChartTooltip
                                content={
                                    <ChartTooltipContent
                                        className="w-[200px]"
                                        nameKey="spending"
                                        labelFormatter={(value) => `${value} ${chartData[0].year}`}
                                    />
                                }
                            />
                            <Line
                                type="monotone"
                                dataKey={activeCategory}
                                stroke={chartConfig[activeCategory].color}
                                strokeWidth={3}
                                dot={{ r: 4 }}
                                activeDot={{ r: 8 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}