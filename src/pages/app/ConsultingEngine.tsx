import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Upload, 
  FileText, 
  Target, 
  GitBranch, 
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Sparkles,
  AlertTriangle,
  Lightbulb,
  FileSpreadsheet,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { useCompany } from '@/hooks/useCompany';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { FileUploadZone } from '@/components/app/FileUploadZone';
import { ParsedData } from '@/hooks/useFileParser';
import { VoiceInput } from '@/components/app/VoiceInput';
import { TextToSpeech } from '@/components/app/TextToSpeech';
import { DataSecurityBadge } from '@/components/security/DataSecurityBadge';
import { SecurityInfoPanel } from '@/components/security/SecurityInfoPanel';

const problemDomains = [
  { value: 'growth', label: 'Growth Strategy', icon: '📈', description: 'Scale faster and acquire more customers' },
  { value: 'pricing', label: 'Pricing & Revenue', icon: '💵', description: 'Optimize pricing and increase revenue' },
  { value: 'operations', label: 'Operations', icon: '⚙️', description: 'Improve efficiency and reduce costs' },
  { value: 'fundraising', label: 'Fundraising', icon: '🎯', description: 'Prepare for and execute capital raise' },
  { value: 'hiring', label: 'Hiring & Team', icon: '👥', description: 'Build and scale the right team' },
  { value: 'product_strategy', label: 'Product Strategy', icon: '🚀', description: 'Decide what to build next' },
];

const datasetTypes = [
  { value: 'sales', label: 'Sales Data', icon: '💰', description: 'Revenue, transactions, deals' },
  { value: 'customers', label: 'Customer Data', icon: '👥', description: 'Users, segments, demographics' },
  { value: 'costs', label: 'Cost Data', icon: '📊', description: 'Expenses, budgets, overheads' },
  { value: 'operations', label: 'Operations Data', icon: '⚙️', description: 'Processes, efficiency metrics' },
  { value: 'marketing', label: 'Marketing Data', icon: '📢', description: 'Campaigns, channels, conversions' },
  { value: 'other', label: 'Other Data', icon: '📁', description: 'Any other business data' },
];

const steps = [
  { id: 1, title: 'Upload Data', icon: Upload },
  { id: 2, title: 'Define Problem', icon: FileText },
  { id: 3, title: 'AI Diagnosis', icon: Brain },
  { id: 4, title: 'Scenarios', icon: GitBranch },
  { id: 5, title: 'Execution Plan', icon: Target },
];

interface UploadedDataset {
  id: string;
  name: string;
  type: string;
  summary: string;
  rowCount: number;
  rawData?: Record<string, unknown>[];
  headers?: string[];
}

interface DiagnosisResult {
  rootCause: string;
  findings: { type: string; text: string }[];
  confidence: number;
  keyMetrics: string[];
  immediateActions: string[];
}

interface Scenario {
  id: string;
  name: string;
  description: string;
  risk: string;
  timeToImpact: string;
  confidence: number;
  expectedOutcome: string;
  keyActions: string[];
  recommended: boolean;
}

interface ExecutionPlan {
  planTitle: string;
  planDescription: string;
  duration: string;
  milestones: {
    id: string;
    title: string;
    description: string;
    week: string;
    owner: string;
    expectedOutcome: string;
    keyTasks: string[];
  }[];
  successMetrics: { metric: string; target: string; timeline: string }[];
  risks: { risk: string; mitigation: string }[];
}

