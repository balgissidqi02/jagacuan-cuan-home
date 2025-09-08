import { useState } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const weeklyData = [
  { name: "Mon", amount: 120000 },
  { name: "Tue", amount: 180000 },
  { name: "Wed", amount: 95000 },
  { name: "Thu", amount: 210000 },
  { name: "Fri", amount: 300000 },
  { name: "Sat", amount: 450000 },
  { name: "Sun", amount: 200000 },
]

const monthlyData = [
  { name: "Jan", amount: 8500000 },
  { name: "Feb", amount: 7200000 },
  { name: "Mar", amount: 9100000 },
  { name: "Apr", amount: 8800000 },
  { name: "May", amount: 12500000 },
  { name: "Jun", amount: 11200000 },
]

const dailyData = [
  { name: "1", amount: 150000 },
  { name: "5", amount: 220000 },
  { name: "10", amount: 180000 },
  { name: "15", amount: 320000 },
  { name: "20", amount: 280000 },
  { name: "25", amount: 410000 },
  { name: "30", amount: 190000 },
]

type Period = "daily" | "weekly" | "monthly"

export function ExpenseChart() {
  const [period, setPeriod] = useState<Period>("weekly")

  const getData = () => {
    switch (period) {
      case "daily":
        return dailyData
      case "weekly":
        return weeklyData
      case "monthly":
        return monthlyData
      default:
        return weeklyData
    }
  }

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-medium text-muted-foreground">Expense Trend</h4>
        <Select value={period} onValueChange={(value: Period) => setPeriod(value)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={getData()}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="name" 
              className="text-xs fill-muted-foreground"
            />
            <YAxis 
              className="text-xs fill-muted-foreground"
              tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
            />
            <Tooltip 
              formatter={(value) => [formatRupiah(value as number), "Amount"]}
              labelClassName="text-foreground"
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
              }}
            />
            <Line 
              type="monotone" 
              dataKey="amount" 
              stroke="hsl(var(--expense))" 
              strokeWidth={2}
              dot={{ fill: "hsl(var(--expense))", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: "hsl(var(--expense))", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}