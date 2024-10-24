'use client';

import * as React from "react";
import { Pie, PieChart, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ReceiptResponse } from "@/components/table/transactionCols";
import moment from "moment";

const generateMonthOptions = () => {
  const months = [];
  const now = moment();

  for (let i = 0; i < 12; i++) {
    months.push(now.format('MMMM YYYY')); 
    now.subtract(1, 'month');
  }

  return months;
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#FF6347', '#8A2BE2', '#D2691E'];

interface DonutPieChartProps {
  data: ReceiptResponse[];
}

export default function DonutPieChart({ data }: DonutPieChartProps) {
  const [timeFilter, setTimeFilter] = React.useState<string>('6m');
  const [filteredData, setFilteredData] = React.useState<ReceiptResponse[]>(data);
  const [chartSize, setChartSize] = React.useState({ innerRadius: 80, outerRadius: 120, labelPosition: 'inside' });

  React.useEffect(() => {
    const now = moment();
    let filteredReceipts: ReceiptResponse[];

    if (timeFilter === '6m') {
      filteredReceipts = data.filter(receipt => moment(receipt.date).isAfter(now.clone().subtract(6, 'months')));
    } else if (timeFilter === '3m') {
      filteredReceipts = data.filter(receipt => moment(receipt.date).isAfter(now.clone().subtract(3, 'months')));
    } else if (timeFilter === '2m') {
      filteredReceipts = data.filter(receipt => moment(receipt.date).isAfter(now.clone().subtract(2, 'months')));
    } else {
      const [monthName, year] = timeFilter.split(' ');
      filteredReceipts = data.filter(receipt => {
        const receiptDate = moment(receipt.date);
        return receiptDate.format('MMMM') === monthName && receiptDate.format('YYYY') === year;
      });
    }

    setFilteredData(filteredReceipts);
  }, [timeFilter, data]);

  const chartData = React.useMemo(() => {
    const categoryTotals: { [key: string]: number } = filteredData.reduce((acc, receipt) => {
      if (!acc[receipt.category]) {
        acc[receipt.category] = 0;
      }
      acc[receipt.category] += parseFloat(receipt.totalCost);
      return acc;
    }, {} as { [key: string]: number });

    const totalSpending = Object.values(categoryTotals).reduce((sum, total) => sum + total, 0);

    return Object.entries(categoryTotals).map(([category, total]) => ({
      category,
      total,
      percentage: ((total / totalSpending) * 100).toFixed(2), 
    }));
  }, [filteredData]);

  const monthOptions = generateMonthOptions();

  const totalSpending = chartData.reduce((sum, item) => sum + item.total, 0);

  React.useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width <= 480) {
        // Mobile: Use smaller radii and move labels outside the pie
        setChartSize({ innerRadius: 30, outerRadius: 60, labelPosition: 'inside' });
      } else if (width <= 768) {
        // Tablet: Adjust for medium screens
        setChartSize({ innerRadius: 40, outerRadius: 80, labelPosition: 'inside' });
      } else {
        // Desktop: Larger pie with inside labels
        setChartSize({ innerRadius: 80, outerRadius: 120, labelPosition: 'inside' });
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); 

    return () => window.removeEventListener('resize', handleResize); 
  }, []);

  return (
    <Card className="flex flex-col w-full bg-transparent border-slate-200 border-2">
      <CardHeader className="items-center pb-0">
        <CardTitle>Spending Breakdown by Category for {timeFilter === '6m'
          ? 'Past 6 Months'
          : timeFilter === '3m'
            ? 'Past 3 Months'
            : timeFilter === '2m'
              ? 'Past 2 Months'
              : timeFilter}</CardTitle>

      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <div className="flex justify-start mb-4">
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="border border-gray-300 rounded p-2"
          >
            <option value="6m">Past 6 Months</option>
            <option value="3m">Past 3 Months</option>
            <option value="2m">Past 2 Months</option>
            {monthOptions.map((month, index) => (
              <option key={index} value={month}>
                {month}
              </option>
            ))}
          </select>
        </div>
        <div className="mx-auto max-w-full">
          {chartData.length === 0 ? (
            <div className="text-center text-gray-500">No data available for the selected period</div>
          ) : (
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="total"
                  nameKey="category"
                  innerRadius={chartSize.innerRadius}
                  outerRadius={chartSize.outerRadius}
                  fill="#8884d8"
                  label={({ category, percentage }) =>
                    chartSize.labelPosition === 'outside'
                      ? `${category}: ${percentage}%`
                      : `${category}: ${percentage}%`
                  }
                  labelLine={chartSize.labelPosition === 'outside'}
                >
                  {chartData?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          Total Spending: ${totalSpending.toFixed(2)}
        </div>

      </CardFooter>
    </Card>
  );
}
