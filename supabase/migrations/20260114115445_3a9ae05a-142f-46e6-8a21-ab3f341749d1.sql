-- Fix the permissive RLS policy for companies INSERT
DROP POLICY IF EXISTS "Authenticated users can create companies" ON public.companies;

-- More restrictive: only authenticated users can create companies, and we'll add them as owner immediately
CREATE POLICY "Authenticated users can create companies" ON public.companies
  FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);