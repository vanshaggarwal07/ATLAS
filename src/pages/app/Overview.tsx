import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Percent, 
  Activity,
  ArrowUpRight,
  Brain,
  Zap,
  Target,
  Building2,
  FileText,
  BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCompany } from '@/hooks/useCompany';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { 
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';

// Demo data
const revenueData = [
  { month: 'Jul', revenue: 45000, preAtlas: 42000 },
  { month: 'Aug', revenue: 52000, preAtlas: 43000 },
  { month: 'Sep', revenue: 61000, preAtlas: 44500 },
  { month: 'Oct', revenue: 73000, preAtlas: 45000 },
  { month: 'Nov', revenue: 89000, preAtlas: 46000 },
  { month: 'Dec', revenue: 108000, preAtlas: 47000 },
];

const kpis = [
  { 
    title: 'Monthly Revenue', 
    value: '$108,000', 
    change: '+21%', 
    trend: 'up',
    icon: DollarSign,
    description: 'vs last month'
  },
  { 
    title: 'Growth Rate', 
    value: '21.3%', 
    change: '+8.2%', 
    trend: 'up',
    icon: TrendingUp,
    description: 'MoM growth'
  },
  { 
    title: 'Retention Rate', 
    value: '94.2%', 
    change: '+2.1%', 
    trend: 'up',
    icon: Percent,
    description: 'Customer retention'
  },
  { 
    title: 'Active Customers', 
    value: '2,847', 
    change: '+156', 
    trend: 'up',
    icon: Users,
    description: 'This month'
  },
];

const atlasInsights = [
  {
    title: 'Revenue acceleration detected',
    description: 'Growth rate increased 3x since implementing ATLAS pricing recommendations',
    impact: '+$42,000 MRR',
    type: 'success'
  },
  {
    title: 'Churn risk identified',
    description: '12 enterprise accounts showing reduced engagement. Action recommended.',
    impact: 'At risk: $18,000 ARR',
    type: 'warning'
  },
  {
    title: 'Expansion opportunity',
    description: '28 accounts ready for upsell based on usage patterns',
    impact: 'Potential: $35,000 ARR',
    type: 'opportunity'
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function Overview() {
  const { company } = useCompany();

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Header with Company Info */}
      <motion.div variants={item} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Business Overview</h1>
          <p className="text-muted-foreground">
            Welcome back. Here's what's happening with {company?.name || 'your business'}.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to="/app/analytics">View Full Analytics</Link>
          </Button>
          <Button size="sm" className="gap-2" asChild>
            <Link to="/app/consulting">
              <Brain size={16} />
              Start Consulting Session
            </Link>
          </Button>
        </div>
      </motion.div>

      {/* Company Card */}
      {company && (
        <motion.div variants={item}>
          <Card className="card-glass border-primary/20">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center">
                    <Building2 className="text-primary-foreground" size={28} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{company.name}</h2>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                      <span className="capitalize">{company.industry?.replace('_', ' ')}</span>
                      <span>•</span>
                      <span className="capitalize">{company.stage?.replace('_', ' ')}</span>
                      {company.employee_count && (
                        <>
                          <span>•</span>
                          <span>{company.employee_count} employees</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {company.gstin && (
                    <div className="px-3 py-1.5 rounded-lg bg-secondary text-sm">
                      <span className="text-muted-foreground">GSTIN:</span>{' '}
                      <span className="font-mono">{company.gstin}</span>
                    </div>
                  )}
                  {company.website && (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-secondary text-sm flex items-center gap-1 hover:bg-muted transition-colors"
                    >
                      {company.website.replace('https://', '').replace('http://', '')}
                      <ArrowUpRight size={12} />
                    </a>
                  )}
                </div>
              </div>
              {company.description && (
                <p className="text-sm text-muted-foreground mt-4 pt-4 border-t">{company.description}</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* KPIs */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.title} className="card-soothing">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="p-2 rounded-lg bg-primary/10">
                  <kpi.icon size={20} className="text-primary" />
                </div>
                <div className={cn(
                  "flex items-center gap-1 text-sm font-medium",
                  kpi.trend === 'up' ? 'text-green-500' : 'text-red-500'
                )}>
                  {kpi.trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  {kpi.change}
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold">{kpi.value}</p>
                <p className="text-sm text-muted-foreground">{kpi.title}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Charts Row */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2 card-soothing">
          <CardHeader>
            <CardTitle>Revenue Growth</CardTitle>
            <CardDescription>Pre-ATLAS vs Post-ATLAS performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorPreAtlas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `$${v/1000}k`} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="preAtlas" 
                    stroke="hsl(var(--muted-foreground))" 
                    strokeDasharray="5 5"
                    fill="url(#colorPreAtlas)" 
                    name="Pre-ATLAS projection"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="hsl(var(--primary))" 
                    fill="url(#colorRevenue)" 
                    strokeWidth={2}
                    name="Actual revenue"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-6 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-primary" />
                <span>With ATLAS</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-muted-foreground border-dashed" style={{ borderStyle: 'dashed' }} />
                <span className="text-muted-foreground">Projected without ATLAS</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ATLAS Impact */}
        <Card className="card-soothing">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="text-primary" size={20} />
              ATLAS Impact
            </CardTitle>
            <CardDescription>What changed because of ATLAS</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
              <p className="text-3xl font-bold text-primary">+129%</p>
              <p className="text-sm text-muted-foreground">Revenue growth acceleration</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-secondary">
                <p className="text-lg font-semibold">$61,000</p>
                <p className="text-xs text-muted-foreground">Additional MRR</p>
              </div>
              <div className="p-3 rounded-lg bg-secondary">
                <p className="text-lg font-semibold">3.2x</p>
                <p className="text-xs text-muted-foreground">Faster decisions</p>
              </div>
            </div>
            <Button variant="outline" className="w-full" asChild>
              <Link to="/app/analytics">
                View Full Impact Report
                <ArrowUpRight size={14} className="ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Insights */}
      <motion.div variants={item}>
        <Card className="card-soothing">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="text-primary" size={20} />
                  AI Insights
                </CardTitle>
                <CardDescription>Real-time intelligence from your business data</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link to="/app/consulting">Start Session</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {atlasInsights.map((insight, i) => (
                <div 
                  key={i}
                  className={cn(
                    "p-4 rounded-xl border",
                    insight.type === 'success' && "bg-green-500/5 border-green-500/20",
                    insight.type === 'warning' && "bg-yellow-500/5 border-yellow-500/20",
                    insight.type === 'opportunity' && "bg-blue-500/5 border-blue-500/20"
                  )}
                >
                  <h4 className="font-medium mb-1">{insight.title}</h4>
                  <p className="text-sm text-muted-foreground mb-3">{insight.description}</p>
                  <p className={cn(
                    "text-sm font-semibold",
                    insight.type === 'success' && "text-green-500",
                    insight.type === 'warning' && "text-yellow-600",
                    insight.type === 'opportunity' && "text-blue-500"
                  )}>
                    {insight.impact}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/app/consulting">
          <Card className="card-soothing hover:border-primary/50 transition-all cursor-pointer group h-full">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Brain className="text-primary" size={24} />
              </div>
              <div>
                <h3 className="font-semibold">Start Consulting Session</h3>
                <p className="text-sm text-muted-foreground">Get AI-powered strategy advice</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link to="/app/execution">
          <Card className="card-soothing hover:border-primary/50 transition-all cursor-pointer group h-full">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-accent/10 group-hover:bg-accent/20 transition-colors">
                <Target className="text-accent" size={24} />
              </div>
              <div>
                <h3 className="font-semibold">ATLAS Workspace</h3>
                <p className="text-sm text-muted-foreground">Monitor your execution plans</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link to="/app/health">
          <Card className="card-soothing hover:border-primary/50 transition-all cursor-pointer group h-full">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-green-500/10 group-hover:bg-green-500/20 transition-colors">
                <Activity className="text-green-500" size={24} />
              </div>
              <div>
                <h3 className="font-semibold">Health Check</h3>
                <p className="text-sm text-muted-foreground">Review business health signals</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </motion.div>
    </motion.div>
  );
}
