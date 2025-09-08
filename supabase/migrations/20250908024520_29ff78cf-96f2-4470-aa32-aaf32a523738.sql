-- Fix RLS policies for existing tables that don't have them
-- Enable RLS for categories table and add policies
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are viewable by everyone" 
ON public.categories 
FOR SELECT 
USING (true);

-- Enable RLS for education table and add policies  
ALTER TABLE public.education ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Education content is viewable by everyone" 
ON public.education 
FOR SELECT 
USING (true);

-- Enable RLS for reward table and add policies
ALTER TABLE public.reward ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Rewards are viewable by everyone" 
ON public.reward 
FOR SELECT 
USING (true);

-- Enable RLS for users table and add policies (though this might be custom auth)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own data" 
ON public.users 
FOR SELECT 
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own data" 
ON public.users 
FOR UPDATE 
USING (auth.uid()::text = user_id::text);