-- Remove the problematic function and all its dependencies with CASCADE
DROP FUNCTION IF EXISTS update_budget_after_spending() CASCADE;