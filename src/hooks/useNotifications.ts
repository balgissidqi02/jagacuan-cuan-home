import { useEffect, useCallback, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"

const REMINDER_KEY = "jagacuan_last_reminder"
const NOTIFICATION_PERMISSION_KEY = "jagacuan_notif_permission_asked"

export function useNotifications() {
  const budgetCheckInterval = useRef<ReturnType<typeof setInterval> | null>(null)
  const navigate = useNavigate()

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

  const sendBrowserNotification = useCallback((title: string, body: string, onClick?: () => void) => {
    if ("Notification" in window && Notification.permission === "granted") {
      const notif = new Notification(title, {
        body,
        icon: "/favicon.ico",
        badge: "/favicon.ico",
      })
      if (onClick) {
        notif.onclick = () => {
          window.focus()
          onClick()
          notif.close()
        }
      }
    }
  }, [])

  const checkDailyReminder = useCallback(() => {
    const lastReminder = localStorage.getItem(REMINDER_KEY)
    const today = new Date().toDateString()

    if (lastReminder !== today) {
      localStorage.setItem(REMINDER_KEY, today)
      
      toast("📊 Reminder Harian", {
        description: "Jangan lupa catat pengeluaran dan pendapatanmu hari ini di JagaCuan!",
        duration: 8000,
        action: {
          label: "Catat Sekarang",
          onClick: () => navigate("/spending"),
        },
      })

      sendBrowserNotification(
        "📊 JagaCuan Reminder",
        "Jangan lupa catat pengeluaran dan pendapatanmu hari ini!",
        () => navigate("/spending")
      )
    }
  }, [sendBrowserNotification, navigate])

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

          toast.warning("⚠️ Budget Exceeded!", {
            description: message,
            duration: 10000,
            action: {
              label: "Lihat Budget",
              onClick: () => navigate("/budgeting"),
            },
          })

          sendBrowserNotification("⚠️ Budget Exceeded!", message, () => navigate("/budgeting"))
        }
      }
    } catch (error) {
      console.error("Error checking budget:", error)
    }
  }, [sendBrowserNotification, navigate])

  useEffect(() => {
    requestPermission()
    
    const timer = setTimeout(() => {
      checkDailyReminder()
      checkBudgetExceeded()
    }, 2000)

    budgetCheckInterval.current = setInterval(checkBudgetExceeded, 5 * 60 * 1000)

    return () => {
      clearTimeout(timer)
      if (budgetCheckInterval.current) clearInterval(budgetCheckInterval.current)
    }
  }, [requestPermission, checkDailyReminder, checkBudgetExceeded])

  return { checkBudgetExceeded, sendBrowserNotification }
}
