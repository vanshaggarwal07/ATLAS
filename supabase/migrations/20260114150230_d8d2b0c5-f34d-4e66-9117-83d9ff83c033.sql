-- Fix the company_members INSERT policy that has a bug in the subquery
-- The current policy has: company_members_1.company_id = company_members_1.company_id
-- which is always true. It should check if there are any existing members for the NEW company_id

-- Drop the old buggy policy
DROP POLICY IF EXISTS "Company members can add members" ON public.company_members;

-- Create a fixed policy that allows:
-- 1. Existing company members to add new members
-- 2. OR if this is the first member being added to a company (no existing members for that company_id)
CREATE POLICY "Company members can add members" 
ON public.company_members 
FOR INSERT 
WITH CHECK (
  is_company_member(auth.uid(), company_id) 
  OR 
  NOT EXISTS (
    SELECT 1 FROM public.company_members existing
    WHERE existing.company_id = company_members.company_id
  )
);