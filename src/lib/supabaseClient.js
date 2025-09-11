import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jhikrcoimgaqbclhoqap.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoaWtyY29pbWdhcWJjbGhvcWFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3ODkwODMsImV4cCI6MjA3MjM2NTA4M30.YuD6yDMD_lU45zu2LEK4gAA19cDG4VIShq6JGkyx6_c'

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
})