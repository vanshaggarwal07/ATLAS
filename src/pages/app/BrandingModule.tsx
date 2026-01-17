import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCompany } from '@/hooks/useCompany';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Palette,
  Target,
  Globe,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Building2,
  Users,
  MessageSquare,
  Layout,
  DollarSign,
  Loader2,
  Download,
  RefreshCw,
  Lightbulb,
  Check,
  ArrowRight,
  Zap,
  FileText,
  Image as ImageIcon,
  Megaphone,
} from 'lucide-react';

const STEPS = [
  { id: 1, name: 'Business Info', icon: Building2 },
  { id: 2, name: 'Brand Identity', icon: Palette },
  { id: 3, name: 'Target Audience', icon: Users },
  { id: 4, name: 'Digital Goals', icon: Globe },
  { id: 5, name: 'AI Analysis', icon: Sparkles },
];

const INDUSTRIES = [
  'Technology & SaaS',
  'E-commerce & Retail',
  'Healthcare & Wellness',
  'Education & EdTech',
  'Finance & FinTech',
  'Food & Beverage',
  'Fashion & Apparel',
  'Real Estate',
  'Manufacturing',
  'Professional Services',
  'Hospitality & Tourism',
  'Media & Entertainment',
  'Agriculture & AgriTech',
  'Logistics & Supply Chain',
  'Other',
];

const BRAND_TONES = [
  { id: 'professional', label: 'Professional', description: 'Corporate, trustworthy, authoritative' },
  { id: 'friendly', label: 'Friendly', description: 'Approachable, warm, conversational' },
  { id: 'innovative', label: 'Innovative', description: 'Modern, cutting-edge, forward-thinking' },
  { id: 'luxury', label: 'Luxury', description: 'Premium, exclusive, sophisticated' },
  { id: 'playful', label: 'Playful', description: 'Fun, energetic, youthful' },
  { id: 'minimalist', label: 'Minimalist', description: 'Clean, simple, elegant' },
  { id: 'bold', label: 'Bold', description: 'Daring, confident, impactful' },
  { id: 'eco-friendly', label: 'Eco-Friendly', description: 'Sustainable, natural, conscious' },
];

const DIGITAL_GOALS = [
  { id: 'brand_awareness', label: 'Brand Awareness', icon: Megaphone },
  { id: 'lead_generation', label: 'Lead Generation', icon: Target },
  { id: 'online_sales', label: 'Online Sales', icon: DollarSign },
  { id: 'customer_engagement', label: 'Customer Engagement', icon: MessageSquare },
  { id: 'content_marketing', label: 'Content Marketing', icon: FileText },
  { id: 'social_presence', label: 'Social Media Presence', icon: Users },
  { id: 'website_traffic', label: 'Website Traffic', icon: Globe },
  { id: 'app_downloads', label: 'App Downloads', icon: Zap },
];

const AUDIENCE_AGE_GROUPS = [
  '18-24 (Gen Z)',
  '25-34 (Millennials)',
  '35-44 (Gen X)',
  '45-54 (Baby Boomers)',
  '55+ (Seniors)',
  'All Ages',
];

interface BrandingFormData {
  // Business Info
  businessName: string;
  industry: string;
  businessDescription: string;
  businessStage: string;
  yearFounded: string;
  teamSize: string;
  currentRevenue: string;
  
  // Brand Identity
  brandTone: string[];
  existingBranding: boolean;
  brandColors: string;
  brandValues: string;
  competitors: string;
  uniqueSellingPoint: string;
  
  // Target Audience
  targetAgeGroups: string[];
  targetGender: string;
  targetLocation: string;
  targetIncome: string;
  targetPainPoints: string;
  customerPersona: string;
  
  // Digital Goals
  digitalGoals: string[];
  budget: string;
  timeline: string;
  hasWebsite: boolean;
  hasSocialMedia: boolean;
  currentChallenges: string;
}

