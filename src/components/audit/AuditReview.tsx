import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle,
  ArrowRight,
  FileText,
  IndianRupee,
  Eye,
  Check,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface AuditReviewProps {
  sessionId: string;
  onNext: () => void;
}

interface Finding {
  id: string;
  finding_type: string;
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low' | 'info';
  category: string | null;
  evidence: any;
  financial_impact: number | null;
  recommendation: string | null;
  status: string;
  ai_confidence: number | null;
}

const SEVERITY_CONFIG = {
  high: {
    icon: AlertTriangle,
    color: 'text-red-500',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    badge: 'bg-red-500/10 text-red-500',
  },
  medium: {
    icon: AlertCircle,
    color: 'text-yellow-500',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/20',
    badge: 'bg-yellow-500/10 text-yellow-500',
  },
  low: {
    icon: Info,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    badge: 'bg-blue-500/10 text-blue-500',
  },
  info: {
    icon: Info,
    color: 'text-muted-foreground',
    bg: 'bg-muted/50',
    border: 'border-border',
    badge: 'bg-muted text-muted-foreground',
  },
};

export function AuditReview({ sessionId, onNext }: AuditReviewProps) {
  const queryClient = useQueryClient();
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
  const [activeTab, setActiveTab] = useState('all');

  // Fetch findings
  const { data: findings, isLoading } = useQuery({
    queryKey: ['audit-findings', sessionId],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from('audit_findings' as any)
        .select('*')
        .eq('session_id', sessionId)
        .order('severity', { ascending: true }) as any);
      if (error) throw error;
      return data as Finding[];
    },
  });

  // Update finding status
  const updateFindingStatus = useMutation({
    mutationFn: async ({ findingId, status }: { findingId: string; status: string }) => {
      const { error } = await (supabase
        .from('audit_findings' as any)
        .update({ status })
        .eq('id', findingId) as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audit-findings', sessionId] });
      toast.success('Finding status updated');
    },
  });

  const filteredFindings = findings?.filter(f => {
    if (activeTab === 'all') return true;
    return f.severity === activeTab;
  }) || [];

  const findingCounts = {
    all: findings?.length || 0,
    high: findings?.filter(f => f.severity === 'high').length || 0,
    medium: findings?.filter(f => f.severity === 'medium').length || 0,
    low: findings?.filter(f => f.severity === 'low').length || 0,
    info: findings?.filter(f => f.severity === 'info').length || 0,
  };

  const totalImpact = findings?.reduce((sum, f) => sum + (f.financial_impact || 0), 0) || 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{findingCounts.high}</p>
                <p className="text-sm text-muted-foreground">High Risk</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{findingCounts.medium}</p>
                <p className="text-sm text-muted-foreground">Medium Risk</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Info className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{findingCounts.low}</p>
                <p className="text-sm text-muted-foreground">Low Risk</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <IndianRupee className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatCurrency(totalImpact)}</p>
                <p className="text-sm text-muted-foreground">Total Impact</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Findings List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Audit Findings
          </CardTitle>
          <CardDescription>
            Review and acknowledge findings detected by the AI audit
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">
                All ({findingCounts.all})
              </TabsTrigger>
              <TabsTrigger value="high" className="text-red-500">
                High ({findingCounts.high})
              </TabsTrigger>
              <TabsTrigger value="medium" className="text-yellow-500">
                Medium ({findingCounts.medium})
              </TabsTrigger>
              <TabsTrigger value="low" className="text-blue-500">
                Low ({findingCounts.low})
              </TabsTrigger>
            </TabsList>

            <div className="space-y-3">
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading findings...
                </div>
              ) : filteredFindings.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <p className="text-muted-foreground">No findings in this category</p>
                </div>
              ) : (
                filteredFindings.map((finding) => {
                  const config = SEVERITY_CONFIG[finding.severity];
                  const Icon = config.icon;

                  return (
                    <div
                      key={finding.id}
                      className={`p-4 rounded-lg border ${config.bg} ${config.border} ${
                        finding.status === 'acknowledged' ? 'opacity-60' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Icon className={`w-5 h-5 ${config.color} shrink-0 mt-0.5`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h4 className="font-medium">{finding.title}</h4>
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {finding.description}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              {finding.financial_impact && (
                                <Badge variant="outline">
                                  {formatCurrency(finding.financial_impact)}
                                </Badge>
                              )}
                              <Badge className={config.badge}>
                                {finding.severity}
                              </Badge>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 mt-3">
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1"
                              onClick={() => setSelectedFinding(finding)}
                            >
                              <Eye className="w-4 h-4" />
                              View Details
                            </Button>
                            {finding.status !== 'acknowledged' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="gap-1 text-green-600"
                                onClick={() => updateFindingStatus.mutate({
                                  findingId: finding.id,
                                  status: 'acknowledged',
                                })}
                              >
                                <Check className="w-4 h-4" />
                                Acknowledge
                              </Button>
                            )}
                            {finding.category && (
                              <span className="text-xs text-muted-foreground">
                                Category: {finding.category}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* Continue Button */}
      <div className="flex justify-end">
        <Button size="lg" onClick={onNext} className="gap-2">
          Generate Final Report
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Finding Detail Dialog */}
      <Dialog open={!!selectedFinding} onOpenChange={() => setSelectedFinding(null)}>
        <DialogContent className="max-w-2xl">
          {selectedFinding && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  {(() => {
                    const config = SEVERITY_CONFIG[selectedFinding.severity];
                    const Icon = config.icon;
                    return <Icon className={`w-5 h-5 ${config.color}`} />;
                  })()}
                  <DialogTitle>{selectedFinding.title}</DialogTitle>
                </div>
                <DialogDescription>
                  Finding Type: {selectedFinding.finding_type}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-muted-foreground">{selectedFinding.description}</p>
                </div>

                {selectedFinding.evidence && (
                  <div>
                    <h4 className="font-medium mb-2">Evidence</h4>
                    <div className="p-3 rounded-lg bg-muted text-sm">
                      <pre className="whitespace-pre-wrap">
                        {JSON.stringify(selectedFinding.evidence, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {selectedFinding.financial_impact && (
                  <div>
                    <h4 className="font-medium mb-2">Financial Impact</h4>
                    <p className="text-2xl font-bold text-primary">
                      {formatCurrency(selectedFinding.financial_impact)}
                    </p>
                  </div>
                )}

                {selectedFinding.recommendation && (
                  <div>
                    <h4 className="font-medium mb-2">Recommendation</h4>
                    <p className="text-muted-foreground">{selectedFinding.recommendation}</p>
                  </div>
                )}

                {selectedFinding.ai_confidence && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>AI Confidence:</span>
                    <span className="font-medium">{(selectedFinding.ai_confidence * 100).toFixed(0)}%</span>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
