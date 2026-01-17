-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Anyone can view playbooks" ON public.playbooks;

-- Create a new policy that requires authentication to view playbooks
CREATE POLICY "Authenticated users can view playbooks" 
ON public.playbooks 
FOR SELECT 
TO authenticated
USING (true);