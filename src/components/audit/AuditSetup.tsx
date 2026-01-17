import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ClipboardCheck, Loader2 } from 'lucide-react';

interface AuditSetupProps {
  onSubmit: (data: {
    title: string;
    audit_type: string;
    accounting_standard: string;
    industry: string;
    financial_year: string;
    currency: string;
  }) => void;
  isLoading: boolean;
}

const AUDIT_TYPES = [
  { value: 'financial', label: 'Financial Audit', description: 'Review of financial statements and records' },
  { value: 'internal', label: 'Internal Audit', description: 'Evaluate internal controls and processes' },
  { value: 'compliance', label: 'Compliance Audit', description: 'Verify adherence to regulations and policies' },
  { value: 'tax', label: 'Tax Audit', description: 'Review of tax compliance and reporting' },
  { value: 'custom', label: 'Custom Audit', description: 'Tailored audit based on specific requirements' },
];

const ACCOUNTING_STANDARDS = [
  { value: 'ifrs', label: 'IFRS', description: 'International Financial Reporting Standards' },
  { value: 'gaap', label: 'GAAP', description: 'Generally Accepted Accounting Principles' },
  { value: 'local', label: 'Local Standards', description: 'Country-specific accounting standards' },
  { value: 'custom', label: 'Custom', description: 'Custom accounting framework' },
];

const INDUSTRIES = [
  'Technology',
  'Healthcare',
  'Finance & Banking',
  'Retail & E-commerce',
  'Manufacturing',
  'Real Estate',
  'Education',
  'Hospitality',
  'Consulting',
  'Other',
];

const CURRENCIES = [
  { value: 'INR', label: 'INR - Indian Rupee' },
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'GBP', label: 'GBP - British Pound' },
  { value: 'AED', label: 'AED - UAE Dirham' },
  { value: 'SGD', label: 'SGD - Singapore Dollar' },
];

export function AuditSetup({ onSubmit, isLoading }: AuditSetupProps) {
  const [formData, setFormData] = useState({
    title: '',
    audit_type: '',
    accounting_standard: '',
    industry: '',
    financial_year: '',
    currency: 'INR',
  });

  const currentYear = new Date().getFullYear();
  const financialYears = Array.from({ length: 5 }, (_, i) => {
    const year = currentYear - i;
    return `${year - 1}-${year}`;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.audit_type || !formData.accounting_standard) {
      return;
    }
    onSubmit(formData);
  };

  const selectedAuditType = AUDIT_TYPES.find(t => t.value === formData.audit_type);

  return (
    <form onSubmit={handleSubmit}>
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <ClipboardCheck className="w-8 h-8 text-primary" />
          </div>
          <CardTitle>Configure Your Audit</CardTitle>
          <CardDescription>
            Set up the parameters for your AI-powered audit session
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Audit Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Audit Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Q4 2024 Financial Audit"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          {/* Audit Type */}
          <div className="space-y-2">
            <Label>Audit Type *</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {AUDIT_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, audit_type: type.value }))}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    formData.audit_type === type.value
                      ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="font-medium">{type.label}</div>
                  <div className="text-sm text-muted-foreground">{type.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Accounting Standard */}
          <div className="space-y-2">
            <Label>Accounting Standard *</Label>
            <div className="grid grid-cols-2 gap-3">
              {ACCOUNTING_STANDARDS.map((standard) => (
                <button
                  key={standard.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, accounting_standard: standard.value }))}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    formData.accounting_standard === standard.value
                      ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="font-medium">{standard.label}</div>
                  <div className="text-sm text-muted-foreground">{standard.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Industry and Financial Year */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Select
                value={formData.industry}
                onValueChange={(value) => setFormData(prev => ({ ...prev, industry: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRIES.map((industry) => (
                    <SelectItem key={industry} value={industry.toLowerCase()}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="financial_year">Financial Year</Label>
              <Select
                value={formData.financial_year}
                onValueChange={(value) => setFormData(prev => ({ ...prev, financial_year: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select FY" />
                </SelectTrigger>
                <SelectContent>
                  {financialYears.map((fy) => (
                    <SelectItem key={fy} value={fy}>
                      FY {fy}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Currency */}
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Select
              value={formData.currency}
              onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((currency) => (
                  <SelectItem key={currency.value} value={currency.value}>
                    {currency.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isLoading || !formData.title || !formData.audit_type || !formData.accounting_standard}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Continue to File Upload'
            )}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
