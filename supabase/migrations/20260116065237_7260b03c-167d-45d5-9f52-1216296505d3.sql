-- Fix audit_files RLS policies - parameters were in wrong order
DROP POLICY IF EXISTS "Users can view files from their audit sessions" ON public.audit_files;
DROP POLICY IF EXISTS "Users can add files to their audit sessions" ON public.audit_files;
DROP POLICY IF EXISTS "Users can update files in their audit sessions" ON public.audit_files;
DROP POLICY IF EXISTS "Users can delete files from their audit sessions" ON public.audit_files;

CREATE POLICY "Users can view files from their audit sessions"
  ON public.audit_files FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM audit_sessions s 
    WHERE s.id = audit_files.session_id AND is_company_member(auth.uid(), s.company_id)
  ));

CREATE POLICY "Users can add files to their audit sessions"
  ON public.audit_files FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM audit_sessions s 
    WHERE s.id = audit_files.session_id AND is_company_member(auth.uid(), s.company_id)
  ));

CREATE POLICY "Users can update files in their audit sessions"
  ON public.audit_files FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM audit_sessions s 
    WHERE s.id = audit_files.session_id AND is_company_member(auth.uid(), s.company_id)
  ));

CREATE POLICY "Users can delete files from their audit sessions"
  ON public.audit_files FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM audit_sessions s 
    WHERE s.id = audit_files.session_id AND is_company_member(auth.uid(), s.company_id)
  ));

-- Fix audit_findings RLS policies
DROP POLICY IF EXISTS "Users can view findings from their audit sessions" ON public.audit_findings;
DROP POLICY IF EXISTS "Users can create findings in their audit sessions" ON public.audit_findings;
DROP POLICY IF EXISTS "Users can update findings in their audit sessions" ON public.audit_findings;

CREATE POLICY "Users can view findings from their audit sessions"
  ON public.audit_findings FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM audit_sessions s 
    WHERE s.id = audit_findings.session_id AND is_company_member(auth.uid(), s.company_id)
  ));

CREATE POLICY "Users can create findings in their audit sessions"
  ON public.audit_findings FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM audit_sessions s 
    WHERE s.id = audit_findings.session_id AND is_company_member(auth.uid(), s.company_id)
  ));

CREATE POLICY "Users can update findings in their audit sessions"
  ON public.audit_findings FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM audit_sessions s 
    WHERE s.id = audit_findings.session_id AND is_company_member(auth.uid(), s.company_id)
  ));

-- Fix audit_questions RLS policies
DROP POLICY IF EXISTS "Users can view questions from their audit sessions" ON public.audit_questions;
DROP POLICY IF EXISTS "Users can create questions in their audit sessions" ON public.audit_questions;
DROP POLICY IF EXISTS "Users can update questions in their audit sessions" ON public.audit_questions;

CREATE POLICY "Users can view questions from their audit sessions"
  ON public.audit_questions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM audit_sessions s 
    WHERE s.id = audit_questions.session_id AND is_company_member(auth.uid(), s.company_id)
  ));

CREATE POLICY "Users can create questions in their audit sessions"
  ON public.audit_questions FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM audit_sessions s 
    WHERE s.id = audit_questions.session_id AND is_company_member(auth.uid(), s.company_id)
  ));

CREATE POLICY "Users can update questions in their audit sessions"
  ON public.audit_questions FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM audit_sessions s 
    WHERE s.id = audit_questions.session_id AND is_company_member(auth.uid(), s.company_id)
  ));