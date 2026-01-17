-- Fix the RLS policy for audit_sessions INSERT - parameters were in wrong order
DROP POLICY IF EXISTS "Users can create audit sessions for their company" ON public.audit_sessions;

CREATE POLICY "Users can create audit sessions for their company"
  ON public.audit_sessions
  FOR INSERT
  WITH CHECK (is_company_member(auth.uid(), company_id));

-- Also fix the SELECT policy
DROP POLICY IF EXISTS "Users can view own company audit sessions" ON public.audit_sessions;

CREATE POLICY "Users can view own company audit sessions"
  ON public.audit_sessions
  FOR SELECT
  USING (is_company_member(auth.uid(), company_id));

-- Fix the UPDATE policy  
DROP POLICY IF EXISTS "Users can update own company audit sessions" ON public.audit_sessions;

CREATE POLICY "Users can update own company audit sessions"
  ON public.audit_sessions
  FOR UPDATE
  USING (is_company_member(auth.uid(), company_id));

-- Fix the DELETE policy
DROP POLICY IF EXISTS "Company owners can delete audit sessions" ON public.audit_sessions;

CREATE POLICY "Company owners can delete audit sessions"
  ON public.audit_sessions
  FOR DELETE
  USING (is_company_owner(auth.uid(), company_id));