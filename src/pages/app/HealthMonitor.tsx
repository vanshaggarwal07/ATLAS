import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp,
  TrendingDown,
  Shield,
  Clock,
  Zap,
  Target,
  AlertCircle,
  Info,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useCompany } from '@/hooks/useCompany';
import { cn } from '@/lib/utils';

interface HealthIndicator {
  id: string;
  name: string;
  indicator_type: string;
  severity: string | null;
  description: string | null;
  recommendation: string | null;
  is_active: boolean;
}

const healthScore = 78;

const mockIndicators: HealthIndicator[] = [
  {
    id: '1',
    name: 'High Customer Acquisition Cost',
    indicator_type: 'financial',
    severity: 'warning',
    description: 'CAC has increased by 23% over the last quarter, affecting unit economics',
    recommendation: 'Review marketing spend allocation and optimize high-performing channels',
    is_active: true
  },
  {
    id: '2',
    name: 'Strong Retention Metrics',
    indicator_type: 'customer',
    severity: 'success',
    description: 'Customer retention rate at 94%, above industry benchmark of 85%',
    recommendation: 'Continue current customer success initiatives',
    is_active: true
  },
  {
    id: '3',
    name: 'Runway Risk',
    indicator_type: 'financial',
    severity: 'critical',
    description: 'Current burn rate leaves 8 months of runway at current pace',
    recommendation: 'Consider cost optimization or accelerate fundraising timeline',
    is_active: true
  },
  {
    id: '4',
    name: 'Product Velocity Healthy',
    indicator_type: 'product',
    severity: 'success',
    description: 'Shipping new features at 2x industry average pace',
    recommendation: 'Maintain development velocity while monitoring quality metrics',
    is_active: true
  },
  {
    id: '5',
    name: 'Team Scaling Gap',
    indicator_type: 'operations',
    severity: 'warning',
    description: 'Engineering team 3 hires behind target for Q1',
    recommendation: 'Increase recruiting pipeline or consider contractor support',
    is_active: true
  }
];

const healthCategories = [
  { name: 'Financial Health', score: 65, icon: TrendingUp, color: 'text-yellow-500' },
  { name: 'Customer Health', score: 92, icon: Shield, color: 'text-green-500' },
  { name: 'Product Health', score: 85, icon: Zap, color: 'text-green-500' },
  { name: 'Operations Health', score: 70, icon: Target, color: 'text-yellow-500' },
];

const strategicDebt = [
  { area: 'Technical Debt', level: 35, trend: 'increasing', impact: 'Slowing feature delivery' },
  { area: 'Process Debt', level: 20, trend: 'stable', impact: 'Manual workflows still in use' },
  { area: 'Talent Debt', level: 45, trend: 'decreasing', impact: 'Key role gaps being filled' },
  { area: 'Market Debt', level: 25, trend: 'stable', impact: 'Competitors gaining in segments' },
];

