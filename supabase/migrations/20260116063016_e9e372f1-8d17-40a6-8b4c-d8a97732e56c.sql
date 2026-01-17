-- Create enum for audit types
CREATE TYPE public.audit_type AS ENUM ('financial', 'internal', 'compliance', 'tax', 'custom');

-- Create enum for accounting standards
CREATE TYPE public.accounting_standard AS ENUM ('ifrs', 'gaap', 'local', 'custom');

-- Create enum for audit session status
CREATE TYPE public.audit_session_status AS ENUM ('setup', 'upload', 'analyzing', 'review', 'complete');

-- Create enum for finding severity
CREATE TYPE public.finding_severity AS ENUM ('high', 'medium', 'low', 'info');

-- Create enum for audit file status
CREATE TYPE public.audit_file_status AS ENUM ('pending', 'processing', 'processed', 'error');

-- Create audit_sessions table
CREATE TABLE public.audit_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  created_by UUID NOT NULL,
  title TEXT NOT NULL,
  audit_type public.audit_type NOT NULL DEFAULT 'financial',
  accounting_standard public.accounting_standard NOT NULL DEFAULT 'ifrs',
  industry TEXT,
  financial_year TEXT,
  currency TEXT DEFAULT 'INR',
  status public.audit_session_status NOT NULL DEFAULT 'setup',
  current_step INTEGER DEFAULT 1,
  ai_summary TEXT,
  risk_score INTEGER,
  compliance_status TEXT,
  recommendations JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create audit_files table
CREATE TABLE public.audit_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.audit_sessions(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_category TEXT NOT NULL, -- trial_balance, general_ledger, pnl, balance_sheet, etc.
  file_size INTEGER,
  storage_path TEXT,
  raw_data JSONB,
  parsed_data JSONB,
  headers TEXT[],
  row_count INTEGER,
  status public.audit_file_status NOT NULL DEFAULT 'pending',
  validation_errors JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create audit_findings table
CREATE TABLE public.audit_findings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.audit_sessions(id) ON DELETE CASCADE,
  finding_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  severity public.finding_severity NOT NULL DEFAULT 'info',
  category TEXT,
  evidence JSONB, -- file reference, row numbers, data points
  financial_impact NUMERIC,
  recommendation TEXT,
  status TEXT DEFAULT 'open', -- open, acknowledged, resolved
  ai_confidence NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create audit_questions table for AI follow-up questions
CREATE TABLE public.audit_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.audit_sessions(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  context TEXT,
  answer TEXT,
  is_answered BOOLEAN DEFAULT false,
  priority INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.audit_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_questions ENABLE ROW LEVEL SECURITY;

-- RLS policies for audit_sessions
CREATE POLICY "Users can view own company audit sessions"
ON public.audit_sessions FOR SELECT
USING (public.is_company_member(company_id, auth.uid()));

CREATE POLICY "Users can create audit sessions for their company"
ON public.audit_sessions FOR INSERT
WITH CHECK (public.is_company_member(company_id, auth.uid()));

CREATE POLICY "Users can update own company audit sessions"
ON public.audit_sessions FOR UPDATE
USING (public.is_company_member(company_id, auth.uid()));

CREATE POLICY "Company owners can delete audit sessions"
ON public.audit_sessions FOR DELETE
USING (public.is_company_owner(company_id, auth.uid()));

-- RLS policies for audit_files
CREATE POLICY "Users can view files from their audit sessions"
ON public.audit_files FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.audit_sessions s
  WHERE s.id = audit_files.session_id
  AND public.is_company_member(s.company_id, auth.uid())
));

CREATE POLICY "Users can add files to their audit sessions"
ON public.audit_files FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.audit_sessions s
  WHERE s.id = audit_files.session_id
  AND public.is_company_member(s.company_id, auth.uid())
));

CREATE POLICY "Users can update files in their audit sessions"
ON public.audit_files FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.audit_sessions s
  WHERE s.id = audit_files.session_id
  AND public.is_company_member(s.company_id, auth.uid())
));

CREATE POLICY "Users can delete files from their audit sessions"
ON public.audit_files FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.audit_sessions s
  WHERE s.id = audit_files.session_id
  AND public.is_company_member(s.company_id, auth.uid())
));

-- RLS policies for audit_findings
CREATE POLICY "Users can view findings from their audit sessions"
ON public.audit_findings FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.audit_sessions s
  WHERE s.id = audit_findings.session_id
  AND public.is_company_member(s.company_id, auth.uid())
));

CREATE POLICY "Users can create findings in their audit sessions"
ON public.audit_findings FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.audit_sessions s
  WHERE s.id = audit_findings.session_id
  AND public.is_company_member(s.company_id, auth.uid())
));

CREATE POLICY "Users can update findings in their audit sessions"
ON public.audit_findings FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.audit_sessions s
  WHERE s.id = audit_findings.session_id
  AND public.is_company_member(s.company_id, auth.uid())
));

-- RLS policies for audit_questions
CREATE POLICY "Users can view questions from their audit sessions"
ON public.audit_questions FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.audit_sessions s
  WHERE s.id = audit_questions.session_id
  AND public.is_company_member(s.company_id, auth.uid())
));

CREATE POLICY "Users can create questions in their audit sessions"
ON public.audit_questions FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.audit_sessions s
  WHERE s.id = audit_questions.session_id
  AND public.is_company_member(s.company_id, auth.uid())
));

CREATE POLICY "Users can update questions in their audit sessions"
ON public.audit_questions FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.audit_sessions s
  WHERE s.id = audit_questions.session_id
  AND public.is_company_member(s.company_id, auth.uid())
));

-- Create updated_at trigger
CREATE TRIGGER update_audit_sessions_updated_at
BEFORE UPDATE ON public.audit_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for audit sessions
ALTER PUBLICATION supabase_realtime ADD TABLE public.audit_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.audit_findings;