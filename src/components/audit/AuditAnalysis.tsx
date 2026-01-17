import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import {
  Brain,
  Loader2,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  MessageSquare,
  Send,
} from 'lucide-react';

interface AuditAnalysisProps {
  sessionId: string;
  onNext: () => void;
}

interface AuditQuestion {
  id: string;
  question: string;
  context: string | null;
  answer: string | null;
  is_answered: boolean;
  priority: number;
}

const ANALYSIS_STAGES = [
  { id: 1, name: 'Reading Files', description: 'Parsing and understanding uploaded documents' },
  { id: 2, name: 'Data Validation', description: 'Checking for format errors and missing data' },
  { id: 3, name: 'Arithmetic Checks', description: 'Verifying calculations and balances' },
  { id: 4, name: 'Cross-Referencing', description: 'Matching transactions across documents' },
  { id: 5, name: 'Risk Detection', description: 'Identifying anomalies and potential issues' },
  { id: 6, name: 'Compliance Review', description: 'Checking against accounting standards' },
  { id: 7, name: 'Generating Findings', description: 'Preparing detailed audit observations' },
];

export function AuditAnalysis({ sessionId, onNext }: AuditAnalysisProps) {
  const queryClient = useQueryClient();
  const [currentStage, setCurrentStage] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  // Fetch session details
  const { data: session } = useQuery({
    queryKey: ['audit-session', sessionId],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from('audit_sessions' as any)
        .select('*')
        .eq('id', sessionId)
        .single() as any);
      if (error) throw error;
      return data;
    },
  });

  // Fetch uploaded files
  const { data: files } = useQuery({
    queryKey: ['audit-files', sessionId],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from('audit_files' as any)
        .select('*')
        .eq('session_id', sessionId) as any);
      if (error) throw error;
      return data;
    },
  });

  // Fetch AI questions
  const { data: questions, refetch: refetchQuestions } = useQuery({
    queryKey: ['audit-questions', sessionId],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from('audit_questions' as any)
        .select('*')
        .eq('session_id', sessionId)
        .order('priority', { ascending: true }) as any);
      if (error) throw error;
      return data as AuditQuestion[];
    },
  });

  // Run AI analysis
  const runAnalysis = useMutation({
    mutationFn: async () => {
      setIsAnalyzing(true);
      setCurrentStage(0);

      // Simulate stage progression (in production, this would be real AI processing)
      for (let i = 0; i < ANALYSIS_STAGES.length; i++) {
        setCurrentStage(i);
        await new Promise(resolve => setTimeout(resolve, 1500));
      }

      // Call the AI audit edge function
      const { data, error } = await supabase.functions.invoke('ai-audit', {
        body: {
          sessionId,
          session,
          files: files?.map(f => ({
            id: f.id,
            name: f.file_name,
            category: f.file_category,
            headers: f.headers,
            rowCount: f.row_count,
            data: f.raw_data,
          })),
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      setAnalysisComplete(true);
      setIsAnalyzing(false);
      queryClient.invalidateQueries({ queryKey: ['audit-questions', sessionId] });
      queryClient.invalidateQueries({ queryKey: ['audit-findings', sessionId] });
      toast.success('AI analysis complete');
    },
    onError: (error) => {
      setIsAnalyzing(false);
      toast.error('Analysis failed. Please try again.');
      console.error(error);
    },
  });

  // Answer question
  const answerQuestion = useMutation({
    mutationFn: async ({ questionId, answer }: { questionId: string; answer: string }) => {
      const { error } = await (supabase
        .from('audit_questions' as any)
        .update({ answer, is_answered: true })
        .eq('id', questionId) as any);
      if (error) throw error;
    },
    onSuccess: () => {
      refetchQuestions();
      toast.success('Answer submitted');
    },
  });

  const unansweredQuestions = questions?.filter(q => !q.is_answered) || [];
  const canProceed = analysisComplete && unansweredQuestions.length === 0;

  const handleSubmitAnswer = (questionId: string) => {
    const answer = answers[questionId];
    if (answer?.trim()) {
      answerQuestion.mutate({ questionId, answer });
      setAnswers(prev => ({ ...prev, [questionId]: '' }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Analysis Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            AI Audit Analysis
          </CardTitle>
          <CardDescription>
            Our AI is analyzing your financial documents to detect issues and risks
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!isAnalyzing && !analysisComplete && (
            <div className="text-center py-8">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Brain className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Ready to Analyze</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {files?.length || 0} files uploaded and ready for AI-powered audit analysis.
                This will check for errors, inconsistencies, and compliance issues.
              </p>
              <Button size="lg" onClick={() => runAnalysis.mutate()} className="gap-2">
                <Brain className="w-4 h-4" />
                Start AI Analysis
              </Button>
            </div>
          )}

          {isAnalyzing && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <div>
                  <h3 className="font-semibold">Analyzing Your Documents</h3>
                  <p className="text-sm text-muted-foreground">
                    This may take a few minutes depending on file size
                  </p>
                </div>
              </div>

              <Progress value={((currentStage + 1) / ANALYSIS_STAGES.length) * 100} className="h-3" />

              <div className="space-y-3">
                {ANALYSIS_STAGES.map((stage, index) => (
                  <div
                    key={stage.id}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      index < currentStage
                        ? 'bg-green-500/10'
                        : index === currentStage
                        ? 'bg-primary/10'
                        : 'bg-muted/50'
                    }`}
                  >
                    {index < currentStage ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : index === currentStage ? (
                      <Loader2 className="w-5 h-5 text-primary animate-spin" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30" />
                    )}
                    <div>
                      <p className="font-medium">{stage.name}</p>
                      <p className="text-xs text-muted-foreground">{stage.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {analysisComplete && (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Analysis Complete</h3>
              <p className="text-muted-foreground">
                AI has finished analyzing your documents. Review any follow-up questions below.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Follow-up Questions */}
      {analysisComplete && questions && questions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              AI Follow-up Questions
              {unansweredQuestions.length > 0 && (
                <span className="ml-2 px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-500 text-sm">
                  {unansweredQuestions.length} pending
                </span>
              )}
            </CardTitle>
            <CardDescription>
              Please answer these questions to help the AI complete the audit
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {questions.map((question) => (
              <div
                key={question.id}
                className={`p-4 rounded-lg border ${
                  question.is_answered
                    ? 'bg-green-500/5 border-green-500/20'
                    : 'bg-yellow-500/5 border-yellow-500/20'
                }`}
              >
                <div className="flex items-start gap-3">
                  {question.is_answered ? (
                    <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 space-y-3">
                    <p className="font-medium">{question.question}</p>
                    {question.context && (
                      <p className="text-sm text-muted-foreground">{question.context}</p>
                    )}
                    {question.is_answered ? (
                      <div className="p-3 rounded-lg bg-background">
                        <p className="text-sm">{question.answer}</p>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Textarea
                          placeholder="Type your answer..."
                          value={answers[question.id] || ''}
                          onChange={(e) => setAnswers(prev => ({ ...prev, [question.id]: e.target.value }))}
                          rows={2}
                        />
                        <Button
                          size="icon"
                          onClick={() => handleSubmitAnswer(question.id)}
                          disabled={!answers[question.id]?.trim()}
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Continue Button */}
      {analysisComplete && (
        <div className="flex justify-end">
          <Button
            size="lg"
            onClick={onNext}
            disabled={!canProceed}
            className="gap-2"
          >
            {unansweredQuestions.length > 0 ? (
              `Answer ${unansweredQuestions.length} Questions to Continue`
            ) : (
              <>
                Review Findings
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
