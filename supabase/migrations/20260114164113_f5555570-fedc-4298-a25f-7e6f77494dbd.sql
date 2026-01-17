-- Add DELETE policy to business_metrics table
CREATE POLICY "Company members can delete metrics" 
ON public.business_metrics
FOR DELETE 
USING (is_company_member(auth.uid(), company_id));