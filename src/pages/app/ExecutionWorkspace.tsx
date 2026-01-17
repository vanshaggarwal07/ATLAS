import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  AlertTriangle,
  Calendar,
  User,
  Plus,
  MoreVertical,
  Target,
  TrendingUp,
  Flag,
  Loader2,
  Brain,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { useCompany } from '@/hooks/useCompany';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { AtlasAssistance } from '@/components/app/AtlasAssistance';

interface Milestone {
  id: string;
  title: string;
  description: string | null;
  status: 'not_started' | 'in_progress' | 'blocked' | 'complete';
  due_date: string | null;
  owner_name: string | null;
  expected_outcome: string | null;
  actual_outcome: string | null;
  blockers: string | null;
  order_index: number;
}

interface AISession {
  id: string;
  problem_domain: string | null;
  problem_description: string | null;
  status: string;
  diagnosis: any;
  scenarios: any;
  execution_plan: any;
  created_at: string;
}

const statusConfig = {
  not_started: { icon: Circle, color: 'text-muted-foreground', bg: 'bg-muted', label: 'Not Started' },
  in_progress: { icon: Clock, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30', label: 'In Progress' },
  blocked: { icon: AlertTriangle, color: 'text-destructive', bg: 'bg-destructive/10', label: 'Blocked' },
  complete: { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30', label: 'Complete' }
};

export default function ExecutionWorkspace() {
  const { company } = useCompany();
  const navigate = useNavigate();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [activeSession, setActiveSession] = useState<AISession | null>(null);
  const [loading, setLoading] = useState(true);
  const [newMilestone, setNewMilestone] = useState({ title: '', description: '', due_date: '', owner_name: '' });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [savingMilestone, setSavingMilestone] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!company) return;
      
      setLoading(true);

      // Fetch the latest AI consulting session with execution plan
      const { data: sessionsData } = await supabase
        .from('ai_consulting_sessions')
        .select('*')
        .eq('company_id', company.id)
        .not('execution_plan', 'is', null)
        .order('created_at', { ascending: false })
        .limit(1);

      if (sessionsData && sessionsData.length > 0) {
        const session = sessionsData[0] as AISession;
        setActiveSession(session);

        // Check if we have milestones in DB for this session, otherwise create from execution plan
        const { data: milestonesData } = await supabase
          .from('execution_milestones')
          .select('*')
          .eq('session_id', session.id)
          .order('order_index', { ascending: true });

        if (milestonesData && milestonesData.length > 0) {
          setMilestones(milestonesData as Milestone[]);
        } else if (session.execution_plan?.milestones) {
          // Generate milestones from AI execution plan and save to database
          const generatedMilestones: Milestone[] = [];
          
          for (let idx = 0; idx < session.execution_plan.milestones.length; idx++) {
            const m = session.execution_plan.milestones[idx];
            
            // Insert into database
            const { data: savedMilestone, error } = await supabase
              .from('execution_milestones')
              .insert({
                session_id: session.id,
                title: m.title,
                description: m.description,
                status: 'not_started',
                owner_name: m.owner || null,
                expected_outcome: m.expectedOutcome,
                order_index: idx + 1
              })
              .select()
              .single();

            if (!error && savedMilestone) {
              generatedMilestones.push({
                id: savedMilestone.id,
                title: savedMilestone.title,
                description: savedMilestone.description,
                status: savedMilestone.status as Milestone['status'],
                due_date: savedMilestone.due_date,
                owner_name: savedMilestone.owner_name,
                expected_outcome: savedMilestone.expected_outcome,
                actual_outcome: savedMilestone.actual_outcome,
                blockers: savedMilestone.blockers,
                order_index: savedMilestone.order_index || idx + 1,
              });
            }
          }
          
          setMilestones(generatedMilestones);
        }
      }
      
      setLoading(false);
    };

    fetchData();
  }, [company]);

  const updateStatus = async (id: string, newStatus: Milestone['status']) => {
    setMilestones(prev => 
      prev.map(m => m.id === id ? { ...m, status: newStatus } : m)
    );
    
    // Save to database
    const { error } = await supabase
      .from('execution_milestones')
      .update({ 
        status: newStatus,
        completed_at: newStatus === 'complete' ? new Date().toISOString() : null
      })
      .eq('id', id);
    
    if (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    } else {
      toast.success('Status updated');
    }
  };

  const handleAddMilestone = async () => {
    if (!newMilestone.title) {
      toast.error('Please provide a title');
      return;
    }

    if (!activeSession) {
      toast.error('No active session found');
      return;
    }

    setSavingMilestone(true);

    // Save to database
    const { data: savedMilestone, error } = await supabase
      .from('execution_milestones')
      .insert({
        session_id: activeSession.id,
        title: newMilestone.title,
        description: newMilestone.description || null,
        status: 'not_started',
        due_date: newMilestone.due_date || null,
        owner_name: newMilestone.owner_name || null,
        order_index: milestones.length + 1
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding milestone:', error);
      toast.error('Failed to add milestone');
      setSavingMilestone(false);
      return;
    }

    const milestone: Milestone = {
      id: savedMilestone.id,
      title: savedMilestone.title,
      description: savedMilestone.description,
      status: savedMilestone.status as Milestone['status'],
      due_date: savedMilestone.due_date,
      owner_name: savedMilestone.owner_name,
      expected_outcome: savedMilestone.expected_outcome,
      actual_outcome: savedMilestone.actual_outcome,
      blockers: savedMilestone.blockers,
      order_index: savedMilestone.order_index || milestones.length + 1
    };

    setMilestones(prev => [...prev, milestone]);
    setNewMilestone({ title: '', description: '', due_date: '', owner_name: '' });
    setDialogOpen(false);
    setSavingMilestone(false);
    toast.success('Milestone added');
  };

  const completedCount = milestones.filter(m => m.status === 'complete').length;
  const progressPercent = milestones.length > 0 ? (completedCount / milestones.length) * 100 : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading workspace...</p>
        </div>
      </div>
    );
  }

  if (!activeSession && milestones.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">ATLAS Workspace</h1>
          <p className="text-muted-foreground mt-1">
            Track milestones and measure progress against your strategic plan
          </p>
        </div>

        <Card className="p-12 text-center">
          <div className="max-w-md mx-auto space-y-6">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
              <Brain className="w-10 h-10 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">No Execution Plan Yet</h2>
              <p className="text-muted-foreground">
                Complete the Consulting Engine workflow to generate an AI-powered execution plan that will appear here.
              </p>
            </div>
            <Button onClick={() => navigate('/app/consulting')} className="gap-2">
              <Brain size={16} />
              Start Consulting Engine
              <ArrowRight size={16} />
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">ATLAS Workspace</h1>
          <p className="text-muted-foreground mt-1">
            Track milestones and measure progress against your strategic plan
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => navigate('/app/consulting')} className="gap-2">
            <RefreshCw size={16} />
            New Analysis
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus size={16} />
                Add Milestone
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Milestone</DialogTitle>
                <DialogDescription>
                  Create a new milestone to track your execution progress
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    placeholder="Milestone title"
                    value={newMilestone.title}
                    onChange={(e) => setNewMilestone(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    placeholder="Describe the milestone"
                    value={newMilestone.description}
                    onChange={(e) => setNewMilestone(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Due Date</label>
                    <Input
                      type="date"
                      value={newMilestone.due_date}
                      onChange={(e) => setNewMilestone(prev => ({ ...prev, due_date: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Owner</label>
                    <Input
                      placeholder="Owner name"
                      value={newMilestone.owner_name}
                      onChange={(e) => setNewMilestone(prev => ({ ...prev, owner_name: e.target.value }))}
                    />
                  </div>
                </div>
                <Button 
                  className="w-full"
                  onClick={handleAddMilestone}
                  disabled={!newMilestone.title || savingMilestone}
                >
                  {savingMilestone ? (
                    <>
                      <Loader2 size={16} className="animate-spin mr-2" />
                      Adding...
                    </>
                  ) : (
                    'Create Milestone'
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* ATLAS Assistance - AI Chat */}
      <AtlasAssistance 
        sessionId={activeSession?.id || null}
        milestones={milestones.map(m => ({
          title: m.title,
          description: m.description,
          status: m.status,
          due_date: m.due_date,
          owner_name: m.owner_name
        }))}
        executionPlan={activeSession?.execution_plan}
        problemDescription={activeSession?.problem_description || null}
        problemDomain={activeSession?.problem_domain || null}
      />

      {/* Active Session Info */}
      {activeSession && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Brain className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold">Active Strategic Plan</h3>
                  <Badge variant="outline" className="capitalize">{activeSession.problem_domain?.replace('_', ' ')}</Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {activeSession.execution_plan?.planDescription || activeSession.problem_description}
                </p>
                {activeSession.execution_plan?.duration && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Duration: {activeSession.execution_plan.duration}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress Overview */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Milestones</p>
                <p className="text-2xl font-bold">{milestones.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{completedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold">
                  {milestones.filter(m => m.status === 'in_progress').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-destructive/10 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Blocked</p>
                <p className="text-2xl font-bold">
                  {milestones.filter(m => m.status === 'blocked').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overall Progress */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp size={18} />
            Overall Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Progress value={progressPercent} className="flex-1 h-3" />
            <span className="text-lg font-bold">{Math.round(progressPercent)}%</span>
          </div>
        </CardContent>
      </Card>

      {/* Success Metrics (from AI plan) */}
      {activeSession?.execution_plan?.successMetrics && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Target size={18} />
              Success Metrics
            </CardTitle>
            <CardDescription>Key metrics to track for this plan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {activeSession.execution_plan.successMetrics.map((metric: any, idx: number) => (
                <div key={idx} className="p-4 rounded-lg bg-secondary/50 border">
                  <p className="font-medium">{metric.metric}</p>
                  <p className="text-sm text-primary font-semibold mt-1">{metric.target}</p>
                  <p className="text-xs text-muted-foreground">{metric.timeline}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Milestones List */}
      <div className="space-y-3">
        <h2 className="font-semibold text-lg">Milestones</h2>
        {milestones.map((milestone, idx) => {
          const config = statusConfig[milestone.status];
          const StatusIcon = config.icon;

          return (
            <motion.div
              key={milestone.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className={cn(
                "transition-all",
                milestone.status === 'complete' && "opacity-75"
              )}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Status Icon */}
                    <button 
                      onClick={() => {
                        const statuses: Milestone['status'][] = ['not_started', 'in_progress', 'blocked', 'complete'];
                        const currentIdx = statuses.indexOf(milestone.status);
                        const nextStatus = statuses[(currentIdx + 1) % statuses.length];
                        updateStatus(milestone.id, nextStatus);
                      }}
                      className={cn("p-2 rounded-lg transition-colors", config.bg)}
                    >
                      <StatusIcon className={cn("w-5 h-5", config.color)} />
                    </button>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className={cn(
                            "font-medium",
                            milestone.status === 'complete' && "line-through text-muted-foreground"
                          )}>
                            {milestone.title}
                          </h3>
                          {milestone.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {milestone.description}
                            </p>
                          )}
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical size={16} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => updateStatus(milestone.id, 'not_started')}>
                              Mark as Not Started
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateStatus(milestone.id, 'in_progress')}>
                              Mark as In Progress
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateStatus(milestone.id, 'blocked')}>
                              Mark as Blocked
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateStatus(milestone.id, 'complete')}>
                              Mark as Complete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Meta info */}
                      <div className="flex flex-wrap items-center gap-4 mt-3 text-sm">
                        <Badge variant="outline" className={config.bg}>
                          {config.label}
                        </Badge>
                        
                        {milestone.due_date && (
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Calendar size={14} />
                            {new Date(milestone.due_date).toLocaleDateString()}
                          </span>
                        )}
                        
                        {milestone.owner_name && (
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <User size={14} />
                            {milestone.owner_name}
                          </span>
                        )}
                      </div>

                      {/* Expected vs Actual */}
                      {(milestone.expected_outcome || milestone.actual_outcome) && (
                        <div className="grid md:grid-cols-2 gap-4 mt-4 pt-4 border-t">
                          {milestone.expected_outcome && (
                            <div className="flex items-start gap-2">
                              <Flag size={14} className="text-muted-foreground mt-0.5" />
                              <div>
                                <p className="text-xs text-muted-foreground">Expected</p>
                                <p className="text-sm">{milestone.expected_outcome}</p>
                              </div>
                            </div>
                          )}
                          {milestone.actual_outcome && (
                            <div className="flex items-start gap-2">
                              <CheckCircle2 size={14} className="text-green-500 mt-0.5" />
                              <div>
                                <p className="text-xs text-muted-foreground">Actual</p>
                                <p className="text-sm text-green-600 dark:text-green-400">{milestone.actual_outcome}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Blockers */}
                      {milestone.blockers && (
                        <div className="mt-3 p-3 bg-destructive/10 rounded-lg flex items-start gap-2">
                          <AlertTriangle size={14} className="text-destructive mt-0.5" />
                          <div>
                            <p className="text-xs font-medium text-destructive">Blocker</p>
                            <p className="text-sm">{milestone.blockers}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Risks (from AI plan) */}
      {activeSession?.execution_plan?.risks && activeSession.execution_plan.risks.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle size={18} className="text-yellow-500" />
              Identified Risks
            </CardTitle>
            <CardDescription>Risks and mitigation strategies from AI analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeSession.execution_plan.risks.map((risk: any, idx: number) => (
                <div key={idx} className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800">
                  <p className="font-medium text-yellow-800 dark:text-yellow-200">{risk.risk}</p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    <strong>Mitigation:</strong> {risk.mitigation}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