const getSeverityConfig = (severity: string | null) => {
  switch (severity) {
    case 'critical':
      return { icon: AlertCircle, color: 'text-destructive', bg: 'bg-destructive/10', label: 'Critical' };
    case 'warning':
      return { icon: AlertTriangle, color: 'text-yellow-500', bg: 'bg-yellow-100 dark:bg-yellow-900/30', label: 'Warning' };
    case 'success':
      return { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30', label: 'Healthy' };
    default:
      return { icon: Info, color: 'text-muted-foreground', bg: 'bg-muted', label: 'Info' };
  }
};

export default function HealthMonitor() {
  const { company } = useCompany();
  const [indicators, setIndicators] = useState<HealthIndicator[]>(mockIndicators);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const fetchIndicators = async () => {
      if (!company) return;
      
      setLoading(true);
      const { data } = await supabase
        .from('health_indicators')
        .select('*')
        .eq('company_id', company.id)
        .eq('is_active', true);
      
      if (data && data.length > 0) {
        setIndicators(data as HealthIndicator[]);
      }
      setLoading(false);
    };

    fetchIndicators();
  }, [company]);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh
    await new Promise(r => setTimeout(r, 1500));
    setRefreshing(false);
  };

  const criticalCount = indicators.filter(i => i.severity === 'critical').length;
  const warningCount = indicators.filter(i => i.severity === 'warning').length;
  const healthyCount = indicators.filter(i => i.severity === 'success').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Health Monitor</h1>
          <p className="text-muted-foreground mt-1">
            Real-time business health signals and strategic risk indicators
          </p>
        </div>
        <Button 
          variant="outline" 
          className="gap-2"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw size={16} className={cn(refreshing && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Overall Health Score */}
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            {/* Score Circle */}
            <div className="relative w-32 h-32 mx-auto md:mx-0">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="hsl(var(--muted))"
                  strokeWidth="12"
                  fill="none"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke={healthScore >= 80 ? 'hsl(var(--chart-3))' : healthScore >= 60 ? 'hsl(var(--chart-4))' : 'hsl(var(--destructive))'}
                  strokeWidth="12"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${(healthScore / 100) * 352} 352`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold">{healthScore}</span>
              </div>
            </div>

            {/* Summary */}
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-xl font-semibold">Overall Business Health</h2>
                <p className="text-muted-foreground">
                  Your business is performing well with some areas needing attention
                </p>
              </div>
              <div className="flex flex-wrap gap-4">
                <Badge className="bg-destructive/10 text-destructive gap-1 px-3 py-1">
                  <AlertCircle size={14} />
                  {criticalCount} Critical
                </Badge>
                <Badge className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 gap-1 px-3 py-1">
                  <AlertTriangle size={14} />
                  {warningCount} Warnings
                </Badge>
                <Badge className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 gap-1 px-3 py-1">
                  <CheckCircle2 size={14} />
                  {healthyCount} Healthy
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Health Categories */}
      <div className="grid md:grid-cols-4 gap-4">
        {healthCategories.map((category, idx) => (
          <motion.div
            key={category.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={cn("p-2 rounded-lg", 
                    category.score >= 80 ? "bg-green-100 dark:bg-green-900/30" : 
                    category.score >= 60 ? "bg-yellow-100 dark:bg-yellow-900/30" : 
                    "bg-destructive/10"
                  )}>
                    <category.icon className={cn("w-5 h-5", category.color)} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">{category.name}</p>
                    <p className="text-2xl font-bold">{category.score}%</p>
                  </div>
                </div>
                <Progress 
                  value={category.score} 
                  className="h-2"
                />
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Health Indicators */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Active Signals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity size={18} />
              Active Signals
            </CardTitle>
            <CardDescription>Current health indicators requiring attention</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {indicators.map((indicator, idx) => {
              const config = getSeverityConfig(indicator.severity);
              const Icon = config.icon;

              return (
                <motion.div
                  key={indicator.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={cn("p-4 rounded-lg border", config.bg)}
                >
                  <div className="flex items-start gap-3">
                    <Icon className={cn("w-5 h-5 mt-0.5", config.color)} />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{indicator.name}</h4>
                        <Badge variant="outline" className={cn("text-xs", config.color)}>
                          {config.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{indicator.description}</p>
                      {indicator.recommendation && (
                        <p className="text-sm mt-2 p-2 bg-background rounded">
                          <span className="font-medium">Recommendation:</span> {indicator.recommendation}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </CardContent>
        </Card>

        {/* Strategic Debt */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock size={18} />
              Strategic Debt
            </CardTitle>
            <CardDescription>Areas where shortcuts are accumulating</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {strategicDebt.map((debt, idx) => (
              <motion.div
                key={debt.area}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{debt.area}</h4>
                    <Badge variant="outline" className={cn(
                      "text-xs",
                      debt.trend === 'increasing' ? "text-destructive" :
                      debt.trend === 'decreasing' ? "text-green-500" : "text-muted-foreground"
                    )}>
                      {debt.trend === 'increasing' && <TrendingUp size={10} className="mr-1" />}
                      {debt.trend === 'decreasing' && <TrendingDown size={10} className="mr-1" />}
                      {debt.trend}
                    </Badge>
                  </div>
                  <span className="font-bold">{debt.level}%</span>
                </div>
                <Progress 
                  value={debt.level} 
                  className={cn(
                    "h-2",
                    debt.level > 40 ? "[&>div]:bg-destructive" : 
                    debt.level > 25 ? "[&>div]:bg-yellow-500" : ""
                  )}
                />
                <p className="text-xs text-muted-foreground">{debt.impact}</p>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
