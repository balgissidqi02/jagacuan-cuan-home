-- Update budgeting table to match requirements
DROP TABLE IF EXISTS public.budgeting CASCADE;
CREATE TABLE public.budgeting (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  spent NUMERIC NOT NULL DEFAULT 0,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Update spending_tracker table to match requirements  
DROP TABLE IF EXISTS public.spending_tracker CASCADE;
CREATE TABLE public.spending_tracker (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  budget_id UUID REFERENCES public.budgeting(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.budgeting ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spending_tracker ENABLE ROW LEVEL SECURITY;

-- RLS policies for budgeting
CREATE POLICY "Users can view their own budgeting" ON public.budgeting
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own budgeting" ON public.budgeting
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own budgeting" ON public.budgeting
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own budgeting" ON public.budgeting
FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for spending_tracker
CREATE POLICY "Users can view their spending via budget" ON public.spending_tracker
FOR SELECT USING (
  budget_id IN (
    SELECT id FROM public.budgeting WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert spending via budget" ON public.spending_tracker
FOR INSERT WITH CHECK (
  budget_id IN (
    SELECT id FROM public.budgeting WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update spending via budget" ON public.spending_tracker
FOR UPDATE USING (
  budget_id IN (
    SELECT id FROM public.budgeting WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete spending via budget" ON public.spending_tracker
FOR DELETE USING (
  budget_id IN (
    SELECT id FROM public.budgeting WHERE user_id = auth.uid()
  )
);

-- Function to update budget spent amount
CREATE OR REPLACE FUNCTION update_budget_spent()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.budgeting 
    SET spent = spent + NEW.amount,
        updated_at = now()
    WHERE id = NEW.budget_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.budgeting 
    SET spent = spent - OLD.amount,
        updated_at = now()
    WHERE id = OLD.budget_id;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE public.budgeting 
    SET spent = spent - OLD.amount + NEW.amount,
        updated_at = now()
    WHERE id = NEW.budget_id;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update spent amount
CREATE TRIGGER update_budget_spent_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.spending_tracker
  FOR EACH ROW EXECUTE FUNCTION update_budget_spent();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.budgeting;
ALTER PUBLICATION supabase_realtime ADD TABLE public.spending_tracker;