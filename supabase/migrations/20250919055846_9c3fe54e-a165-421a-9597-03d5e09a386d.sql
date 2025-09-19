-- Remove the problematic trigger that's causing UPDATE errors
DROP TRIGGER IF EXISTS update_budget_trigger ON spending_tracker;

-- Remove the function that requires WHERE clause
DROP FUNCTION IF EXISTS update_budget_after_spending();

-- Also remove any other triggers on spending_tracker that might interfere
DROP TRIGGER IF EXISTS update_budget_spent_trigger ON spending_tracker;