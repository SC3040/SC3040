"use client"

import React, { useMemo } from "react";
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ReceiptResponse } from "@/components/table/transactionCols";

interface ChartDataPoint {
  category: string;
  total: number;
}

interface BarChartCProps {
  data: ReceiptResponse[];
}

export default function BarChartC({ data }: BarChartCProps): JSX.Element {
  const chartData: ChartDataPoint[] = useMemo(() => {
    const categoryTotals: { [key: string]: number } = data.reduce((acc, receipt) => {
      if (!acc[receipt.category]) {
        acc[receipt.category] = 0;
      }
      acc[receipt.category] += parseFloat(receipt.totalCost);
      return acc;
    }, {} as { [key: string]: number });

    return Object.entries(categoryTotals).map(([category, total]) => ({
      category,
      total,
    }));
  }, [data]);

  return (
    <Card className="w-full bg-transparent border-slate-200 border-2">
      <CardHeader>
        <CardTitle>Spending by Category</CardTitle>
        <CardDescription>Total spending by category</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <XAxis dataKey="category" />
            <YAxis tickFormatter={(value: number) => `$${value.toFixed(0)}`} />
            <Tooltip 
              formatter={(value: number) => `$${value.toFixed(2)}`}
              labelFormatter={(label: string) => `Category: ${label}`}
            />
            <Bar dataKey="total" fill="#89ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}