import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCompany } from '@/hooks/useCompany';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { AuditSetup } from '@/components/audit/AuditSetup';
import { AuditFileUpload } from '@/components/audit/AuditFileUpload';
import { AuditAnalysis } from '@/components/audit/AuditAnalysis';
import { AuditReview } from '@/components/audit/AuditReview';
import { AuditReport } from '@/components/audit/AuditReport';
import { AuditProgress } from '@/components/audit/AuditProgress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ClipboardCheck, Plus, Trash2, Eye } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type AuditSessionStatus = 'setup' | 'upload' | 'analyzing' | 'review' | 'complete';

interface AuditSession {
  id: string;
  title: string;
  audit_type: string;
  accounting_standard: string;
  industry: string | null;
  financial_year: string | null;
  currency: string | null;
  status: AuditSessionStatus;
  current_step: number;
  ai_summary: string | null;
  risk_score: number | null;
  compliance_status: string | null;
  recommendations: any;
  created_at: string;
  updated_at: string;
}

const STEPS = [
  { id: 1, name: 'Setup', status: 'setup' },
  { id: 2, name: 'Upload Files', status: 'upload' },
  { id: 3, name: 'AI Analysis', status: 'analyzing' },
  { id: 4, name: 'Review Findings', status: 'review' },
  { id: 5, name: 'Final Report', status: 'complete' },
];

