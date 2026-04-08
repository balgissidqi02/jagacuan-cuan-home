CREATE OR REPLACE FUNCTION public.update_budget_spent()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.budgeting 
    SET spent = COALESCE(spent, 0) + NEW.amount,
        updated_at = now()
    WHERE id = NEW.budget_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.budgeting 
    SET spent = GREATEST(COALESCE(spent, 0) - OLD.amount, 0),
        updated_at = now()
    WHERE id = OLD.budget_id;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE public.budgeting 
    SET spent = COALESCE(spent, 0) - COALESCE(OLD.amount, 0) + NEW.amount,
        updated_at = now()
    WHERE id = NEW.budget_id;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$function$;