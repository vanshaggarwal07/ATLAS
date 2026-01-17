import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Scale, 
  MapPin, 
  Building2, 
  FileText, 
  Calculator, 
  ArrowRight, 
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Shield,
  Landmark,
  Receipt,
  BadgePercent,
  Gavel,
  FileCheck,
  AlertCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FormData {
  // Step 1: Business Location & Structure
  businessName: string;
  country: string;
  state: string;
  city: string;
  businessType: string;
  legalStructure: string;
  yearEstablished: string;
  
  // Step 2: Financial Information
  annualRevenue: string;
  employeeCount: string;
  hasInternationalOperations: boolean;
  internationalCountries: string;
  primaryIndustry: string;
  
  // Step 3: Current Compliance Status
  hasGSTRegistration: boolean;
  gstNumber: string;
  hasPANCard: boolean;
  panNumber: string;
  hasTANNumber: boolean;
  tanNumber: string;
  filingFrequency: string;
  lastFilingDate: string;
  
  // Step 4: Specific Concerns
  specificConcerns: string[];
  additionalDetails: string;
}

interface AnalysisResult {
  taxRegime: {
    name: string;
    description: string;
    applicableRates: { category: string; rate: string }[];
    keyFeatures: string[];
  };
  jurisdictions: {
    primary: string;
    secondary: string[];
    considerations: string[];
  };
  complianceGaps: {
    gap: string;
    severity: "high" | "medium" | "low";
    recommendation: string;
  }[];
  taxLiability: {
    estimatedAnnual: string;
    breakdown: { category: string; amount: string; percentage: string }[];
    notes: string[];
  };
  deductionOpportunities: {
    category: string;
    potentialSavings: string;
    description: string;
    requirements: string[];
  }[];
  optimizationRecommendations: {
    title: string;
    description: string;
    potentialImpact: string;
    implementationSteps: string[];
    priority: "high" | "medium" | "low";
  }[];
  legalStructureSuggestions: {
    currentAnalysis: string;
    recommendations: {
      structure: string;
      benefits: string[];
      considerations: string[];
      suitability: string;
    }[];
  };
  nextSteps: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
}

const steps = [
  { id: 1, title: "Business Location", icon: MapPin, description: "Location & legal structure" },
  { id: 2, title: "Financial Info", icon: Calculator, description: "Revenue & operations" },
  { id: 3, title: "Compliance Status", icon: FileCheck, description: "Current registrations" },
  { id: 4, title: "Specific Concerns", icon: AlertCircle, description: "Areas of focus" },
  { id: 5, title: "Analysis Results", icon: Scale, description: "AI recommendations" },
];

const businessTypes = [
  "Manufacturing",
  "Trading",
  "Services",
  "E-commerce",
  "IT/Software",
  "Healthcare",
  "Education",
  "Real Estate",
  "Agriculture",
  "Financial Services",
  "Hospitality",
  "Consulting",
  "Other"
];

const legalStructures = [
  "Sole Proprietorship",
  "Partnership Firm",
  "Limited Liability Partnership (LLP)",
  "Private Limited Company",
  "Public Limited Company",
  "One Person Company (OPC)",
  "Hindu Undivided Family (HUF)",
  "Trust",
  "Society",
  "Section 8 Company"
];

const countries = [
  "India",
  "United States",
  "United Kingdom",
  "United Arab Emirates",
  "Singapore",
  "Australia",
  "Canada",
  "Germany",
  "Other"
];

const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Jammu and Kashmir", "Ladakh"
];

const concerns = [
  { id: "gst_compliance", label: "GST Compliance & Filing" },
  { id: "income_tax", label: "Income Tax Optimization" },
  { id: "tds_tcs", label: "TDS/TCS Compliance" },
  { id: "transfer_pricing", label: "Transfer Pricing" },
  { id: "international_tax", label: "International Taxation" },
  { id: "startup_benefits", label: "Startup Tax Benefits" },
  { id: "legal_structure", label: "Legal Structure Optimization" },
  { id: "audit_requirements", label: "Audit Requirements" },
  { id: "labor_laws", label: "Labor Law Compliance" },
  { id: "intellectual_property", label: "Intellectual Property Protection" },
  { id: "regulatory_compliance", label: "Industry-specific Regulations" },
  { id: "dispute_resolution", label: "Tax Dispute Resolution" }
];

