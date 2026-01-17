-- Drop the overly permissive policy that allows viewing company member profiles
DROP POLICY IF EXISTS "Users can view company member profiles" ON public.profiles;

-- Keep only the policy that allows users to view their own profile
-- The existing "Users can view own profile" policy already handles this correctly