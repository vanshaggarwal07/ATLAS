import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  FileText,
  Briefcase, 
  Users, 
  Info,
  Rocket,
  ArrowRight, 
  ArrowLeft,
  Check,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useCompany } from '@/hooks/useCompany';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const industries = [
  { value: 'technology', label: 'Technology', icon: '💻' },
  { value: 'healthcare', label: 'Healthcare', icon: '🏥' },
  { value: 'finance', label: 'Finance', icon: '💰' },
  { value: 'retail', label: 'Retail', icon: '🛒' },
  { value: 'manufacturing', label: 'Manufacturing', icon: '🏭' },
  { value: 'education', label: 'Education', icon: '📚' },
  { value: 'real_estate', label: 'Real Estate', icon: '🏢' },
  { value: 'hospitality', label: 'Hospitality', icon: '🏨' },
  { value: 'consulting', label: 'Consulting', icon: '📊' },
  { value: 'other', label: 'Other', icon: '🌐' },
];

const stages = [
  { value: 'startup', label: 'Startup', description: 'Early-stage venture building a product' },
  { value: 'msme', label: 'MSME', description: 'Micro, Small & Medium Enterprise' },
  { value: 'government', label: 'Government', description: 'Government department or agency' },
  { value: 'government_ngo', label: 'Government Related NGO', description: 'Govt. affiliated non-profit organization' },
  { value: 'ngo', label: 'NGO', description: 'Non-profit organization serving a cause' },
  { value: 'enterprise', label: 'Enterprise', description: 'Large established business or corporation' },
];

const teamSizes = [
  { value: '1', label: 'Solo', desc: 'Just me' },
  { value: '5', label: '2-5', desc: 'Small team' },
  { value: '15', label: '6-20', desc: 'Growing team' },
  { value: '50', label: '21-50', desc: 'Scaling up' },
  { value: '100', label: '51-100', desc: 'Mid-size' },
  { value: '500', label: '100+', desc: 'Large org' },
];

