import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Company {
  id: string;
  name: string;
  industry: string;
  stage: string | null;
  employee_count: number | null;
  annual_revenue: number | null;
  founded_year: number | null;
  website: string | null;
  description: string | null;
  gstin: string | null;
}

interface Onboarding {
  id: string;
  user_id: string;
  company_id: string | null;
  completed_at: string | null;
  current_step: number;
  primary_challenge: string | null;
}

interface CompanyContextType {
  company: Company | null;
  onboarding: Onboarding | null;
  loading: boolean;
  needsOnboarding: boolean;
  createCompany: (data: Partial<Company>) => Promise<Company | null>;
  updateCompany: (data: Partial<Company>) => Promise<Company | null>;
  updateOnboarding: (data: Partial<Onboarding>, skipRefetch?: boolean) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  refetch: () => Promise<void>;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export function CompanyProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [onboarding, setOnboarding] = useState<Onboarding | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!user) {
      setCompany(null);
      setOnboarding(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    try {
      // Fetch onboarding status
      const { data: onboardingData, error: onboardingError } = await supabase
        .from('onboarding')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (onboardingError) {
        console.error('Error fetching onboarding:', onboardingError);
      }
      
      setOnboarding(onboardingData);

      // If onboarding has a company, fetch it
      if (onboardingData?.company_id) {
        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .select('*')
          .eq('id', onboardingData.company_id)
          .maybeSingle();
        
        if (companyError) {
          console.error('Error fetching company:', companyError);
        }
        
        setCompany(companyData);
      } else {
        // Try to find company through company_members
        const { data: memberData } = await supabase
          .from('company_members')
          .select('company_id')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (memberData?.company_id) {
          const { data: companyData } = await supabase
            .from('companies')
            .select('*')
            .eq('id', memberData.company_id)
            .maybeSingle();
          
          setCompany(companyData);
        }
      }
    } catch (error) {
      console.error('Error in fetchData:', error);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const createCompany = async (data: Partial<Company>): Promise<Company | null> => {
    if (!user) return null;

    const industryValue = (data.industry || 'other') as 'technology' | 'healthcare' | 'finance' | 'retail' | 'manufacturing' | 'education' | 'real_estate' | 'hospitality' | 'consulting' | 'other';

    // Use the atomic database function that creates company and adds owner in one transaction
    const { data: newCompanyId, error } = await supabase
      .rpc('create_company_with_owner', {
        p_name: data.name!,
        p_industry: industryValue,
        p_stage: data.stage || null,
        p_employee_count: data.employee_count || null,
        p_annual_revenue: data.annual_revenue || null,
        p_founded_year: data.founded_year || null,
        p_website: data.website || null,
        p_description: data.description || null,
        p_gstin: data.gstin || null,
      });

    if (error || !newCompanyId) {
      console.error('Error creating company:', error);
      return null;
    }

    // Fetch the newly created company (now user is a member and can view it)
    const { data: newCompany, error: fetchError } = await supabase
      .from('companies')
      .select('*')
      .eq('id', newCompanyId)
      .single();

    if (fetchError || !newCompany) {
      console.error('Error fetching new company:', fetchError);
      return null;
    }

    // Update onboarding with company_id
    const { error: updateError } = await supabase
      .from('onboarding')
      .update({ company_id: newCompany.id })
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Error updating onboarding:', updateError);
    }

    setCompany(newCompany);
    return newCompany;
  };

  const updateCompany = async (data: Partial<Company>): Promise<Company | null> => {
    if (!user || !company) return null;

    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.industry !== undefined) updateData.industry = data.industry;
    if (data.stage !== undefined) updateData.stage = data.stage;
    if (data.employee_count !== undefined) updateData.employee_count = data.employee_count;
    if (data.annual_revenue !== undefined) updateData.annual_revenue = data.annual_revenue;
    if (data.founded_year !== undefined) updateData.founded_year = data.founded_year;
    if (data.website !== undefined) updateData.website = data.website;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.gstin !== undefined) updateData.gstin = data.gstin;

    const { data: updatedCompany, error } = await supabase
      .from('companies')
      .update(updateData)
      .eq('id', company.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating company:', error);
      return null;
    }

    setCompany(updatedCompany);
    return updatedCompany;
  };

  const ensureOnboardingExists = async (): Promise<boolean> => {
    if (!user) return false;

    // Check if onboarding record exists
    const { data: existing, error: checkError } = await supabase
      .from('onboarding')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking onboarding:', checkError);
      return false;
    }

    if (existing) return true;

    // Create onboarding record if it doesn't exist
    const { error: insertError } = await supabase
      .from('onboarding')
      .insert({
        user_id: user.id,
        current_step: 1,
      });

    if (insertError) {
      console.error('Error creating onboarding:', insertError);
      return false;
    }

    return true;
  };

  const updateOnboarding = async (data: Partial<Onboarding>, skipRefetch = false) => {
    if (!user) return;

    // Ensure onboarding record exists first
    const exists = await ensureOnboardingExists();
    if (!exists) {
      console.error('Could not ensure onboarding record exists');
      return;
    }

    const updateData: Record<string, unknown> = {};
    if (data.current_step !== undefined) updateData.current_step = data.current_step;
    if (data.company_id !== undefined) updateData.company_id = data.company_id;
    if (data.primary_challenge !== undefined) {
      updateData.primary_challenge = data.primary_challenge as 'growth' | 'pricing' | 'operations' | 'fundraising' | 'hiring' | 'product_strategy';
    }

    const { error } = await supabase
      .from('onboarding')
      .update(updateData)
      .eq('user_id', user.id);
    
    if (error) {
      console.error('Error updating onboarding:', error);
    }
    
    // Only refetch if not skipping (to avoid infinite loops during onboarding)
    if (!skipRefetch) {
      await fetchData();
    }
  };

  const completeOnboarding = async () => {
    if (!user) return;

    const { error } = await supabase
      .from('onboarding')
      .update({ completed_at: new Date().toISOString() })
      .eq('user_id', user.id);
    
    if (error) {
      console.error('Error completing onboarding:', error);
    }
    
    await fetchData();
  };

  const needsOnboarding = !loading && (!onboarding?.completed_at || !company);

  return (
    <CompanyContext.Provider value={{ 
      company, 
      onboarding, 
      loading, 
      needsOnboarding,
      createCompany,
      updateCompany,
      updateOnboarding, 
      completeOnboarding,
      refetch: fetchData
    }}>
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  const context = useContext(CompanyContext);
  if (context === undefined) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return context;
}
