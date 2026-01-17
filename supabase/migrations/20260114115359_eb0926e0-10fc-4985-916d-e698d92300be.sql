-- ATLAS Business Platform Database Schema

-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'member', 'viewer');

-- Create industry enum
CREATE TYPE public.industry_type AS ENUM (
  'technology', 'healthcare', 'finance', 'retail', 'manufacturing', 
  'education', 'real_estate', 'hospitality', 'consulting', 'other'
);

-- Create problem domain enum
CREATE TYPE public.problem_domain AS ENUM (
  'growth', 'pricing', 'operations', 'fundraising', 'hiring', 'product_strategy'
);

-- Create consulting session status enum
CREATE TYPE public.session_status AS ENUM (
  'intake', 'diagnosing', 'simulating', 'planning', 'complete'
);

-- Create execution status enum
CREATE TYPE public.execution_status AS ENUM (
  'not_started', 'in_progress', 'blocked', 'complete'
);

-- Profiles table for user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- User roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'member',
  UNIQUE(user_id, role)
);

-- Companies table
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  industry industry_type NOT NULL DEFAULT 'other',
  stage TEXT, -- seed, series_a, series_b, growth, etc.
  employee_count INTEGER,
  annual_revenue DECIMAL(15, 2),
  founded_year INTEGER,
  website TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Company members (linking users to companies)
CREATE TABLE public.company_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member', -- owner, admin, member
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(company_id, user_id)
);

-- Onboarding status
CREATE TABLE public.onboarding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  current_step INTEGER DEFAULT 1,
  primary_challenge problem_domain,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Business metrics (KPIs)
CREATE TABLE public.business_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL,
  revenue DECIMAL(15, 2),
  growth_rate DECIMAL(5, 2),
  burn_rate DECIMAL(15, 2),
  retention_rate DECIMAL(5, 2),
  gross_margin DECIMAL(5, 2),
  customer_count INTEGER,
  mrr DECIMAL(15, 2),
  arr DECIMAL(15, 2),
  churn_rate DECIMAL(5, 2),
  cac DECIMAL(10, 2),
  ltv DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(company_id, metric_date)
);

-- Consulting sessions
CREATE TABLE public.consulting_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  problem_domain problem_domain NOT NULL,
  problem_description TEXT NOT NULL,
  status session_status DEFAULT 'intake' NOT NULL,
  diagnosis JSONB, -- AI diagnosis results
  scenarios JSONB, -- Strategy scenarios
  recommended_strategy TEXT,
  execution_plan JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Strategy scenarios (detailed)
CREATE TABLE public.strategy_scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.consulting_sessions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  risk_level TEXT, -- low, medium, high
  time_to_impact TEXT, -- 1-3 months, 3-6 months, 6-12 months
  confidence_score INTEGER CHECK (confidence_score >= 0 AND confidence_score <= 100),
  expected_outcome JSONB,
  assumptions JSONB,
  is_recommended BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Execution milestones
