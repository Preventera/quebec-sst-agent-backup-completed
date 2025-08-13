-- Fix company data security issues
-- Step 1: Add company_id to profiles table to establish company ownership
ALTER TABLE public.profiles ADD COLUMN company_id UUID DEFAULT gen_random_uuid();

-- Step 2: Create a security definer function to get user's company_id
CREATE OR REPLACE FUNCTION public.get_user_company_id()
RETURNS UUID AS $$
  SELECT company_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Step 3: Update RLS policies for risk_inventory
DROP POLICY IF EXISTS "Users can view risk inventory" ON public.risk_inventory;
CREATE POLICY "Users can view their company risk inventory" 
ON public.risk_inventory 
FOR SELECT 
USING (company_id = public.get_user_company_id());

DROP POLICY IF EXISTS "Users can insert risk inventory" ON public.risk_inventory;
CREATE POLICY "Users can insert their company risk inventory" 
ON public.risk_inventory 
FOR INSERT 
WITH CHECK (company_id = public.get_user_company_id());

DROP POLICY IF EXISTS "Users can update risk inventory" ON public.risk_inventory;
CREATE POLICY "Users can update their company risk inventory" 
ON public.risk_inventory 
FOR UPDATE 
USING (company_id = public.get_user_company_id());

-- Step 4: Update RLS policies for diagnostic_results
DROP POLICY IF EXISTS "Users can view their company diagnostic results" ON public.diagnostic_results;
CREATE POLICY "Users can view their company diagnostic results" 
ON public.diagnostic_results 
FOR SELECT 
USING (company_id = public.get_user_company_id());

DROP POLICY IF EXISTS "Users can insert diagnostic results" ON public.diagnostic_results;
CREATE POLICY "Users can insert their company diagnostic results" 
ON public.diagnostic_results 
FOR INSERT 
WITH CHECK (company_id = public.get_user_company_id());

DROP POLICY IF EXISTS "Users can update diagnostic results" ON public.diagnostic_results;
CREATE POLICY "Users can update their company diagnostic results" 
ON public.diagnostic_results 
FOR UPDATE 
USING (company_id = public.get_user_company_id());

-- Step 5: Update RLS policies for preventive_measures
DROP POLICY IF EXISTS "Users can view preventive measures" ON public.preventive_measures;
CREATE POLICY "Users can view their company preventive measures" 
ON public.preventive_measures 
FOR SELECT 
USING (company_id = public.get_user_company_id());

DROP POLICY IF EXISTS "Users can insert preventive measures" ON public.preventive_measures;
CREATE POLICY "Users can insert their company preventive measures" 
ON public.preventive_measures 
FOR INSERT 
WITH CHECK (company_id = public.get_user_company_id());

DROP POLICY IF EXISTS "Users can update preventive measures" ON public.preventive_measures;
CREATE POLICY "Users can update their company preventive measures" 
ON public.preventive_measures 
FOR UPDATE 
USING (company_id = public.get_user_company_id());

-- Step 6: Update RLS policies for scian_actions
DROP POLICY IF EXISTS "Users can view SCIAN actions" ON public.scian_actions;
CREATE POLICY "Users can view their company SCIAN actions" 
ON public.scian_actions 
FOR SELECT 
USING (company_id = public.get_user_company_id());

DROP POLICY IF EXISTS "Users can insert SCIAN actions" ON public.scian_actions;
CREATE POLICY "Users can insert their company SCIAN actions" 
ON public.scian_actions 
FOR INSERT 
WITH CHECK (company_id = public.get_user_company_id());

DROP POLICY IF EXISTS "Users can update SCIAN actions" ON public.scian_actions;
CREATE POLICY "Users can update their company SCIAN actions" 
ON public.scian_actions 
FOR UPDATE 
USING (company_id = public.get_user_company_id());

-- Step 7: Update RLS policies for compliance_history
DROP POLICY IF EXISTS "Users can view compliance history" ON public.compliance_history;
CREATE POLICY "Users can view their company compliance history" 
ON public.compliance_history 
FOR SELECT 
USING (company_id = public.get_user_company_id());

DROP POLICY IF EXISTS "Users can insert compliance history" ON public.compliance_history;
CREATE POLICY "Users can insert their company compliance history" 
ON public.compliance_history 
FOR INSERT 
WITH CHECK (company_id = public.get_user_company_id());

-- Step 8: Fix conversation_logs public access issue
DROP POLICY IF EXISTS "Enable select for users" ON public.conversation_logs;
CREATE POLICY "Users can view their own conversation logs" 
ON public.conversation_logs 
FOR SELECT 
USING (auth.uid() = user_id);

-- Step 9: Create trigger to auto-assign company_id when inserting data
CREATE OR REPLACE FUNCTION public.set_user_company_id()
RETURNS TRIGGER AS $$
BEGIN
  -- Set company_id to current user's company if not already set
  IF NEW.company_id IS NULL THEN
    NEW.company_id = public.get_user_company_id();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for auto-setting company_id
CREATE TRIGGER set_risk_inventory_company_id
  BEFORE INSERT ON public.risk_inventory
  FOR EACH ROW EXECUTE FUNCTION public.set_user_company_id();

CREATE TRIGGER set_diagnostic_results_company_id
  BEFORE INSERT ON public.diagnostic_results
  FOR EACH ROW EXECUTE FUNCTION public.set_user_company_id();

CREATE TRIGGER set_preventive_measures_company_id
  BEFORE INSERT ON public.preventive_measures
  FOR EACH ROW EXECUTE FUNCTION public.set_user_company_id();

CREATE TRIGGER set_scian_actions_company_id
  BEFORE INSERT ON public.scian_actions
  FOR EACH ROW EXECUTE FUNCTION public.set_user_company_id();

CREATE TRIGGER set_compliance_history_company_id
  BEFORE INSERT ON public.compliance_history
  FOR EACH ROW EXECUTE FUNCTION public.set_user_company_id();