interface AIBrandingResult {
  brandStrategy: {
    summary: string;
    missionStatement: string;
    visionStatement: string;
    coreValues: string[];
  };
  visualIdentity: {
    colorPalette: { name: string; hex: string; usage: string }[];
    typography: { primary: string; secondary: string; accent: string };
    logoGuidelines: string[];
    visualStyle: string;
  };
  websiteStructure: {
    pages: { name: string; purpose: string; keyElements: string[] }[];
    recommendedFeatures: string[];
    techStack: string[];
  };
  brandKit: {
    essentialAssets: string[];
    socialMediaTemplates: string[];
    marketingCollateral: string[];
  };
  costEstimate: {
    logoDesign: { low: number; high: number };
    websiteDevelopment: { low: number; high: number };
    brandCollateral: { low: number; high: number };
    digitalMarketing: { low: number; high: number };
    total: { low: number; high: number };
  };
  actionPlan: {
    phase: string;
    duration: string;
    tasks: string[];
    priority: string;
  }[];
  tips: string[];
}

const initialFormData: BrandingFormData = {
  businessName: '',
  industry: '',
  businessDescription: '',
  businessStage: 'idea',
  yearFounded: '',
  teamSize: '1-5',
  currentRevenue: 'pre-revenue',
  brandTone: [],
  existingBranding: false,
  brandColors: '',
  brandValues: '',
  competitors: '',
  uniqueSellingPoint: '',
  targetAgeGroups: [],
  targetGender: 'all',
  targetLocation: '',
  targetIncome: 'middle',
  targetPainPoints: '',
  customerPersona: '',
  digitalGoals: [],
  budget: 'moderate',
  timeline: '3-6 months',
  hasWebsite: false,
  hasSocialMedia: false,
  currentChallenges: '',
};