CREATE TABLE public.execution_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.consulting_sessions(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  owner_name TEXT,
  due_date DATE,
  status execution_status DEFAULT 'not_started',
  order_index INTEGER DEFAULT 0,
  expected_outcome TEXT,
  actual_outcome TEXT,
  blockers TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Health indicators
CREATE TABLE public.health_indicators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  indicator_type TEXT NOT NULL, -- risk_signal, bottleneck, efficiency, strategic_debt
  name TEXT NOT NULL,
  severity TEXT, -- low, medium, high, critical
  description TEXT,
  recommendation TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Playbooks
CREATE TABLE public.playbooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  industry industry_type,
  stage TEXT,
  problem_domain problem_domain,
  content JSONB NOT NULL,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consulting_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strategy_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.execution_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playbooks ENABLE ROW LEVEL SECURITY;

-- Security definer function to check role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Function to check company membership
CREATE OR REPLACE FUNCTION public.is_company_member(_user_id UUID, _company_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.company_members
    WHERE user_id = _user_id AND company_id = _company_id
  )
$$;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User roles policies
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- Companies policies (members can view their companies)
CREATE POLICY "Company members can view company" ON public.companies
  FOR SELECT USING (public.is_company_member(auth.uid(), id));

CREATE POLICY "Company members can update company" ON public.companies
  FOR UPDATE USING (public.is_company_member(auth.uid(), id));

CREATE POLICY "Authenticated users can create companies" ON public.companies
  FOR INSERT TO authenticated WITH CHECK (true);

-- Company members policies
CREATE POLICY "Company members can view members" ON public.company_members
  FOR SELECT USING (public.is_company_member(auth.uid(), company_id));

CREATE POLICY "Company members can add members" ON public.company_members
  FOR INSERT TO authenticated WITH CHECK (public.is_company_member(auth.uid(), company_id) OR NOT EXISTS (SELECT 1 FROM public.company_members WHERE company_id = company_members.company_id));

CREATE POLICY "Company members can remove members" ON public.company_members
  FOR DELETE USING (public.is_company_member(auth.uid(), company_id));

-- Onboarding policies
CREATE POLICY "Users can view own onboarding" ON public.onboarding
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own onboarding" ON public.onboarding
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own onboarding" ON public.onboarding
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Business metrics policies
CREATE POLICY "Company members can view metrics" ON public.business_metrics
  FOR SELECT USING (public.is_company_member(auth.uid(), company_id));

CREATE POLICY "Company members can insert metrics" ON public.business_metrics
  FOR INSERT WITH CHECK (public.is_company_member(auth.uid(), company_id));

CREATE POLICY "Company members can update metrics" ON public.business_metrics
  FOR UPDATE USING (public.is_company_member(auth.uid(), company_id));

-- Consulting sessions policies
CREATE POLICY "Company members can view sessions" ON public.consulting_sessions
  FOR SELECT USING (public.is_company_member(auth.uid(), company_id));

CREATE POLICY "Company members can create sessions" ON public.consulting_sessions
  FOR INSERT WITH CHECK (public.is_company_member(auth.uid(), company_id) AND auth.uid() = created_by);

CREATE POLICY "Company members can update sessions" ON public.consulting_sessions
  FOR UPDATE USING (public.is_company_member(auth.uid(), company_id));

-- Strategy scenarios policies
CREATE POLICY "Users can view scenarios for accessible sessions" ON public.strategy_scenarios
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.consulting_sessions cs
      WHERE cs.id = session_id AND public.is_company_member(auth.uid(), cs.company_id)
    )
  );

CREATE POLICY "Users can create scenarios for accessible sessions" ON public.strategy_scenarios
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.consulting_sessions cs
      WHERE cs.id = session_id AND public.is_company_member(auth.uid(), cs.company_id)
    )
  );

-- Execution milestones policies
CREATE POLICY "Users can view milestones for accessible sessions" ON public.execution_milestones
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.consulting_sessions cs
      WHERE cs.id = session_id AND public.is_company_member(auth.uid(), cs.company_id)
    )
  );

CREATE POLICY "Users can manage milestones for accessible sessions" ON public.execution_milestones
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.consulting_sessions cs
      WHERE cs.id = session_id AND public.is_company_member(auth.uid(), cs.company_id)
    )
  );

-- Health indicators policies
CREATE POLICY "Company members can view health indicators" ON public.health_indicators
  FOR SELECT USING (public.is_company_member(auth.uid(), company_id));

CREATE POLICY "Company members can manage health indicators" ON public.health_indicators
  FOR ALL USING (public.is_company_member(auth.uid(), company_id));

-- Playbooks are public for reading
CREATE POLICY "Anyone can view playbooks" ON public.playbooks
  FOR SELECT TO authenticated USING (true);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'member');
  
  INSERT INTO public.onboarding (user_id, current_step)
  VALUES (NEW.id, 1);
  
  RETURN NEW;
END;
$$;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add update triggers to relevant tables
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_consulting_sessions_updated_at
  BEFORE UPDATE ON public.consulting_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();