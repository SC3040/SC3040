"use client"

import React, { useMemo } from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ReceiptResponse } from "@/app/api/receipt/route";

interface ChartDataPoint {
  monthYear: string;
  totalSpent: number;
}

interface LineChartCProps {
  data: ReceiptResponse[];
}

export default function LineChartC({ data }: LineChartCProps): JSX.Element {
  const chartData: ChartDataPoint[] = useMemo(() => {
    const groupedData: { [key: string]: ChartDataPoint } = data.reduce((acc, receipt) => {
      const date = new Date(receipt.date);
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
      if (!acc[monthYear]) {
        acc[monthYear] = { monthYear, totalSpent: 0 };
      }
      acc[monthYear].totalSpent += parseFloat(receipt.totalCost);
      return acc;
    }, {} as { [key: string]: ChartDataPoint });

    return Object.values(groupedData).sort((a, b) => 
      new Date(a.monthYear).getTime() - new Date(b.monthYear).getTime()
    );
  }, [data]);

  return (
    <Card className="w-full bg-transparent">
      <CardHeader>
        <CardTitle>Monthly Spending Trend</CardTitle>
        <CardDescription>Total spending by month</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="monthYear" />
            <YAxis tickFormatter={(value: number) => `$${value.toFixed(0)}`} />
            <Tooltip 
              formatter={(value: number) => `$${value.toFixed(2)}`} 
              labelFormatter={(label: string) => `Month: ${label}`}
            />
            <Line type="monotone" dataKey="totalSpent" stroke="#8884d8" activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}