export default function BrandingModule() {
  const { company } = useCompany();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<BrandingFormData>({
    ...initialFormData,
    businessName: company?.name || '',
    industry: company?.industry || '',
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AIBrandingResult | null>(null);

  const updateFormData = (field: keyof BrandingFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayValue = (field: 'brandTone' | 'targetAgeGroups' | 'digitalGoals', value: string) => {
    setFormData(prev => {
      const current = prev[field] as string[];
      if (current.includes(value)) {
        return { ...prev, [field]: current.filter(v => v !== value) };
      }
      return { ...prev, [field]: [...current, value] };
    });
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.businessName && formData.industry && formData.businessDescription;
      case 2:
        return formData.brandTone.length > 0 && formData.uniqueSellingPoint;
      case 3:
        return formData.targetAgeGroups.length > 0 && formData.targetLocation;
      case 4:
        return formData.digitalGoals.length > 0;
      default:
        return true;
    }
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-branding', {
        body: { formData },
      });

      if (error) throw error;

      setResult(data.result);
      toast({
        title: 'Analysis Complete!',
        description: 'Your AI-powered branding strategy is ready.',
      });
    } catch (error: any) {
      console.error('Branding analysis error:', error);
      toast({
        title: 'Analysis Failed',
        description: error.message || 'Failed to generate branding strategy. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(prev => prev + 1);
    } else if (currentStep === 5 && !result) {
      handleAnalyze();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const resetModule = () => {
    setCurrentStep(1);
    setFormData({
      ...initialFormData,
      businessName: company?.name || '',
      industry: company?.industry || '',
    });
    setResult(null);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <BusinessInfoStep formData={formData} updateFormData={updateFormData} />;
      case 2:
        return <BrandIdentityStep formData={formData} updateFormData={updateFormData} toggleArrayValue={toggleArrayValue} />;
      case 3:
        return <TargetAudienceStep formData={formData} updateFormData={updateFormData} toggleArrayValue={toggleArrayValue} />;
      case 4:
        return <DigitalGoalsStep formData={formData} updateFormData={updateFormData} toggleArrayValue={toggleArrayValue} />;
      case 5:
        return result ? (
          <ResultsView result={result} onReset={resetModule} />
        ) : (
          <AnalysisPreview formData={formData} isAnalyzing={isAnalyzing} />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="heading-subsection flex items-center gap-2">
            <Palette className="text-primary" />
            AI Design & Branding Module
          </h1>
          <p className="text-muted-foreground mt-1">
            Build your MSME/Startup brand identity with AI-powered insights
          </p>
        </div>
        {result && (
          <Button variant="outline" onClick={resetModule} className="gap-2">
            <RefreshCw size={16} />
            Start Over
          </Button>
        )}
      </div>

      {/* Progress Steps */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      currentStep > step.id
                        ? 'bg-primary text-primary-foreground'
                        : currentStep === step.id
                        ? 'bg-primary/20 text-primary border-2 border-primary'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {currentStep > step.id ? (
                      <Check size={18} />
                    ) : (
                      <step.icon size={18} />
                    )}
                  </div>
                  <span className={`text-xs mt-2 font-medium ${
                    currentStep >= step.id ? 'text-primary' : 'text-muted-foreground'
                  }`}>
                    {step.name}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`w-16 md:w-24 h-0.5 mx-2 ${
                    currentStep > step.id ? 'bg-primary' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <Progress value={(currentStep / STEPS.length) * 100} className="h-1" />
        </CardContent>
      </Card>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderStepContent()}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      {!result && (
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="gap-2"
          >
            <ChevronLeft size={18} />
            Previous
          </Button>
          <Button
            onClick={handleNext}
            disabled={!canProceed() || isAnalyzing}
            className="gap-2"
          >
            {currentStep === 5 ? (
              isAnalyzing ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Generate Strategy
                </>
              )
            ) : (
              <>
                Next
                <ChevronRight size={18} />
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

// Step 1: Business Info
function BusinessInfoStep({
  formData,
  updateFormData,
}: {
  formData: BrandingFormData;
  updateFormData: (field: keyof BrandingFormData, value: any) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="text-primary" />
          Tell us about your business
        </CardTitle>
        <CardDescription>
          Help us understand your MSME or startup to create the perfect brand strategy
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="businessName">Business Name *</Label>
            <Input
              id="businessName"
              placeholder="Enter your business name"
              value={formData.businessName}
              onChange={e => updateFormData('businessName', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="industry">Industry *</Label>
            <Select
              value={formData.industry}
              onValueChange={value => updateFormData('industry', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your industry" />
              </SelectTrigger>
              <SelectContent>
                {INDUSTRIES.map(industry => (
                  <SelectItem key={industry} value={industry.toLowerCase().replace(/\s+/g, '_')}>
                    {industry}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Business Description *</Label>
          <Textarea
            id="description"
            placeholder="Describe what your business does, the products/services you offer..."
            value={formData.businessDescription}
            onChange={e => updateFormData('businessDescription', e.target.value)}
            rows={4}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label>Business Stage</Label>
            <Select
              value={formData.businessStage}
              onValueChange={value => updateFormData('businessStage', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="idea">Idea Stage</SelectItem>
                <SelectItem value="mvp">MVP/Prototype</SelectItem>
                <SelectItem value="early">Early Stage (0-2 years)</SelectItem>
                <SelectItem value="growth">Growth Stage (2-5 years)</SelectItem>
                <SelectItem value="established">Established (5+ years)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Team Size</Label>
            <Select
              value={formData.teamSize}
              onValueChange={value => updateFormData('teamSize', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="solo">Solo Founder</SelectItem>
                <SelectItem value="1-5">1-5 employees</SelectItem>
                <SelectItem value="6-20">6-20 employees</SelectItem>
                <SelectItem value="21-50">21-50 employees</SelectItem>
                <SelectItem value="50+">50+ employees</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Current Revenue</Label>
            <Select
              value={formData.currentRevenue}
              onValueChange={value => updateFormData('currentRevenue', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pre-revenue">Pre-Revenue</SelectItem>
                <SelectItem value="0-5l">₹0 - 5 Lakhs</SelectItem>
                <SelectItem value="5-25l">₹5 - 25 Lakhs</SelectItem>
                <SelectItem value="25l-1cr">₹25L - 1 Crore</SelectItem>
                <SelectItem value="1-5cr">₹1 - 5 Crores</SelectItem>
                <SelectItem value="5cr+">₹5 Crores+</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Step 2: Brand Identity
function BrandIdentityStep({
  formData,
  updateFormData,
  toggleArrayValue,
}: {
  formData: BrandingFormData;
  updateFormData: (field: keyof BrandingFormData, value: any) => void;
  toggleArrayValue: (field: 'brandTone' | 'targetAgeGroups' | 'digitalGoals', value: string) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="text-primary" />
          Define your brand identity
        </CardTitle>
        <CardDescription>
          Choose the tone and personality that represents your brand
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <Label>Brand Tone (Select up to 3) *</Label>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {BRAND_TONES.map(tone => (
              <div
                key={tone.id}
                onClick={() => {
                  if (formData.brandTone.includes(tone.id) || formData.brandTone.length < 3) {
                    toggleArrayValue('brandTone', tone.id);
                  }
                }}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  formData.brandTone.includes(tone.id)
                    ? 'border-primary bg-primary/5'
                    : 'border-muted hover:border-primary/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{tone.label}</span>
                  {formData.brandTone.includes(tone.id) && (
                    <Check size={16} className="text-primary" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{tone.description}</p>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        <div className="flex items-center space-x-2">
          <Checkbox
            id="existingBranding"
            checked={formData.existingBranding}
            onCheckedChange={checked => updateFormData('existingBranding', checked)}
          />
          <Label htmlFor="existingBranding" className="cursor-pointer">
            I already have some branding elements (logo, colors, etc.)
          </Label>
        </div>

        {formData.existingBranding && (
          <div className="space-y-2">
            <Label>Current Brand Colors</Label>
            <Input
              placeholder="e.g., Blue and white, #2563EB"
              value={formData.brandColors}
              onChange={e => updateFormData('brandColors', e.target.value)}
            />
          </div>
        )}

        <div className="space-y-2">
          <Label>Brand Values</Label>
          <Textarea
            placeholder="What values does your brand stand for? (e.g., Innovation, Sustainability, Customer-First)"
            value={formData.brandValues}
            onChange={e => updateFormData('brandValues', e.target.value)}
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="usp">Unique Selling Point (USP) *</Label>
          <Textarea
            id="usp"
            placeholder="What makes your business different from competitors?"
            value={formData.uniqueSellingPoint}
            onChange={e => updateFormData('uniqueSellingPoint', e.target.value)}
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label>Key Competitors</Label>
          <Textarea
            placeholder="List your main competitors (helps us differentiate your brand)"
            value={formData.competitors}
            onChange={e => updateFormData('competitors', e.target.value)}
            rows={2}
          />
        </div>
      </CardContent>
    </Card>
  );
}

// Step 3: Target Audience
function TargetAudienceStep({
  formData,
  updateFormData,
  toggleArrayValue,
}: {
  formData: BrandingFormData;
  updateFormData: (field: keyof BrandingFormData, value: any) => void;
  toggleArrayValue: (field: 'brandTone' | 'targetAgeGroups' | 'digitalGoals', value: string) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="text-primary" />
          Define your target audience
        </CardTitle>
        <CardDescription>
          Understanding your ideal customer helps create resonant branding
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <Label>Target Age Groups *</Label>
          <div className="flex flex-wrap gap-2">
            {AUDIENCE_AGE_GROUPS.map(age => (
              <Badge
                key={age}
                variant={formData.targetAgeGroups.includes(age) ? 'default' : 'outline'}
                className="cursor-pointer px-4 py-2"
                onClick={() => toggleArrayValue('targetAgeGroups', age)}
              >
                {age}
              </Badge>
            ))}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Target Gender</Label>
            <Select
              value={formData.targetGender}
              onValueChange={value => updateFormData('targetGender', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genders</SelectItem>
                <SelectItem value="male">Primarily Male</SelectItem>
                <SelectItem value="female">Primarily Female</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Target Income Level</Label>
            <Select
              value={formData.targetIncome}
              onValueChange={value => updateFormData('targetIncome', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="budget">Budget Conscious</SelectItem>
                <SelectItem value="middle">Middle Income</SelectItem>
                <SelectItem value="upper-middle">Upper Middle</SelectItem>
                <SelectItem value="premium">Premium/Luxury</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Target Location/Region *</Label>
          <Input
            id="location"
            placeholder="e.g., Pan India, Metro cities, Tier 2 cities, Global"
            value={formData.targetLocation}
            onChange={e => updateFormData('targetLocation', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Customer Pain Points</Label>
          <Textarea
            placeholder="What problems does your target audience face that you solve?"
            value={formData.targetPainPoints}
            onChange={e => updateFormData('targetPainPoints', e.target.value)}
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label>Ideal Customer Persona</Label>
          <Textarea
            placeholder="Describe your ideal customer (e.g., 'Busy working professionals aged 25-35 who value convenience...')"
            value={formData.customerPersona}
            onChange={e => updateFormData('customerPersona', e.target.value)}
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  );
}

// Step 4: Digital Goals
function DigitalGoalsStep({
  formData,
  updateFormData,
  toggleArrayValue,
}: {
  formData: BrandingFormData;
  updateFormData: (field: keyof BrandingFormData, value: any) => void;
  toggleArrayValue: (field: 'brandTone' | 'targetAgeGroups' | 'digitalGoals', value: string) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="text-primary" />
          Set your digital goals
        </CardTitle>
        <CardDescription>
          Define your online presence objectives and budget
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <Label>Digital Goals (Select all that apply) *</Label>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {DIGITAL_GOALS.map(goal => (
              <div
                key={goal.id}
                onClick={() => toggleArrayValue('digitalGoals', goal.id)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  formData.digitalGoals.includes(goal.id)
                    ? 'border-primary bg-primary/5'
                    : 'border-muted hover:border-primary/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <goal.icon size={18} className={formData.digitalGoals.includes(goal.id) ? 'text-primary' : 'text-muted-foreground'} />
                  <span className="font-medium text-sm">{goal.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Budget Range</Label>
            <Select
              value={formData.budget}
              onValueChange={value => updateFormData('budget', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="minimal">Minimal (₹10K - 50K)</SelectItem>
                <SelectItem value="moderate">Moderate (₹50K - 2L)</SelectItem>
                <SelectItem value="standard">Standard (₹2L - 5L)</SelectItem>
                <SelectItem value="premium">Premium (₹5L - 10L)</SelectItem>
                <SelectItem value="enterprise">Enterprise (₹10L+)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Timeline</Label>
            <Select
              value={formData.timeline}
              onValueChange={value => updateFormData('timeline', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1 month">1 Month (Fast)</SelectItem>
                <SelectItem value="1-3 months">1-3 Months</SelectItem>
                <SelectItem value="3-6 months">3-6 Months</SelectItem>
                <SelectItem value="6-12 months">6-12 Months</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasWebsite"
              checked={formData.hasWebsite}
              onCheckedChange={checked => updateFormData('hasWebsite', checked)}
            />
            <Label htmlFor="hasWebsite" className="cursor-pointer">
              I already have a website
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasSocialMedia"
              checked={formData.hasSocialMedia}
              onCheckedChange={checked => updateFormData('hasSocialMedia', checked)}
            />
            <Label htmlFor="hasSocialMedia" className="cursor-pointer">
              I have social media presence
            </Label>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Current Challenges</Label>
          <Textarea
            placeholder="What are your biggest challenges with branding and digital presence?"
            value={formData.currentChallenges}
            onChange={e => updateFormData('currentChallenges', e.target.value)}
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  );
}

// Step 5: Analysis Preview (before results)
function AnalysisPreview({
  formData,
  isAnalyzing,
}: {
  formData: BrandingFormData;
  isAnalyzing: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="text-primary" />
          Ready to generate your brand strategy
        </CardTitle>
        <CardDescription>
          Review your inputs and generate AI-powered recommendations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isAnalyzing ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-primary/20 rounded-full" />
              <div className="absolute top-0 left-0 w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
            <h3 className="text-lg font-semibold">Analyzing your inputs...</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Our AI is creating a comprehensive branding strategy, website structure, brand kit suggestions, and cost estimates for your {formData.businessName}
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 rounded-lg bg-muted/50">
                <h4 className="font-medium flex items-center gap-2 mb-2">
                  <Building2 size={16} className="text-primary" />
                  Business
                </h4>
                <p className="text-sm text-muted-foreground">{formData.businessName}</p>
                <p className="text-sm text-muted-foreground capitalize">{formData.industry.replace(/_/g, ' ')}</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <h4 className="font-medium flex items-center gap-2 mb-2">
                  <Palette size={16} className="text-primary" />
                  Brand Tone
                </h4>
                <div className="flex flex-wrap gap-1">
                  {formData.brandTone.map(tone => (
                    <Badge key={tone} variant="secondary" className="capitalize">
                      {tone}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <h4 className="font-medium flex items-center gap-2 mb-2">
                  <Users size={16} className="text-primary" />
                  Target Audience
                </h4>
                <p className="text-sm text-muted-foreground">{formData.targetAgeGroups.join(', ')}</p>
                <p className="text-sm text-muted-foreground">{formData.targetLocation}</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <h4 className="font-medium flex items-center gap-2 mb-2">
                  <Globe size={16} className="text-primary" />
                  Digital Goals
                </h4>
                <div className="flex flex-wrap gap-1">
                  {formData.digitalGoals.slice(0, 3).map(goal => (
                    <Badge key={goal} variant="secondary" className="capitalize">
                      {goal.replace(/_/g, ' ')}
                    </Badge>
                  ))}
                  {formData.digitalGoals.length > 3 && (
                    <Badge variant="outline">+{formData.digitalGoals.length - 3} more</Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg border-2 border-dashed border-primary/30 bg-primary/5 text-center">
              <Lightbulb size={24} className="text-primary mx-auto mb-2" />
              <h4 className="font-medium">What you'll get:</h4>
              <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                <li>✓ Complete brand strategy with mission & vision</li>
                <li>✓ Visual identity guidelines (colors, typography)</li>
                <li>✓ Website structure preview with page recommendations</li>
                <li>✓ Brand kit suggestions and marketing collateral</li>
                <li>✓ Detailed cost estimates for each component</li>
                <li>✓ Phased action plan with timeline</li>
              </ul>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// Results View
function ResultsView({
  result,
  onReset,
}: {
  result: AIBrandingResult;
  onReset: () => void;
}) {
  return (
    <ScrollArea className="h-[calc(100vh-300px)]">
      <div className="space-y-6 pr-4">
        {/* Brand Strategy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="text-primary" />
              Brand Strategy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{result.brandStrategy.summary}</p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <h4 className="font-semibold mb-2">Mission Statement</h4>
                <p className="text-sm">{result.brandStrategy.missionStatement}</p>
              </div>
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <h4 className="font-semibold mb-2">Vision Statement</h4>
                <p className="text-sm">{result.brandStrategy.visionStatement}</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Core Values</h4>
              <div className="flex flex-wrap gap-2">
                {result.brandStrategy.coreValues.map((value, i) => (
                  <Badge key={i} variant="secondary">{value}</Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Visual Identity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="text-primary" />
              Visual Identity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-3">Color Palette</h4>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                {result.visualIdentity.colorPalette.map((color, i) => (
                  <div key={i} className="rounded-lg overflow-hidden border">
                    <div
                      className="h-16 w-full"
                      style={{ backgroundColor: color.hex }}
                    />
                    <div className="p-2">
                      <p className="font-medium text-sm">{color.name}</p>
                      <p className="text-xs text-muted-foreground">{color.hex}</p>
                      <p className="text-xs text-muted-foreground">{color.usage}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <Separator />
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <h4 className="font-semibold mb-2">Primary Font</h4>
                <p className="text-muted-foreground">{result.visualIdentity.typography.primary}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Secondary Font</h4>
                <p className="text-muted-foreground">{result.visualIdentity.typography.secondary}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Accent Font</h4>
                <p className="text-muted-foreground">{result.visualIdentity.typography.accent}</p>
              </div>
            </div>
            <Separator />
            <div>
              <h4 className="font-semibold mb-2">Logo Guidelines</h4>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                {result.visualIdentity.logoGuidelines.map((guideline, i) => (
                  <li key={i}>{guideline}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Website Structure */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layout className="text-primary" />
              Website Structure Preview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {result.websiteStructure.pages.map((page, i) => (
                <div key={i} className="p-4 rounded-lg border">
                  <h4 className="font-semibold flex items-center gap-2">
                    <ArrowRight size={14} className="text-primary" />
                    {page.name}
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">{page.purpose}</p>
                  <div className="mt-2">
                    <p className="text-xs font-medium">Key Elements:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {page.keyElements.map((el, j) => (
                        <Badge key={j} variant="outline" className="text-xs">{el}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Separator />
            <div>
              <h4 className="font-semibold mb-2">Recommended Features</h4>
              <div className="flex flex-wrap gap-2">
                {result.websiteStructure.recommendedFeatures.map((feature, i) => (
                  <Badge key={i} variant="secondary">{feature}</Badge>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Suggested Tech Stack</h4>
              <div className="flex flex-wrap gap-2">
                {result.websiteStructure.techStack.map((tech, i) => (
                  <Badge key={i}>{tech}</Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Brand Kit */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="text-primary" />
              Brand Kit Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <h4 className="font-semibold mb-2">Essential Assets</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  {result.brandKit.essentialAssets.map((asset, i) => (
                    <li key={i}>{asset}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Social Media Templates</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  {result.brandKit.socialMediaTemplates.map((template, i) => (
                    <li key={i}>{template}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Marketing Collateral</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  {result.brandKit.marketingCollateral.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cost Estimates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="text-primary" />
              Cost Estimates (INR)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(result.costEstimate).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <span className="text-muted-foreground">
                    ₹{value.low.toLocaleString('en-IN')} - ₹{value.high.toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Plan */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="text-primary" />
              Action Plan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {result.actionPlan.map((phase, i) => (
              <div key={i} className="p-4 rounded-lg border">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{phase.phase}</h4>
                  <div className="flex items-center gap-2">
                    <Badge variant={phase.priority === 'High' ? 'destructive' : phase.priority === 'Medium' ? 'default' : 'secondary'}>
                      {phase.priority}
                    </Badge>
                    <Badge variant="outline">{phase.duration}</Badge>
                  </div>
                </div>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  {phase.tasks.map((task, j) => (
                    <li key={j}>{task}</li>
                  ))}
                </ul>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="text-primary" />
              Pro Tips for Your Brand
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {result.tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Check size={16} className="text-green-500 mt-1 shrink-0" />
                  <span className="text-muted-foreground">{tip}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4 pb-6">
          <Button className="gap-2" onClick={() => window.print()}>
            <Download size={18} />
            Download Report
          </Button>
          <Button variant="outline" onClick={onReset} className="gap-2">
            <RefreshCw size={18} />
            Create New Strategy
          </Button>
        </div>
      </div>
    </ScrollArea>
  );
}
