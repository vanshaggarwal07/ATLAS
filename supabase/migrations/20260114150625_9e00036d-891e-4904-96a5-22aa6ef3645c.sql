-- The companies INSERT policy is restrictive (Permissive: No) which means it blocks by default
-- We need to make it permissive so authenticated users can create companies

-- Drop the restrictive policy
DROP POLICY IF EXISTS "Authenticated users can create companies" ON public.companies;

-- Create a permissive policy for INSERT
CREATE POLICY "Authenticated users can create companies" 
ON public.companies 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- Also fix company_members INSERT policy to be permissive
DROP POLICY IF EXISTS "Company members can add members" ON public.company_members;

CREATE POLICY "Company members can add members" 
ON public.company_members 
FOR INSERT 
TO authenticated
WITH CHECK (
  -- Allow if user is already a member of the company
  is_company_member(auth.uid(), company_id) 
  OR 
  -- OR if this is the first member being added (no existing members for this company)
  NOT EXISTS (
    SELECT 1 FROM public.company_members existing
    WHERE existing.company_id = company_members.company_id
  )
);