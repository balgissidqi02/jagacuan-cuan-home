import { GraduationCap } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Education() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Financial Education</h1>
          <p className="text-muted-foreground mt-1">Learn about personal finance and money management</p>
        </div>
      </div>

      <Card className="rounded-2xl shadow-soft p-12 text-center">
        <div className="text-muted-foreground">
          <GraduationCap className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">Education Coming Soon</h3>
          <p className="text-sm">This feature is under development and will be available soon.</p>
        </div>
      </Card>
    </div>
  )
}