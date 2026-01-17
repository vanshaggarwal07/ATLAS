-- Fix business_datasets policies - correct parameter order
DROP POLICY IF EXISTS "Company members can view datasets" ON public.business_datasets;
DROP POLICY IF EXISTS "Company members can create datasets" ON public.business_datasets;
DROP POLICY IF EXISTS "Company members can update datasets" ON public.business_datasets;
DROP POLICY IF EXISTS "Company members can delete datasets" ON public.business_datasets;

CREATE POLICY "Company members can view datasets" 
ON public.business_datasets 
FOR SELECT 
USING (public.is_company_member(auth.uid(), company_id));

CREATE POLICY "Company members can create datasets" 
ON public.business_datasets 
FOR INSERT 
WITH CHECK (public.is_company_member(auth.uid(), company_id));

CREATE POLICY "Company members can update datasets" 
ON public.business_datasets 
FOR UPDATE 
USING (public.is_company_member(auth.uid(), company_id));

CREATE POLICY "Company members can delete datasets" 
ON public.business_datasets 
FOR DELETE 
USING (public.is_company_member(auth.uid(), company_id));

-- Fix ai_consulting_sessions policies - correct parameter order
DROP POLICY IF EXISTS "Company members can view sessions" ON public.ai_consulting_sessions;
DROP POLICY IF EXISTS "Company members can create sessions" ON public.ai_consulting_sessions;
DROP POLICY IF EXISTS "Company members can update sessions" ON public.ai_consulting_sessions;
DROP POLICY IF EXISTS "Company members can delete sessions" ON public.ai_consulting_sessions;

CREATE POLICY "Company members can view sessions" 
ON public.ai_consulting_sessions 
FOR SELECT 
USING (public.is_company_member(auth.uid(), company_id));

CREATE POLICY "Company members can create sessions" 
ON public.ai_consulting_sessions 
FOR INSERT 
WITH CHECK (public.is_company_member(auth.uid(), company_id));

CREATE POLICY "Company members can update sessions" 
ON public.ai_consulting_sessions 
FOR UPDATE 
USING (public.is_company_member(auth.uid(), company_id));

CREATE POLICY "Company members can delete sessions" 
ON public.ai_consulting_sessions 
FOR DELETE 
USING (public.is_company_member(auth.uid(), company_id));