-- Create a helper function to check if user is company owner
CREATE OR REPLACE FUNCTION public.is_company_owner(_user_id uuid, _company_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.company_members
    WHERE user_id = _user_id 
      AND company_id = _company_id 
      AND role = 'owner'
  )
$$;

-- Add DELETE policy that only allows company owners to delete
CREATE POLICY "Only owners can delete company" 
ON public.companies 
FOR DELETE 
TO authenticated
USING (is_company_owner(auth.uid(), id));