const steps = [
  { id: 1, title: 'Company', icon: Building2, desc: 'Company name' },
  { id: 2, title: 'GSTIN', icon: FileText, desc: 'Tax registration' },
  { id: 3, title: 'Industry', icon: Briefcase, desc: 'Industry & type' },
  { id: 4, title: 'Team', icon: Users, desc: 'Team size' },
  { id: 5, title: 'About', icon: Info, desc: 'Company info' },
  { id: 6, title: 'Launch', icon: Rocket, desc: 'Get started' },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { createCompany, updateOnboarding, completeOnboarding } = useCompany();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    gstin: '',
    website: '',
    description: '',
    industry: '',
    stage: '',
    employee_count: '',
  });

  useEffect(() => {
    if (!initialized) {
      updateOnboarding({ current_step: 1 }, true).then(() => {
        setInitialized(true);
      });
    }
  }, []);

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateGSTIN = (gstin: string): boolean => {
    if (!gstin) return true;
    const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstinRegex.test(gstin.toUpperCase());
  };

  const canContinue = () => {
    switch (step) {
      case 1: return formData.name.length >= 2;
      case 2: return !formData.gstin || validateGSTIN(formData.gstin);
      case 3: return formData.industry && formData.stage;
      case 4: return formData.employee_count;
      case 5: return true;
      case 6: return true;
      default: return false;
    }
  };

  const handleNext = async () => {
    if (step < 6) {
      setStep(step + 1);
      await updateOnboarding({ current_step: step + 1 }, true);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleLaunch = async () => {
    setLoading(true);
    try {
      const company = await createCompany({
        name: formData.name,
        industry: formData.industry as any,
        stage: formData.stage,
        employee_count: parseInt(formData.employee_count) || null,
        website: formData.website || null,
        description: formData.description || null,
        gstin: formData.gstin.toUpperCase() || null,
      });
      
      if (!company) {
        toast.error('Failed to create company. Please try again.');
        setLoading(false);
        return;
      }

      await updateOnboarding({ 
        company_id: company.id
      }, true);
      await completeOnboarding();
      toast.success('Welcome to ATLAS! Your workspace is ready.');
      navigate('/app/consulting');
    } catch (error) {
      console.error('Onboarding error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="fixed inset-0 gradient-mesh pointer-events-none" />
      
      {/* Header */}
      <header className="relative z-10 p-6">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <span className="font-bold text-primary-foreground">A</span>
          </div>
          <span className="text-2xl font-bold tracking-tight">ATLAS</span>
        </div>
      </header>

      {/* Progress */}
      <div className="relative z-10 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            {steps.map((s, i) => (
              <div key={s.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all",
                    step > s.id 
                      ? "bg-primary border-primary text-primary-foreground"
                      : step === s.id
                      ? "border-primary text-primary bg-primary/10"
                      : "border-border text-muted-foreground"
                  )}>
                    {step > s.id ? <Check size={18} /> : <s.icon size={18} />}
                  </div>
                  <span className={cn(
                    "text-xs mt-1 hidden md:block",
                    step >= s.id ? "text-foreground" : "text-muted-foreground"
                  )}>{s.title}</span>
                </div>
                {i < steps.length - 1 && (
                  <div className={cn(
                    "w-8 md:w-16 h-0.5 mx-1 md:mx-2",
                    step > s.id ? "bg-primary" : "bg-border"
                  )} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="card-glass p-8 md:p-12"
            >
              {/* Step 1: Company Name */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4">
                      <Building2 className="text-primary-foreground" size={32} />
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold mb-2">What's your company called?</h1>
                    <p className="text-muted-foreground">Let's set up your ATLAS workspace</p>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="company-name">Company Name *</Label>
                      <Input
                        id="company-name"
                        placeholder="Enter your company name"
                        value={formData.name}
                        onChange={(e) => updateField('name', e.target.value)}
                        className="mt-2 text-lg py-6"
                        autoFocus
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: GSTIN */}
              {step === 2 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center mx-auto mb-4">
                      <FileText className="text-accent" size={32} />
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold mb-2">GSTIN Number</h1>
                    <p className="text-muted-foreground">Enter your tax registration (optional)</p>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="gstin">GSTIN Number</Label>
                      <Input
                        id="gstin"
                        placeholder="22AAAAA0000A1Z5"
                        value={formData.gstin}
                        onChange={(e) => updateField('gstin', e.target.value.toUpperCase())}
                        className="mt-2 text-lg py-6 font-mono"
                        maxLength={15}
                        autoFocus
                      />
                      {formData.gstin && !validateGSTIN(formData.gstin) && (
                        <p className="text-sm text-destructive mt-2">Please enter a valid 15-character GSTIN</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">Format: 22AAAAA0000A1Z5 (You can skip this step)</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Industry & Stage */}
              {step === 3 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-4">
                      <Briefcase className="text-primary" size={32} />
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold mb-2">Tell us about your business</h1>
                    <p className="text-muted-foreground">This helps ATLAS provide relevant insights</p>
                  </div>
                  
                  <div className="space-y-4">
                    <Label>Industry *</Label>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                      {industries.map((ind) => (
                        <button
                          key={ind.value}
                          onClick={() => updateField('industry', ind.value)}
                          className={cn(
                            "p-3 rounded-xl border text-center transition-all",
                            formData.industry === ind.value
                              ? "border-primary bg-primary/10 shadow-sm"
                              : "border-border hover:border-primary/50"
                          )}
                        >
                          <span className="text-xl block mb-1">{ind.icon}</span>
                          <span className="text-xs font-medium">{ind.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label>Organization Type *</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {stages.map((s) => (
                        <button
                          key={s.value}
                          onClick={() => updateField('stage', s.value)}
                          className={cn(
                            "p-4 rounded-xl border text-left transition-all",
                            formData.stage === s.value
                              ? "border-primary bg-primary/10 shadow-sm"
                              : "border-border hover:border-primary/50"
                          )}
                        >
                          <span className="font-medium block">{s.label}</span>
                          <span className="text-xs text-muted-foreground">{s.description}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Team Size */}
              {step === 4 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center mx-auto mb-4">
                      <Users className="text-accent" size={32} />
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold mb-2">How big is your team?</h1>
                    <p className="text-muted-foreground">This helps us calibrate recommendations</p>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {teamSizes.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => updateField('employee_count', option.value)}
                        className={cn(
                          "p-6 rounded-xl border text-center transition-all",
                          formData.employee_count === option.value
                            ? "border-primary bg-primary/10 shadow-sm"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        <span className="text-2xl font-bold block">{option.label}</span>
                        <span className="text-xs text-muted-foreground">{option.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 5: Company Description */}
              {step === 5 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-4">
                      <Info className="text-primary" size={32} />
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold mb-2">Tell us more about {formData.name}</h1>
                    <p className="text-muted-foreground">This helps ATLAS understand your context better</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="website">Website (Optional)</Label>
                      <Input
                        id="website"
                        placeholder="https://yourcompany.com"
                        value={formData.website}
                        onChange={(e) => updateField('website', e.target.value)}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Company Description (Optional)</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe what your company does, your main products/services, target market, and key goals..."
                        value={formData.description}
                        onChange={(e) => updateField('description', e.target.value)}
                        className="mt-2 min-h-[120px]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 6: Launch */}
              {step === 6 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4 animate-pulse-slow">
                      <Rocket className="text-primary-foreground" size={40} />
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold mb-2">Ready to Launch!</h1>
                    <p className="text-muted-foreground">Here's a summary of your setup</p>
                  </div>
                  
                  <div className="space-y-3 p-4 rounded-xl bg-secondary/50">
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">Company</span>
                      <span className="font-medium">{formData.name}</span>
                    </div>
                    {formData.gstin && (
                      <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-muted-foreground">GSTIN</span>
                        <span className="font-mono">{formData.gstin}</span>
                      </div>
                    )}
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">Industry</span>
                      <span className="capitalize">{formData.industry.replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">Organization Type</span>
                      <span className="capitalize">{stages.find(s => s.value === formData.stage)?.label || formData.stage}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-muted-foreground">Team Size</span>
                      <span>{teamSizes.find(t => t.value === formData.employee_count)?.label || formData.employee_count} people</span>
                    </div>
                  </div>

                  <Button
                    onClick={handleLaunch}
                    disabled={loading}
                    className="w-full py-6 text-lg btn-primary"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={20} className="animate-spin mr-2" />
                        Setting up your workspace...
                      </>
                    ) : (
                      <>
                        <Rocket size={20} className="mr-2" />
                        Launch ATLAS
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Navigation */}
              {step < 6 && (
                <div className="flex justify-between mt-8 pt-6 border-t border-border">
                  <Button
                    variant="ghost"
                    onClick={handleBack}
                    disabled={step === 1}
                    className="gap-2"
                  >
                    <ArrowLeft size={16} />
                    Back
                  </Button>
                  <Button
                    onClick={handleNext}
                    disabled={!canContinue()}
                    className="gap-2 btn-primary"
                  >
                    Continue
                    <ArrowRight size={16} />
                  </Button>
                </div>
              )}

              {step === 6 && (
                <div className="mt-6 text-center">
                  <Button
                    variant="ghost"
                    onClick={handleBack}
                    className="text-muted-foreground"
                  >
                    <ArrowLeft size={16} className="mr-2" />
                    Go back and edit
                  </Button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
