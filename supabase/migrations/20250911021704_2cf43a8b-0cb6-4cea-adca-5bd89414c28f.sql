-- Fix function search path security issues
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
begin
  insert into public.profiles (id, name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email,'@',1)),
    'user'
  ) on conflict (id) do nothing;
  return new;
end;
$function$;

CREATE OR REPLACE FUNCTION public.set_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
begin
  new.updated_at = now();
  return new;
end;
$function$;

CREATE OR REPLACE FUNCTION update_budget_spent()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path = public
AS $$
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
$$;