const TaxLegalModule = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [formData, setFormData] = useState<FormData>({
    businessName: "",
    country: "",
    state: "",
    city: "",
    businessType: "",
    legalStructure: "",
    yearEstablished: "",
    annualRevenue: "",
    employeeCount: "",
    hasInternationalOperations: false,
    internationalCountries: "",
    primaryIndustry: "",
    hasGSTRegistration: false,
    gstNumber: "",
    hasPANCard: false,
    panNumber: "",
    hasTANNumber: false,
    tanNumber: "",
    filingFrequency: "",
    lastFilingDate: "",
    specificConcerns: [],
    additionalDetails: ""
  });

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleConcern = (concernId: string) => {
    setFormData(prev => ({
      ...prev,
      specificConcerns: prev.specificConcerns.includes(concernId)
        ? prev.specificConcerns.filter(c => c !== concernId)
        : [...prev.specificConcerns, concernId]
    }));
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
    } else if (currentStep === 4) {
      handleAnalysis();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleAnalysis = async () => {
    setIsAnalyzing(true);
    setCurrentStep(5);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await supabase.functions.invoke("ai-tax-legal", {
        body: { formData },
        headers: session?.access_token ? {
          Authorization: `Bearer ${session.access_token}`
        } : undefined
      });

      if (response.error) {
        throw new Error(response.error.message || "Analysis failed");
      }

      setAnalysisResult(response.data);
      toast.success("Tax & Legal analysis completed!");
    } catch (error: any) {
      console.error("Analysis error:", error);
      toast.error(error.message || "Failed to complete analysis. Please try again.");
      setCurrentStep(4);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name *</Label>
              <Input
                id="businessName"
                placeholder="Enter your business name"
                value={formData.businessName}
                onChange={(e) => updateFormData("businessName", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Country *</Label>
                <Select value={formData.country} onValueChange={(v) => updateFormData("country", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map(country => (
                      <SelectItem key={country} value={country}>{country}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.country === "India" && (
                <div className="space-y-2">
                  <Label>State *</Label>
                  <Select value={formData.state} onValueChange={(v) => updateFormData("state", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {indianStates.map(state => (
                        <SelectItem key={state} value={state}>{state}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  placeholder="Enter city"
                  value={formData.city}
                  onChange={(e) => updateFormData("city", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Legal Structure *</Label>
                <Select value={formData.legalStructure} onValueChange={(v) => updateFormData("legalStructure", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select legal structure" />
                  </SelectTrigger>
                  <SelectContent>
                    {legalStructures.map(structure => (
                      <SelectItem key={structure} value={structure}>{structure}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Business Type *</Label>
                <Select value={formData.businessType} onValueChange={(v) => updateFormData("businessType", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select business type" />
                  </SelectTrigger>
                  <SelectContent>
                    {businessTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="yearEstablished">Year Established</Label>
                <Input
                  id="yearEstablished"
                  type="number"
                  placeholder="e.g., 2020"
                  value={formData.yearEstablished}
                  onChange={(e) => updateFormData("yearEstablished", e.target.value)}
                />
              </div>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Annual Revenue (Approx.)</Label>
                <Select value={formData.annualRevenue} onValueChange={(v) => updateFormData("annualRevenue", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select revenue range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="below_20L">Below ₹20 Lakhs</SelectItem>
                    <SelectItem value="20L_50L">₹20 Lakhs - ₹50 Lakhs</SelectItem>
                    <SelectItem value="50L_1Cr">₹50 Lakhs - ₹1 Crore</SelectItem>
                    <SelectItem value="1Cr_5Cr">₹1 Crore - ₹5 Crores</SelectItem>
                    <SelectItem value="5Cr_10Cr">₹5 Crores - ₹10 Crores</SelectItem>
                    <SelectItem value="10Cr_50Cr">₹10 Crores - ₹50 Crores</SelectItem>
                    <SelectItem value="above_50Cr">Above ₹50 Crores</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Employee Count</Label>
                <Select value={formData.employeeCount} onValueChange={(v) => updateFormData("employeeCount", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee count" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1_5">1-5 employees</SelectItem>
                    <SelectItem value="6_20">6-20 employees</SelectItem>
                    <SelectItem value="21_50">21-50 employees</SelectItem>
                    <SelectItem value="51_100">51-100 employees</SelectItem>
                    <SelectItem value="101_500">101-500 employees</SelectItem>
                    <SelectItem value="above_500">500+ employees</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Primary Industry</Label>
              <Select value={formData.primaryIndustry} onValueChange={(v) => updateFormData("primaryIndustry", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select primary industry" />
                </SelectTrigger>
                <SelectContent>
                  {businessTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="internationalOps"
                  checked={formData.hasInternationalOperations}
                  onCheckedChange={(checked) => updateFormData("hasInternationalOperations", checked)}
                />
                <Label htmlFor="internationalOps">Do you have international operations?</Label>
              </div>

              {formData.hasInternationalOperations && (
                <div className="space-y-2">
                  <Label htmlFor="internationalCountries">Countries of Operation</Label>
                  <Textarea
                    id="internationalCountries"
                    placeholder="List countries where you have operations..."
                    value={formData.internationalCountries}
                    onChange={(e) => updateFormData("internationalCountries", e.target.value)}
                  />
                </div>
              )}
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="gstReg"
                  checked={formData.hasGSTRegistration}
                  onCheckedChange={(checked) => updateFormData("hasGSTRegistration", checked)}
                />
                <Label htmlFor="gstReg">GST Registration</Label>
              </div>

              {formData.hasGSTRegistration && (
                <div className="ml-6 space-y-2">
                  <Label htmlFor="gstNumber">GST Number</Label>
                  <Input
                    id="gstNumber"
                    placeholder="Enter GST number"
                    value={formData.gstNumber}
                    onChange={(e) => updateFormData("gstNumber", e.target.value)}
                  />
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="panCard"
                  checked={formData.hasPANCard}
                  onCheckedChange={(checked) => updateFormData("hasPANCard", checked)}
                />
                <Label htmlFor="panCard">PAN Card</Label>
              </div>

              {formData.hasPANCard && (
                <div className="ml-6 space-y-2">
                  <Label htmlFor="panNumber">PAN Number</Label>
                  <Input
                    id="panNumber"
                    placeholder="Enter PAN number"
                    value={formData.panNumber}
                    onChange={(e) => updateFormData("panNumber", e.target.value)}
                  />
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="tanNumber"
                  checked={formData.hasTANNumber}
                  onCheckedChange={(checked) => updateFormData("hasTANNumber", checked)}
                />
                <Label htmlFor="tanNumber">TAN Number (for TDS)</Label>
              </div>

              {formData.hasTANNumber && (
                <div className="ml-6 space-y-2">
                  <Label htmlFor="tan">TAN Number</Label>
                  <Input
                    id="tan"
                    placeholder="Enter TAN number"
                    value={formData.tanNumber}
                    onChange={(e) => updateFormData("tanNumber", e.target.value)}
                  />
                </div>
              )}
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tax Filing Frequency</Label>
                <Select value={formData.filingFrequency} onValueChange={(v) => updateFormData("filingFrequency", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="annually">Annually</SelectItem>
                    <SelectItem value="not_filing">Not Filing Yet</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastFiling">Last Filing Date</Label>
                <Input
                  id="lastFiling"
                  type="date"
                  value={formData.lastFilingDate}
                  onChange={(e) => updateFormData("lastFilingDate", e.target.value)}
                />
              </div>
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <Label>Select Your Specific Concerns (Select all that apply)</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {concerns.map(concern => (
                  <div key={concern.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={concern.id}
                      checked={formData.specificConcerns.includes(concern.id)}
                      onCheckedChange={() => toggleConcern(concern.id)}
                    />
                    <Label htmlFor={concern.id} className="cursor-pointer">{concern.label}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="additionalDetails">Additional Details or Questions</Label>
              <Textarea
                id="additionalDetails"
                placeholder="Describe any specific tax or legal concerns, pending issues, or questions you have..."
                value={formData.additionalDetails}
                onChange={(e) => updateFormData("additionalDetails", e.target.value)}
                rows={5}
              />
            </div>
          </motion.div>
        );

      case 5:
        if (isAnalyzing) {
          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-16 space-y-6"
            >
              <div className="relative">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
                <Scale className="h-8 w-8 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-primary/60" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold">Analyzing Your Tax & Legal Profile</h3>
                <p className="text-muted-foreground">Our AI is reviewing your business information and generating comprehensive recommendations...</p>
              </div>
            </motion.div>
          );
        }

        if (analysisResult) {
          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              {/* Tax Regime */}
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Landmark className="h-5 w-5 text-primary" />
                    Current Tax Regime
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-lg">{analysisResult.taxRegime.name}</h4>
                    <p className="text-muted-foreground">{analysisResult.taxRegime.description}</p>
                  </div>
                  <div>
                    <h5 className="font-medium mb-2">Applicable Tax Rates:</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {analysisResult.taxRegime.applicableRates.map((rate, idx) => (
                        <div key={idx} className="flex justify-between bg-muted/50 p-2 rounded">
                          <span>{rate.category}</span>
                          <Badge variant="outline">{rate.rate}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h5 className="font-medium mb-2">Key Features:</h5>
                    <ul className="list-disc list-inside space-y-1">
                      {analysisResult.taxRegime.keyFeatures.map((feature, idx) => (
                        <li key={idx} className="text-muted-foreground">{feature}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Jurisdictions */}
              <Card className="border-blue-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-blue-500" />
                    Business Jurisdictions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-blue-500">Primary</Badge>
                    <span className="font-medium">{analysisResult.jurisdictions.primary}</span>
                  </div>
                  {analysisResult.jurisdictions.secondary.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.jurisdictions.secondary.map((jurisdiction, idx) => (
                        <Badge key={idx} variant="outline">{jurisdiction}</Badge>
                      ))}
                    </div>
                  )}
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h5 className="font-medium mb-2">Key Considerations:</h5>
                    <ul className="list-disc list-inside space-y-1">
                      {analysisResult.jurisdictions.considerations.map((consideration, idx) => (
                        <li key={idx} className="text-muted-foreground">{consideration}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Compliance Gaps */}
              <Card className="border-yellow-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    Compliance Gaps Identified
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analysisResult.complianceGaps.map((gap, idx) => (
                      <div key={idx} className={`p-4 rounded-lg border ${
                        gap.severity === 'high' ? 'border-red-500/50 bg-red-500/5' :
                        gap.severity === 'medium' ? 'border-yellow-500/50 bg-yellow-500/5' :
                        'border-green-500/50 bg-green-500/5'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{gap.gap}</span>
                          <Badge variant={
                            gap.severity === 'high' ? 'destructive' :
                            gap.severity === 'medium' ? 'default' : 'secondary'
                          }>
                            {gap.severity.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{gap.recommendation}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Tax Liability Estimation */}
              <Card className="border-green-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-green-500" />
                    Tax Liability Estimation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center p-6 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Estimated Annual Tax Liability</p>
                    <p className="text-3xl font-bold text-green-600">{analysisResult.taxLiability.estimatedAnnual}</p>
                  </div>
                  <div>
                    <h5 className="font-medium mb-3">Breakdown:</h5>
                    <div className="space-y-2">
                      {analysisResult.taxLiability.breakdown.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center p-3 bg-muted/50 rounded">
                          <span>{item.category}</span>
                          <div className="text-right">
                            <span className="font-medium">{item.amount}</span>
                            <span className="text-muted-foreground text-sm ml-2">({item.percentage})</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {analysisResult.taxLiability.notes.length > 0 && (
                    <div className="bg-muted/30 p-4 rounded-lg">
                      <h5 className="font-medium mb-2">Important Notes:</h5>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                        {analysisResult.taxLiability.notes.map((note, idx) => (
                          <li key={idx}>{note}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Deduction Opportunities */}
              <Card className="border-purple-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BadgePercent className="h-5 w-5 text-purple-500" />
                    Deduction Opportunities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {analysisResult.deductionOpportunities.map((opp, idx) => (
                      <div key={idx} className="p-4 border rounded-lg hover:border-purple-500/50 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <h5 className="font-medium">{opp.category}</h5>
                          <Badge className="bg-purple-500">{opp.potentialSavings}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{opp.description}</p>
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">Requirements:</p>
                          <ul className="text-xs text-muted-foreground list-disc list-inside">
                            {opp.requirements.map((req, reqIdx) => (
                              <li key={reqIdx}>{req}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Optimization Recommendations */}
              <Card className="border-orange-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-orange-500" />
                    Tax Optimization Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analysisResult.optimizationRecommendations.map((rec, idx) => (
                      <div key={idx} className={`p-4 rounded-lg border ${
                        rec.priority === 'high' ? 'border-orange-500/50' :
                        rec.priority === 'medium' ? 'border-yellow-500/50' : 'border-gray-300'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-semibold">{rec.title}</h5>
                          <Badge variant={rec.priority === 'high' ? 'destructive' : 'outline'}>
                            {rec.priority} priority
                          </Badge>
                        </div>
                        <p className="text-muted-foreground mb-3">{rec.description}</p>
                        <div className="flex items-center gap-2 mb-3">
                          <TrendingUp className="h-4 w-4 text-green-500" />
                          <span className="text-sm font-medium text-green-600">{rec.potentialImpact}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-2">Implementation Steps:</p>
                          <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                            {rec.implementationSteps.map((step, stepIdx) => (
                              <li key={stepIdx}>{step}</li>
                            ))}
                          </ol>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Legal Structure Suggestions */}
              <Card className="border-indigo-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gavel className="h-5 w-5 text-indigo-500" />
                    Legal Structure Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h5 className="font-medium mb-2">Current Structure Analysis:</h5>
                    <p className="text-muted-foreground">{analysisResult.legalStructureSuggestions.currentAnalysis}</p>
                  </div>
                  <div className="space-y-4">
                    <h5 className="font-medium">Alternative Structure Recommendations:</h5>
                    {analysisResult.legalStructureSuggestions.recommendations.map((rec, idx) => (
                      <div key={idx} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h6 className="font-semibold">{rec.structure}</h6>
                          <Badge variant="outline">{rec.suitability}</Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-green-600 mb-1">Benefits:</p>
                            <ul className="text-sm text-muted-foreground list-disc list-inside">
                              {rec.benefits.map((benefit, bIdx) => (
                                <li key={bIdx}>{benefit}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-yellow-600 mb-1">Considerations:</p>
                            <ul className="text-sm text-muted-foreground list-disc list-inside">
                              {rec.considerations.map((consideration, cIdx) => (
                                <li key={cIdx}>{consideration}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Next Steps */}
              <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-primary/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    Recommended Next Steps
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h5 className="font-semibold mb-3 flex items-center gap-2">
                        <Badge variant="destructive">Immediate</Badge>
                      </h5>
                      <ul className="space-y-2">
                        {analysisResult.nextSteps.immediate.map((step, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-semibold mb-3 flex items-center gap-2">
                        <Badge>Short-term</Badge>
                      </h5>
                      <ul className="space-y-2">
                        {analysisResult.nextSteps.shortTerm.map((step, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-semibold mb-3 flex items-center gap-2">
                        <Badge variant="secondary">Long-term</Badge>
                      </h5>
                      <ul className="space-y-2">
                        {analysisResult.nextSteps.longTerm.map((step, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-center">
                <Button onClick={() => { setCurrentStep(1); setAnalysisResult(null); }} variant="outline">
                  Start New Analysis
                </Button>
              </div>
            </motion.div>
          );
        }

        return null;

      default:
        return null;
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.businessName && formData.country && formData.legalStructure && formData.businessType;
      case 2:
        return true;
      case 3:
        return true;
      case 4:
        return true;
      default:
        return true;
    }
  };

  return (
    <div className="container max-w-5xl mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Scale className="h-10 w-10 text-primary" />
            <h1 className="text-3xl font-bold">AI Tax & Legal Module</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Get comprehensive tax compliance analysis, liability estimation, and legal structure recommendations powered by AI
          </p>
        </div>

        {/* Progress Steps */}
        {currentStep < 5 && (
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {steps.slice(0, 4).map((step, idx) => (
              <React.Fragment key={step.id}>
                <div
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                    currentStep === step.id
                      ? "bg-primary text-primary-foreground"
                      : currentStep > step.id
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <step.icon className="h-4 w-4" />
                  <span className="text-sm font-medium hidden sm:inline">{step.title}</span>
                </div>
                {idx < 3 && <ArrowRight className="h-4 w-4 text-muted-foreground" />}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Progress Bar */}
        {currentStep < 5 && (
          <Progress value={(currentStep / 4) * 100} className="h-2" />
        )}

        {/* Main Content */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {React.createElement(steps[currentStep - 1].icon, { className: "h-5 w-5" })}
              {steps[currentStep - 1].title}
            </CardTitle>
            <CardDescription>{steps[currentStep - 1].description}</CardDescription>
          </CardHeader>
          <CardContent>
            <AnimatePresence mode="wait">
              {currentStep === 5 ? (
                <ScrollArea className="h-[60vh]">
                  {renderStepContent()}
                </ScrollArea>
              ) : (
                renderStepContent()
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        {currentStep < 5 && (
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={!isStepValid()}
            >
              {currentStep === 4 ? (
                <>
                  Analyze
                  <Scale className="h-4 w-4 ml-2" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default TaxLegalModule;