export default function AuditModule() {
  const { company } = useCompany();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [showNewAudit, setShowNewAudit] = useState(false);
  const [deleteSessionId, setDeleteSessionId] = useState<string | null>(null);

  // Fetch existing audit sessions
  const { data: sessions, isLoading } = useQuery({
    queryKey: ['audit-sessions', company?.id],
    queryFn: async () => {
      if (!company?.id) return [];
      const { data, error } = await (supabase
        .from('audit_sessions' as any)
        .select('*')
        .eq('company_id', company.id)
        .order('created_at', { ascending: false }) as any);
      if (error) throw error;
      return data as AuditSession[];
    },
    enabled: !!company?.id,
  });

  const activeSession = sessions?.find(s => s.id === activeSessionId);

  // Create new audit session
  const createSession = useMutation({
    mutationFn: async (data: {
      title: string;
      audit_type: string;
      accounting_standard: string;
      industry: string;
      financial_year: string;
      currency: string;
    }) => {
      if (!company?.id) throw new Error('No company found. Please complete onboarding first.');
      if (!user?.id) throw new Error('Not authenticated. Please log in.');
      
      // Validate enum values
      const validAuditTypes = ['financial', 'internal', 'compliance', 'tax', 'custom'];
      const validAccountingStandards = ['ifrs', 'gaap', 'local', 'custom'];
      
      if (!validAuditTypes.includes(data.audit_type)) {
        throw new Error(`Invalid audit type: ${data.audit_type}`);
      }
      if (!validAccountingStandards.includes(data.accounting_standard)) {
        throw new Error(`Invalid accounting standard: ${data.accounting_standard}`);
      }

      const insertData = {
        company_id: company.id,
        created_by: user.id,
        title: data.title,
        audit_type: data.audit_type as 'financial' | 'internal' | 'compliance' | 'tax' | 'custom',
        accounting_standard: data.accounting_standard as 'ifrs' | 'gaap' | 'local' | 'custom',
        industry: data.industry || null,
        financial_year: data.financial_year || null,
        currency: data.currency || 'INR',
        status: 'upload' as const,
        current_step: 2,
      };

      console.log('Creating audit session with data:', insertData);

      const { data: session, error } = await (supabase
        .from('audit_sessions' as any)
        .insert(insertData)
        .select()
        .single() as any);
      
      if (error) {
        console.error('Supabase error:', error);
        throw new Error(error.message || 'Failed to create audit session');
      }
      return session;
    },
    onSuccess: (session) => {
      queryClient.invalidateQueries({ queryKey: ['audit-sessions'] });
      setActiveSessionId(session.id);
      setShowNewAudit(false);
      toast.success('Audit session created');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create audit session');
      console.error('Create session error:', error);
    },
  });

  // Delete audit session
  const deleteSession = useMutation({
    mutationFn: async (sessionId: string) => {
      const { error } = await (supabase
        .from('audit_sessions' as any)
        .delete()
        .eq('id', sessionId) as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audit-sessions'] });
      if (activeSessionId === deleteSessionId) {
        setActiveSessionId(null);
      }
      setDeleteSessionId(null);
      toast.success('Audit session deleted');
    },
    onError: () => {
      toast.error('Failed to delete audit session');
    },
  });

  // Update session status
  const updateSessionStatus = useMutation({
    mutationFn: async ({ sessionId, status, step }: { sessionId: string; status: AuditSessionStatus; step: number }) => {
      const { error } = await (supabase
        .from('audit_sessions' as any)
        .update({ status, current_step: step })
        .eq('id', sessionId) as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audit-sessions'] });
    },
  });

  const handleNextStep = (nextStatus: AuditSessionStatus, nextStep: number) => {
    if (activeSessionId) {
      updateSessionStatus.mutate({ sessionId: activeSessionId, status: nextStatus, step: nextStep });
    }
  };

  const getCurrentStepIndex = () => {
    if (!activeSession) return 0;
    return STEPS.findIndex(s => s.status === activeSession.status);
  };

  if (!company) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Please complete onboarding first</p>
      </div>
    );
  }

  // Show session list if no active session
  if (!activeSessionId && !showNewAudit) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="heading-subsection">AI Audit Module</h1>
            <p className="text-muted-foreground mt-1">
              Automated financial and compliance audits powered by AI
            </p>
          </div>
          <Button onClick={() => setShowNewAudit(true)} className="gap-2">
            <Plus size={18} />
            New Audit
          </Button>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-5 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/2 mt-2" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : sessions && sessions.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sessions.map((session) => (
              <Card key={session.id} className="hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{session.title}</CardTitle>
                      <CardDescription className="capitalize">
                        {session.audit_type} Audit • {session.accounting_standard.toUpperCase()}
                      </CardDescription>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      session.status === 'complete' ? 'bg-green-500/10 text-green-500' :
                      session.status === 'analyzing' ? 'bg-yellow-500/10 text-yellow-500' :
                      'bg-primary/10 text-primary'
                    }`}>
                      {session.status}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>FY: {session.financial_year || 'Not set'}</span>
                    <span>•</span>
                    <span>{session.currency || 'INR'}</span>
                  </div>
                  {session.risk_score !== null && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Risk Score:</span>
                      <span className={`font-semibold ${
                        session.risk_score > 70 ? 'text-destructive' :
                        session.risk_score > 40 ? 'text-yellow-500' :
                        'text-green-500'
                      }`}>
                        {session.risk_score}%
                      </span>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-2"
                      onClick={() => setActiveSessionId(session.id)}
                    >
                      <Eye size={16} />
                      {session.status === 'complete' ? 'View Report' : 'Continue'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeleteSessionId(session.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <ClipboardCheck className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">No Audit Sessions</h3>
              <p className="text-muted-foreground mb-6 max-w-sm">
                Start your first AI-powered audit to automatically analyze your financial data
              </p>
              <Button onClick={() => setShowNewAudit(true)} className="gap-2">
                <Plus size={18} />
                Start New Audit
              </Button>
            </CardContent>
          </Card>
        )}

        <AlertDialog open={!!deleteSessionId} onOpenChange={() => setDeleteSessionId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Audit Session?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the audit session and all associated files and findings.
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => deleteSessionId && deleteSession.mutate(deleteSessionId)}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  // Show new audit setup
  if (showNewAudit) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => setShowNewAudit(false)}>
            ← Back
          </Button>
          <div>
            <h1 className="heading-subsection">New Audit Session</h1>
            <p className="text-muted-foreground mt-1">Configure your audit parameters</p>
          </div>
        </div>
        <AuditSetup
          onSubmit={(data) => createSession.mutate(data)}
          isLoading={createSession.isPending}
        />
      </div>
    );
  }

  // Show active session workflow
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => setActiveSessionId(null)}>
          ← Back to Sessions
        </Button>
        <div className="flex-1">
          <h1 className="heading-subsection">{activeSession?.title}</h1>
          <p className="text-muted-foreground mt-1 capitalize">
            {activeSession?.audit_type} Audit • {activeSession?.accounting_standard.toUpperCase()}
          </p>
        </div>
      </div>

      <AuditProgress steps={STEPS} currentStep={getCurrentStepIndex()} />

      <AnimatePresence mode="wait">
        {activeSession?.status === 'upload' && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <AuditFileUpload
              sessionId={activeSession.id}
              onNext={() => handleNextStep('analyzing', 3)}
            />
          </motion.div>
        )}

        {activeSession?.status === 'analyzing' && (
          <motion.div
            key="analyzing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <AuditAnalysis
              sessionId={activeSession.id}
              onNext={() => handleNextStep('review', 4)}
            />
          </motion.div>
        )}

        {activeSession?.status === 'review' && (
          <motion.div
            key="review"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <AuditReview
              sessionId={activeSession.id}
              onNext={() => handleNextStep('complete', 5)}
            />
          </motion.div>
        )}

        {activeSession?.status === 'complete' && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <AuditReport sessionId={activeSession.id} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
