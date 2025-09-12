-- Add period and notes columns to budgeting table
ALTER TABLE public.budgeting 
ADD COLUMN period text DEFAULT 'Monthly',
ADD COLUMN notes text;