export default function ConsultingEngine() {
  const navigate = useNavigate();
  const { company } = useCompany();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState('');
  const [problemDescription, setProblemDescription] = useState('');
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [datasets, setDatasets] = useState<UploadedDataset[]>([]);
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [executionPlan, setExecutionPlan] = useState<ExecutionPlan | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  
  // Dataset upload state
  const [newDataset, setNewDataset] = useState({ name: '', type: '', summary: '', rowCount: 0 });
  const [parsedFileData, setParsedFileData] = useState<ParsedData | null>(null);

  // Save dataset to database
  const saveDatasetToDb = async (dataset: UploadedDataset) => {
    if (!company) return null;
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Limit raw_data to first 100 rows for DB storage to avoid bloat
    const limitedRawData = dataset.rawData?.slice(0, 100);

    const { data, error } = await supabase
      .from('business_datasets')
      .insert({
        company_id: company.id,
        name: dataset.name,
        dataset_type: dataset.type,
        row_count: dataset.rowCount,
        uploaded_by: user.id,
        raw_data: limitedRawData ? JSON.parse(JSON.stringify(limitedRawData)) : null,
        processed_data: { 
          summary: dataset.summary,
          headers: dataset.headers || [],
          totalRows: dataset.rowCount
        }
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving dataset:', error);
      return null;
    }
    return data;
  };

  // Handle file parsed from FileUploadZone
  const handleFileParsed = (data: ParsedData) => {
    setParsedFileData(data);
    // Auto-fill name from filename
    const cleanName = data.fileName.replace(/\.(csv|xlsx|xls)$/i, '').replace(/[_-]/g, ' ');
    setNewDataset(prev => ({
      ...prev,
      name: cleanName,
      summary: data.summary,
      rowCount: data.rowCount,
    }));
    toast.success(`File parsed: ${data.rowCount} rows found`);
  };

  const handleAddDataset = async () => {
    if (!newDataset.name || !newDataset.type) {
      toast.error('Please provide dataset name and type');
      return;
    }
    
    const dataset: UploadedDataset = {
      id: Date.now().toString(),
      name: newDataset.name,
      type: newDataset.type,
      summary: newDataset.summary || 'No summary provided',
      rowCount: newDataset.rowCount || 0,
      rawData: parsedFileData?.rows,
      headers: parsedFileData?.headers,
    };
    
    // Save to database
    const savedDataset = await saveDatasetToDb(dataset);
    if (savedDataset) {
      dataset.id = savedDataset.id;
    }
    
    setDatasets(prev => [...prev, dataset]);
    setNewDataset({ name: '', type: '', summary: '', rowCount: 0 });
    setParsedFileData(null);
    toast.success('Dataset added and saved');
  };

  const handleRemoveDataset = async (id: string) => {
    // Remove from database
    await supabase.from('business_datasets').delete().eq('id', id);
    setDatasets(prev => prev.filter(d => d.id !== id));
  };

  const callAI = async (type: 'diagnose' | 'scenarios' | 'execution_plan', additionalData?: any) => {
    if (!company) {
      toast.error('Company information not found');
      return null;
    }

    setLoading(true);
    try {
      const response = await supabase.functions.invoke('ai-consulting', {
        body: {
          type,
          companyInfo: {
            name: company.name,
            industry: company.industry,
            stage: company.stage || 'startup',
            employeeCount: company.employee_count || 10,
            description: company.description,
          },
          problemDomain: selectedDomain,
          problemDescription,
          datasets: datasets.map(d => ({
            name: d.name,
            type: d.type,
            summary: d.summary,
            rowCount: d.rowCount,
            headers: d.headers,
            // Include sample data for AI analysis (first 50 rows)
            sampleData: d.rawData?.slice(0, 50),
          })),
          ...additionalData,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      return response.data.result;
    } catch (error) {
      console.error('AI call error:', error);
      toast.error('Failed to get AI response. Please try again.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleRunDiagnosis = async () => {
    const result = await callAI('diagnose');
    if (result) {
      setDiagnosis(result);
      // Save session with diagnosis
      await saveSession({ diagnosis: result, status: 'simulating' });
      setStep(3);
    }
  };

  const handleGenerateScenarios = async () => {
    const result = await callAI('scenarios', { previousDiagnosis: diagnosis });
    if (result?.scenarios) {
      setScenarios(result.scenarios);
      // Save session with scenarios
      await saveSession({ scenarios: result.scenarios, status: 'planning' });
      setStep(4);
    }
  };

  // Create or update AI consulting session
  const saveSession = async (updates: {
    diagnosis?: DiagnosisResult | null;
    scenarios?: Scenario[];
    execution_plan?: ExecutionPlan | null;
    status?: string;
    selected_scenario_id?: string | null;
  }) => {
    if (!company) return null;
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Convert to JSON-compatible format
    const dbUpdates: Record<string, unknown> = {
      updated_at: new Date().toISOString()
    };
    
    if (updates.diagnosis !== undefined) dbUpdates.diagnosis = updates.diagnosis as unknown;
    if (updates.scenarios !== undefined) dbUpdates.scenarios = updates.scenarios as unknown;
    if (updates.execution_plan !== undefined) dbUpdates.execution_plan = updates.execution_plan as unknown;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.selected_scenario_id !== undefined) dbUpdates.selected_scenario_id = updates.selected_scenario_id;

    if (sessionId) {
      // Update existing session
      const { error } = await supabase
        .from('ai_consulting_sessions')
        .update(dbUpdates)
        .eq('id', sessionId);
      
      if (error) console.error('Error updating session:', error);
      return sessionId;
    } else {
      // Create new session
      const { data, error } = await supabase
        .from('ai_consulting_sessions')
        .insert({
          company_id: company.id,
          created_by: user.id,
          problem_domain: selectedDomain,
          problem_description: problemDescription,
          datasets_used: datasets.map(d => d.id),
          status: updates.status || 'diagnosing',
          diagnosis: updates.diagnosis ? JSON.parse(JSON.stringify(updates.diagnosis)) : null,
          scenarios: updates.scenarios ? JSON.parse(JSON.stringify(updates.scenarios)) : null,
          execution_plan: updates.execution_plan ? JSON.parse(JSON.stringify(updates.execution_plan)) : null,
          selected_scenario_id: updates.selected_scenario_id || null
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating session:', error);
        return null;
      }
      
      setSessionId(data.id);
      return data.id;
    }
  };

  const handleGenerateExecutionPlan = async () => {
    const selected = scenarios.find(s => s.id === selectedScenario);
    if (!selected) {
      toast.error('Please select a scenario first');
      return;
    }

    const result = await callAI('execution_plan', {
      selectedScenario: {
        name: selected.name,
        description: selected.description,
        expectedOutcome: selected.expectedOutcome,
      },
    });

    if (result) {
      setExecutionPlan(result);
      
      // Save the complete session with execution plan
      await saveSession({
        execution_plan: result,
        selected_scenario_id: selectedScenario,
        status: 'complete'
      });
      
      setStep(5);
    }
  };

  const handleOpenWorkspace = async () => {
    // Ensure everything is saved before navigating
    if (executionPlan && !sessionId) {
      await saveSession({
        diagnosis,
        scenarios,
        execution_plan: executionPlan,
        selected_scenario_id: selectedScenario,
        status: 'complete'
      });
    }
    
    toast.success('Opening ATLAS Workspace...');
    navigate('/app/execution');
  };

  const canProceed = () => {
    switch (step) {
      case 1: return true; // Can proceed without data (but recommended)
      case 2: return selectedDomain && problemDescription.length >= 20;
      case 3: return diagnosis !== null;
      case 4: return selectedScenario !== null;
      default: return true;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-5xl mx-auto space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
            <Brain className="text-primary" />
            Consulting Engine
          </h1>
          <p className="text-muted-foreground mt-1">
            Upload your data, describe your challenge, and receive AI-powered strategic recommendations
          </p>
        </div>
        {company && (
          <div className="text-right hidden md:block">
            <p className="text-sm font-medium">{company.name}</p>
            <p className="text-xs text-muted-foreground capitalize">{company.industry} • {company.stage}</p>
          </div>
        )}
      </div>

      {/* Progress Steps */}
      <Card className="card-glass">
        <CardContent className="py-6">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            {steps.map((s, i) => (
              <div key={s.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all",
                    step > s.id 
                      ? "bg-primary border-primary text-primary-foreground"
                      : step === s.id
                      ? "border-primary text-primary bg-primary/10"
                      : "border-border text-muted-foreground"
                  )}>
                    {step > s.id ? <CheckCircle2 size={20} /> : <s.icon size={20} />}
                  </div>
                  <span className={cn(
                    "text-xs mt-2 font-medium hidden md:block",
                    step >= s.id ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {s.title}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className={cn(
                    "w-12 md:w-20 h-0.5 mx-2 mt-[-20px] md:mt-[-24px]",
                    step > s.id ? "bg-primary" : "bg-border"
                  )} />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        {/* Step 1: Upload Data */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card className="card-soothing">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Upload className="text-primary" size={24} />
                      Upload Your Business Data
                    </CardTitle>
                    <CardDescription>
                      Add your company's data to help ATLAS provide accurate analysis and recommendations
                    </CardDescription>
                  </div>
                  <DataSecurityBadge variant="inline" />
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Uploaded Datasets */}
                {datasets.length > 0 && (
                  <div className="space-y-3">
                    <Label>Uploaded Datasets ({datasets.length})</Label>
                    <div className="grid gap-2">
                      {datasets.map((dataset) => (
                        <div
                          key={dataset.id}
                          className="flex items-center justify-between p-4 rounded-xl border bg-secondary/30 border-emerald-500/10"
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <FileSpreadsheet className="text-primary" size={20} />
                              <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 flex items-center justify-center">
                                <span className="text-[8px] text-white">🔒</span>
                              </div>
                            </div>
                            <div>
                              <p className="font-medium flex items-center gap-2">
                                {dataset.name}
                                <DataSecurityBadge variant="minimal" />
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {datasetTypes.find(t => t.value === dataset.type)?.label} • {dataset.rowCount} records
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveDataset(dataset.id)}
                          >
                            <Trash2 size={16} className="text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add Dataset Form */}
                <div className="p-6 rounded-xl border border-dashed border-border bg-secondary/20">
                  <h3 className="font-medium mb-4">Add New Dataset</h3>
                  <div className="grid gap-4">
                    {/* File Upload Zone */}
                    <div>
                      <Label className="mb-2 block">Upload File (CSV or Excel)</Label>
                      <FileUploadZone onFilesParsed={handleFileParsed} />
                    </div>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                          {parsedFileData ? 'Review & Complete' : 'Or enter manually'}
                        </span>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label>Dataset Name *</Label>
                        <Input
                          placeholder="e.g., Q4 Sales Report"
                          value={newDataset.name}
                          onChange={(e) => setNewDataset(prev => ({ ...prev, name: e.target.value }))}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Row Count</Label>
                        <Input
                          type="number"
                          placeholder="e.g., 1000"
                          value={newDataset.rowCount || ''}
                          onChange={(e) => setNewDataset(prev => ({ ...prev, rowCount: parseInt(e.target.value) || 0 }))}
                          className="mt-1"
                          disabled={!!parsedFileData}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label>Data Type *</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                        {datasetTypes.map((type) => (
                          <button
                            key={type.value}
                            onClick={() => setNewDataset(prev => ({ ...prev, type: type.value }))}
                            className={cn(
                              "p-3 rounded-lg border text-left transition-all",
                              newDataset.type === type.value
                                ? "border-primary bg-primary/10"
                                : "border-border hover:border-primary/50"
                            )}
                          >
                            <span className="text-lg">{type.icon}</span>
                            <span className="text-sm font-medium ml-2">{type.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <Label>Data Summary {parsedFileData && <span className="text-xs text-muted-foreground ml-1">(auto-generated from file)</span>}</Label>
                        <VoiceInput 
                          onTranscript={(text) => setNewDataset(prev => ({ ...prev, summary: text }))}
                          appendMode
                          existingText={newDataset.summary}
                        />
                      </div>
                      <Textarea
                        placeholder="Briefly describe what this data contains, key columns, time period covered, etc."
                        value={newDataset.summary}
                        onChange={(e) => setNewDataset(prev => ({ ...prev, summary: e.target.value }))}
                        className="mt-1"
                        rows={3}
                      />
                    </div>

                    <Button onClick={handleAddDataset} disabled={!newDataset.name || !newDataset.type}>
                      <Upload size={16} className="mr-2" />
                      {parsedFileData ? 'Add Uploaded Dataset' : 'Add Dataset'}
                    </Button>
                  </div>
                </div>

                {/* Security Info Panel */}
                <SecurityInfoPanel />

                <div className="p-4 rounded-xl bg-muted/50 border border-border">
                  <p className="text-sm text-muted-foreground">
                    <strong>Tip:</strong> Adding detailed business data helps ATLAS provide more accurate and actionable recommendations. You can proceed without data, but the analysis will be more general.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 2: Define Problem */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card className="card-soothing">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="text-primary" size={24} />
                  Define Your Problem
                </CardTitle>
                <CardDescription>Select the domain and describe your business challenge in detail</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>Problem Domain *</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {problemDomains.map((domain) => (
                      <button
                        key={domain.value}
                        onClick={() => setSelectedDomain(domain.value)}
                        className={cn(
                          "p-4 rounded-xl border text-left transition-all",
                          selectedDomain === domain.value
                            ? "border-primary bg-primary/10 shadow-sm"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{domain.icon}</span>
                          <div>
                            <p className="font-medium">{domain.label}</p>
                            <p className="text-xs text-muted-foreground">{domain.description}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="problem">Describe Your Challenge *</Label>
                    <VoiceInput 
                      onTranscript={(text) => setProblemDescription(text)}
                      appendMode
                      existingText={problemDescription}
                    />
                  </div>
                  <Textarea
                    id="problem"
                    placeholder="Describe your business problem in detail. Include context about what you've tried, current metrics, and your goals. The more detail you provide, the better ATLAS can help..."
                    value={problemDescription}
                    onChange={(e) => setProblemDescription(e.target.value)}
                    className="min-h-[180px]"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{problemDescription.length} characters</span>
                    <span>Minimum 20 characters required</span>
                  </div>
                </div>

                {datasets.length > 0 && (
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                    <p className="text-sm font-medium">📊 {datasets.length} dataset(s) will be analyzed</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {datasets.map(d => d.name).join(', ')}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 3: AI Diagnosis */}
        {step === 3 && diagnosis && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card className="card-soothing">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Sparkles className="text-primary" size={24} />
                    </div>
                    <div>
                      <CardTitle>AI Diagnosis Complete</CardTitle>
                      <CardDescription>ATLAS has analyzed your problem and identified root causes</CardDescription>
                    </div>
                  </div>
                  <TextToSpeech 
                    text={`Root Cause Analysis: ${diagnosis.rootCause}. Key Findings: ${diagnosis.findings.map(f => f.text).join('. ')}. Immediate Actions: ${diagnosis.immediateActions.join('. ')}`}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Root Cause */}
                <div className="p-5 rounded-xl bg-primary/5 border border-primary/20">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Brain size={18} className="text-primary" />
                    Root Cause Analysis
                  </h3>
                  <p className="text-muted-foreground">{diagnosis.rootCause}</p>
                </div>

                {/* Findings */}
                <div className="space-y-3">
                  <h3 className="font-semibold">Key Findings</h3>
                  {diagnosis.findings.map((finding, i) => (
                    <div
                      key={i}
                      className={cn(
                        "p-4 rounded-lg border flex items-start gap-3",
                        finding.type === 'critical' && "bg-red-500/5 border-red-500/20",
                        finding.type === 'warning' && "bg-yellow-500/5 border-yellow-500/20",
                        finding.type === 'insight' && "bg-blue-500/5 border-blue-500/20"
                      )}
                    >
                      {finding.type === 'critical' && <AlertTriangle className="text-red-500 shrink-0" size={18} />}
                      {finding.type === 'warning' && <AlertTriangle className="text-yellow-500 shrink-0" size={18} />}
                      {finding.type === 'insight' && <Lightbulb className="text-blue-500 shrink-0" size={18} />}
                      <p className="text-sm">{finding.text}</p>
                    </div>
                  ))}
                </div>

                {/* Key Metrics & Actions */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-secondary">
                    <h4 className="font-medium mb-2">Key Metrics to Track</h4>
                    <ul className="space-y-1">
                      {diagnosis.keyMetrics.map((metric, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                          {metric}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-4 rounded-xl bg-secondary">
                    <h4 className="font-medium mb-2">Immediate Actions</h4>
                    <ul className="space-y-1">
                      {diagnosis.immediateActions.map((action, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Confidence */}
                <div className="p-4 rounded-xl bg-secondary">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Diagnosis Confidence</span>
                    <span className="text-sm font-bold text-primary">{diagnosis.confidence}%</span>
                  </div>
                  <Progress value={diagnosis.confidence} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 4: Strategy Scenarios */}
        {step === 4 && scenarios.length > 0 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card className="card-soothing">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <GitBranch className="text-primary" size={24} />
                    </div>
                    <div>
                      <CardTitle>Strategy Scenarios</CardTitle>
                      <CardDescription>Compare strategic paths and their expected outcomes</CardDescription>
                    </div>
                  </div>
                  <TextToSpeech 
                    text={`Strategy Scenarios: ${scenarios.map(s => `${s.name}: ${s.description}. Expected outcome: ${s.expectedOutcome}. Risk level: ${s.risk}.`).join(' ')}`}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {scenarios.map((scenario) => (
                    <button
                      key={scenario.id}
                      onClick={() => setSelectedScenario(scenario.id)}
                      className={cn(
                        "p-5 rounded-xl border text-left transition-all relative",
                        selectedScenario === scenario.id
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-border hover:border-primary/50",
                        scenario.recommended && "ring-2 ring-primary/30"
                      )}
                    >
                      {scenario.recommended && (
                        <span className="absolute -top-2 left-4 px-2 py-0.5 text-xs font-medium bg-primary text-primary-foreground rounded-full">
                          Recommended
                        </span>
                      )}
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">{scenario.name}</h3>
                          <p className="text-sm text-muted-foreground mb-3">{scenario.description}</p>
                          <div className="space-y-1">
                            {scenario.keyActions.slice(0, 3).map((action, i) => (
                              <p key={i} className="text-xs text-muted-foreground flex items-center gap-2">
                                <CheckCircle2 size={12} className="text-primary" />
                                {action}
                              </p>
                            ))}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 md:flex-col md:items-end md:gap-1">
                          <span className={cn(
                            "text-xs px-2 py-1 rounded-full",
                            scenario.risk === 'low' && "bg-green-500/10 text-green-600",
                            scenario.risk === 'medium' && "bg-yellow-500/10 text-yellow-600",
                            scenario.risk === 'high' && "bg-red-500/10 text-red-600"
                          )}>
                            {scenario.risk} risk
                          </span>
                          <span className="text-xs px-2 py-1 rounded-full bg-secondary">
                            {scenario.timeToImpact}
                          </span>
                          <span className="text-xs font-semibold text-primary">
                            {scenario.expectedOutcome}
                          </span>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center gap-2">
                        <Progress value={scenario.confidence} className="h-1.5 flex-1" />
                        <span className="text-xs text-muted-foreground">{scenario.confidence}% confidence</span>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 5: Execution Plan */}
        {step === 5 && executionPlan && (
          <motion.div
            key="step5"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <Card className="card-soothing">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-500/10">
                      <CheckCircle2 className="text-green-500" size={24} />
                    </div>
                    <div>
                      <CardTitle>Execution Plan Generated</CardTitle>
                      <CardDescription>{executionPlan.planTitle} • {executionPlan.duration}</CardDescription>
                    </div>
                  </div>
                  <TextToSpeech 
                    text={`Execution Plan: ${executionPlan.planTitle}. ${executionPlan.planDescription}. Duration: ${executionPlan.duration}. Milestones: ${executionPlan.milestones.map(m => `Week ${m.week}: ${m.title}. ${m.description}`).join('. ')}`}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-5 rounded-xl bg-green-500/5 border border-green-500/20">
                  <p className="text-muted-foreground">{executionPlan.planDescription}</p>
                </div>

                {/* Milestones */}
                <div className="space-y-3">
                  <h3 className="font-semibold">Execution Roadmap</h3>
                  {executionPlan.milestones.map((milestone, i) => (
                    <div
                      key={milestone.id}
                      className="p-4 rounded-lg border bg-secondary/30 flex items-start gap-4"
                    >
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-primary">W{milestone.week}</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{milestone.title}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{milestone.description}</p>
                        <div className="flex flex-wrap gap-2">
                          <span className="text-xs px-2 py-1 rounded-full bg-secondary">
                            👤 {milestone.owner}
                          </span>
                          <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                            🎯 {milestone.expectedOutcome}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Success Metrics */}
                <div className="p-4 rounded-xl bg-secondary">
                  <h4 className="font-medium mb-3">Success Metrics</h4>
                  <div className="grid md:grid-cols-3 gap-3">
                    {executionPlan.successMetrics.map((metric, i) => (
                      <div key={i} className="p-3 rounded-lg bg-background">
                        <p className="text-sm font-medium">{metric.metric}</p>
                        <p className="text-lg font-bold text-primary">{metric.target}</p>
                        <p className="text-xs text-muted-foreground">{metric.timeline}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Open Workspace Button */}
                <Button onClick={handleOpenWorkspace} className="w-full py-6 text-lg btn-primary">
                  <ExternalLink size={20} className="mr-2" />
                  Open ATLAS Workspace
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <Card className="card-glass">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1 || loading}
              className="gap-2"
            >
              <ArrowLeft size={16} />
              Back
            </Button>
            
            <div className="flex gap-2">
              {step === 1 && (
                <Button onClick={() => setStep(2)} className="gap-2">
                  Continue to Problem
                  <ArrowRight size={16} />
                </Button>
              )}
              {step === 2 && (
                <Button
                  onClick={handleRunDiagnosis}
                  disabled={!canProceed() || loading}
                  className="gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Brain size={16} />
                      Run AI Diagnosis
                    </>
                  )}
                </Button>
              )}
              {step === 3 && (
                <Button
                  onClick={handleGenerateScenarios}
                  disabled={loading}
                  className="gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <GitBranch size={16} />
                      Generate Scenarios
                    </>
                  )}
                </Button>
              )}
              {step === 4 && (
                <Button
                  onClick={handleGenerateExecutionPlan}
                  disabled={!selectedScenario || loading}
                  className="gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Creating Plan...
                    </>
                  ) : (
                    <>
                      <Target size={16} />
                      Generate Execution Plan
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
