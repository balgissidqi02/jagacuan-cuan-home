import { Target } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Goals() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Financial Goals</h1>
          <p className="text-muted-foreground mt-1">Set and track your financial objectives</p>
        </div>
      </div>

      <Card className="rounded-2xl shadow-soft p-12 text-center">
        <div className="text-muted-foreground">
          <Target className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">Goals Coming Soon</h3>
          <p className="text-sm">This feature is under development and will be available soon.</p>
        </div>
      </Card>
    </div>
  )
}