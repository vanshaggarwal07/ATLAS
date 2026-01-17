-- Drop the existing foreign key constraint that references consulting_sessions
ALTER TABLE public.execution_milestones 
DROP CONSTRAINT execution_milestones_session_id_fkey;

-- Add a new foreign key constraint that references ai_consulting_sessions
ALTER TABLE public.execution_milestones 
ADD CONSTRAINT execution_milestones_session_id_fkey 
FOREIGN KEY (session_id) REFERENCES public.ai_consulting_sessions(id) ON DELETE CASCADE;

-- Update the RLS policy to use ai_consulting_sessions instead of consulting_sessions
DROP POLICY IF EXISTS "Users can view milestones for accessible sessions" ON public.execution_milestones;
DROP POLICY IF EXISTS "Users can manage milestones for accessible sessions" ON public.execution_milestones;

CREATE POLICY "Users can view milestones for accessible sessions" 
ON public.execution_milestones
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.ai_consulting_sessions acs
    WHERE acs.id = execution_milestones.session_id 
    AND is_company_member(auth.uid(), acs.company_id)
  )
);

CREATE POLICY "Users can manage milestones for accessible sessions" 
ON public.execution_milestones
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.ai_consulting_sessions acs
    WHERE acs.id = execution_milestones.session_id 
    AND is_company_member(auth.uid(), acs.company_id)
  )
);