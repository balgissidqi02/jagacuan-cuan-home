import { useEffect, useCallback, useRef } from "react"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"

const REMINDER_KEY = "jagacuan_last_reminder"
const NOTIFICATION_PERMISSION_KEY = "jagacuan_notif_permission_asked"

export function useNotifications() {
  const budgetCheckInterval = useRef<ReturnType<typeof setInterval> | null>(null)

  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) return false
    if (Notification.permission === "granted") return true
    if (Notification.permission === "denied") return false
    
    const alreadyAsked = localStorage.getItem(NOTIFICATION_PERMISSION_KEY)
    if (alreadyAsked) return false

    localStorage.setItem(NOTIFICATION_PERMISSION_KEY, "true")
    const permission = await Notification.requestPermission()
    return permission === "granted"
  }, [])

  const sendBrowserNotification = useCallback((title: string, body: string) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, {
        body,
        icon: "/favicon.ico",
        badge: "/favicon.ico",
      })
    }
  }, [])

  const checkDailyReminder = useCallback(() => {
    const lastReminder = localStorage.getItem(REMINDER_KEY)
    const today = new Date().toDateString()

    if (lastReminder !== today) {
      localStorage.setItem(REMINDER_KEY, today)
      
      // In-app toast
      toast("📊 Reminder Harian", {
        description: "Jangan lupa catat pengeluaran dan pendapatanmu hari ini di JagaCuan!",
        duration: 8000,
      })

      // Browser notification
      sendBrowserNotification(
        "📊 JagaCuan Reminder",
        "Jangan lupa catat pengeluaran dan pendapatanmu hari ini!"
      )
    }
  }, [sendBrowserNotification])

  const checkBudgetExceeded = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: budgets } = await supabase
        .from("budgeting")
        .select("category, amount, spent")
        .eq("user_id", user.id)

      if (!budgets) return

      const exceededBudgets = budgets.filter(
        (b) => (b.spent ?? 0) > b.amount && b.amount > 0
      )

      const notifiedKey = `jagacuan_budget_notified_${new Date().toDateString()}`
      const alreadyNotified = JSON.parse(localStorage.getItem(notifiedKey) || "[]") as string[]

      for (const budget of exceededBudgets) {
        if (!alreadyNotified.includes(budget.category)) {
          alreadyNotified.push(budget.category)
          localStorage.setItem(notifiedKey, JSON.stringify(alreadyNotified))

          const overAmount = (budget.spent ?? 0) - budget.amount
          const message = `Budget "${budget.category}" sudah melebihi batas! Over sebesar Rp ${overAmount.toLocaleString("id-ID")}`

          // In-app toast
          toast.warning("⚠️ Budget Exceeded!", {
            description: message,
            duration: 10000,
          })

          // Browser notification
          sendBrowserNotification("⚠️ Budget Exceeded!", message)
        }
      }
    } catch (error) {
      console.error("Error checking budget:", error)
    }
  }, [sendBrowserNotification])

  useEffect(() => {
    requestPermission()
    
    // Small delay so app loads first
    const timer = setTimeout(() => {
      checkDailyReminder()
      checkBudgetExceeded()
    }, 2000)

    // Check budget every 5 minutes
    budgetCheckInterval.current = setInterval(checkBudgetExceeded, 5 * 60 * 1000)

    return () => {
      clearTimeout(timer)
      if (budgetCheckInterval.current) clearInterval(budgetCheckInterval.current)
    }
  }, [requestPermission, checkDailyReminder, checkBudgetExceeded])

  return { checkBudgetExceeded, sendBrowserNotification }
}
