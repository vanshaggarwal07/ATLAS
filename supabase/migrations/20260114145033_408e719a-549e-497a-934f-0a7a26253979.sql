-- Create table for storing uploaded business datasets
CREATE TABLE public.business_datasets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  dataset_type TEXT NOT NULL CHECK (dataset_type IN ('sales', 'costs', 'customers', 'revenue', 'operations', 'marketing', 'other')),
  file_path TEXT,
  raw_data JSONB,
  processed_data JSONB,
  row_count INTEGER,
  uploaded_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for AI consulting sessions with full workflow
CREATE TABLE public.ai_consulting_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  created_by UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'data_collection' CHECK (status IN ('data_collection', 'diagnosing', 'scenarios', 'planning', 'complete')),
  problem_domain TEXT,
  problem_description TEXT,
  datasets_used UUID[],
  diagnosis JSONB,
  scenarios JSONB,
  selected_scenario_id TEXT,
  execution_plan JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.business_datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_consulting_sessions ENABLE ROW LEVEL SECURITY;

-- RLS policies for business_datasets
CREATE POLICY "Company members can view datasets" 
ON public.business_datasets 
FOR SELECT 
USING (public.is_company_member(company_id, auth.uid()));

CREATE POLICY "Company members can create datasets" 
ON public.business_datasets 
FOR INSERT 
WITH CHECK (public.is_company_member(company_id, auth.uid()));

CREATE POLICY "Company members can update datasets" 
ON public.business_datasets 
FOR UPDATE 
USING (public.is_company_member(company_id, auth.uid()));

CREATE POLICY "Company members can delete datasets" 
ON public.business_datasets 
FOR DELETE 
USING (public.is_company_member(company_id, auth.uid()));

-- RLS policies for ai_consulting_sessions
CREATE POLICY "Company members can view sessions" 
ON public.ai_consulting_sessions 
FOR SELECT 
USING (public.is_company_member(company_id, auth.uid()));

CREATE POLICY "Company members can create sessions" 
ON public.ai_consulting_sessions 
FOR INSERT 
WITH CHECK (public.is_company_member(company_id, auth.uid()));

CREATE POLICY "Company members can update sessions" 
ON public.ai_consulting_sessions 
FOR UPDATE 
USING (public.is_company_member(company_id, auth.uid()));

CREATE POLICY "Company members can delete sessions" 
ON public.ai_consulting_sessions 
FOR DELETE 
USING (public.is_company_member(company_id, auth.uid()));

-- Enable realtime for the new tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.business_datasets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ai_consulting_sessions;