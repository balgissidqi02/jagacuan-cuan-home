-- Fix overly permissive SELECT policies on users table (exposes plaintext passwords)
DROP POLICY IF EXISTS "Allow read users for all" ON public.users;
DROP POLICY IF EXISTS "Allow select for all users" ON public.users;
DROP POLICY IF EXISTS "Allow insert users for all" ON public.users;

-- Fix overly permissive INSERT policies on budgeting table
DROP POLICY IF EXISTS "Allow insert budgeting for all" ON public.budgeting;
DROP POLICY IF EXISTS "Allow insert for all" ON public.budgeting;
DROP POLICY IF EXISTS "Allow read budgeting for all" ON public.budgeting;