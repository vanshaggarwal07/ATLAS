-- Fix the SELECT policy for companies to allow immediate access after creation
-- The issue is that after INSERT, the user can't SELECT the new company because 
-- they're not yet a member (company_members row is created after the insert)

-- Solution 1: Create a database function to handle atomic company creation
-- This will create the company AND add the user as a member in a single transaction

CREATE OR REPLACE FUNCTION public.create_company_with_owner(
  p_name text,
  p_industry industry_type DEFAULT 'other',
  p_stage text DEFAULT NULL,
  p_employee_count integer DEFAULT NULL,
  p_annual_revenue numeric DEFAULT NULL,
  p_founded_year integer DEFAULT NULL,
  p_website text DEFAULT NULL,
  p_description text DEFAULT NULL,
  p_gstin text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_company_id uuid;
BEGIN
  -- Check if user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Insert the company
  INSERT INTO public.companies (name, industry, stage, employee_count, annual_revenue, founded_year, website, description, gstin)
  VALUES (p_name, p_industry, p_stage, p_employee_count, p_annual_revenue, p_founded_year, p_website, p_description, p_gstin)
  RETURNING id INTO new_company_id;

  -- Add the creating user as owner
  INSERT INTO public.company_members (company_id, user_id, role)
  VALUES (new_company_id, auth.uid(), 'owner');

  RETURN new_company_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.create_company_with_owner TO authenticated;