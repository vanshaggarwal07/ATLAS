import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Download,
  Filter,
  BarChart3,
  PieChart,
  LineChart as LineChartIcon
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart as RechartsPie,
  Pie,
  Cell
} from 'recharts';
import { cn } from '@/lib/utils';

const revenueData = [
  { month: 'Jul', revenue: 45000, target: 50000, lastYear: 35000 },
  { month: 'Aug', revenue: 52000, target: 52000, lastYear: 38000 },
  { month: 'Sep', revenue: 48000, target: 55000, lastYear: 42000 },
  { month: 'Oct', revenue: 61000, target: 58000, lastYear: 45000 },
  { month: 'Nov', revenue: 72000, target: 62000, lastYear: 48000 },
  { month: 'Dec', revenue: 85000, target: 70000, lastYear: 52000 },
  { month: 'Jan', revenue: 91000, target: 75000, lastYear: 55000 },
];

const customerData = [
  { month: 'Jul', new: 45, churned: 8, net: 37 },
  { month: 'Aug', new: 52, churned: 6, net: 46 },
  { month: 'Sep', new: 38, churned: 10, net: 28 },
  { month: 'Oct', new: 65, churned: 7, net: 58 },
  { month: 'Nov', new: 78, churned: 5, net: 73 },
  { month: 'Dec', new: 92, churned: 8, net: 84 },
  { month: 'Jan', new: 105, churned: 6, net: 99 },
];

const channelData = [
  { name: 'Organic', value: 35, color: 'hsl(var(--primary))' },
  { name: 'Paid Ads', value: 28, color: 'hsl(var(--chart-2))' },
  { name: 'Referrals', value: 22, color: 'hsl(var(--chart-3))' },
  { name: 'Direct', value: 15, color: 'hsl(var(--chart-4))' },
];

const cohortData = [
  { cohort: 'Q1 2025', month1: 100, month2: 92, month3: 85, month4: 78, month5: 72, month6: 68 },
  { cohort: 'Q2 2025', month1: 100, month2: 94, month3: 88, month4: 82, month5: 77, month6: 73 },
  { cohort: 'Q3 2025', month1: 100, month2: 95, month3: 90, month4: 86, month5: 82, month6: null },
  { cohort: 'Q4 2025', month1: 100, month2: 96, month3: 92, month4: null, month5: null, month6: null },
];

const metrics = [
  { 
    label: 'Monthly Revenue', 
    value: '$91,000', 
    change: '+12.4%', 
    trend: 'up',
    icon: DollarSign,
    description: 'vs last month'
  },
  { 
    label: 'Annual Run Rate', 
    value: '$1.09M', 
    change: '+28.6%', 
    trend: 'up',
    icon: TrendingUp,
    description: 'YoY growth'
  },
  { 
    label: 'Active Customers', 
    value: '847', 
    change: '+99', 
    trend: 'up',
    icon: Users,
    description: 'net new this month'
  },
  { 
    label: 'Churn Rate', 
    value: '2.1%', 
    change: '-0.3%', 
    trend: 'down',
    icon: TrendingDown,
    description: 'vs last quarter'
  },
];

export default function GrowthAnalytics() {
  const [timeRange, setTimeRange] = useState('6m');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Growth Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Track key metrics and analyze business performance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px]">
              <Calendar size={14} className="mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">Last Month</SelectItem>
              <SelectItem value="3m">Last 3 Months</SelectItem>
              <SelectItem value="6m">Last 6 Months</SelectItem>
              <SelectItem value="1y">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <Download size={16} />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-4">
        {metrics.map((metric, idx) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">{metric.label}</p>
                    <p className="text-3xl font-bold">{metric.value}</p>
                    <div className="flex items-center gap-1">
                      {metric.trend === 'up' ? (
                        <ArrowUpRight size={14} className="text-green-500" />
                      ) : (
                        <ArrowDownRight size={14} className="text-green-500" />
                      )}
                      <span className={cn(
                        "text-sm font-medium",
                        metric.trend === 'up' ? "text-green-500" : "text-green-500"
                      )}>
                        {metric.change}
                      </span>
                      <span className="text-xs text-muted-foreground">{metric.description}</span>
                    </div>
                  </div>
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <metric.icon className="w-5 h-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue" className="gap-2">
            <LineChartIcon size={14} />
            Revenue
          </TabsTrigger>
          <TabsTrigger value="customers" className="gap-2">
            <BarChart3 size={14} />
            Customers
          </TabsTrigger>
          <TabsTrigger value="channels" className="gap-2">
            <PieChart size={14} />
            Channels
          </TabsTrigger>
          <TabsTrigger value="cohorts" className="gap-2">
            <Filter size={14} />
            Cohorts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="revenue">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
              <CardDescription>Monthly revenue vs target and year-over-year comparison</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `$${v/1000}k`} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                    />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="hsl(var(--primary))" 
                      fill="url(#colorRevenue)" 
                      strokeWidth={2}
                      name="Revenue"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="target" 
                      stroke="hsl(var(--muted-foreground))" 
                      strokeDasharray="5 5"
                      strokeWidth={2}
                      dot={false}
                      name="Target"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="lastYear" 
                      stroke="hsl(var(--chart-2))" 
                      strokeWidth={2}
                      dot={false}
                      name="Last Year"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers">
          <Card>
            <CardHeader>
              <CardTitle>Customer Growth</CardTitle>
              <CardDescription>New customers, churned, and net growth by month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={customerData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="new" fill="hsl(var(--chart-3))" name="New Customers" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="churned" fill="hsl(var(--destructive))" name="Churned" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="net" fill="hsl(var(--primary))" name="Net Growth" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="channels">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Acquisition Channels</CardTitle>
                <CardDescription>Customer acquisition by source</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPie>
                      <Pie
                        data={channelData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {channelData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPie>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Channel Breakdown</CardTitle>
                <CardDescription>Performance by acquisition channel</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {channelData.map((channel) => (
                    <div key={channel.name} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{channel.name}</span>
                        <span className="text-muted-foreground">{channel.value}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all"
                          style={{ width: `${channel.value}%`, backgroundColor: channel.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cohorts">
          <Card>
            <CardHeader>
              <CardTitle>Retention Cohorts</CardTitle>
              <CardDescription>Customer retention by signup cohort (% remaining)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2 font-medium">Cohort</th>
                      <th className="text-center py-3 px-2 font-medium">Month 1</th>
                      <th className="text-center py-3 px-2 font-medium">Month 2</th>
                      <th className="text-center py-3 px-2 font-medium">Month 3</th>
                      <th className="text-center py-3 px-2 font-medium">Month 4</th>
                      <th className="text-center py-3 px-2 font-medium">Month 5</th>
                      <th className="text-center py-3 px-2 font-medium">Month 6</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cohortData.map((row) => (
                      <tr key={row.cohort} className="border-b">
                        <td className="py-3 px-2 font-medium">{row.cohort}</td>
                        {[row.month1, row.month2, row.month3, row.month4, row.month5, row.month6].map((val, idx) => (
                          <td key={idx} className="text-center py-3 px-2">
                            {val !== null ? (
                              <span 
                                className="inline-block px-3 py-1 rounded text-white text-xs font-medium"
                                style={{ 
                                  backgroundColor: `hsl(var(--primary) / ${val / 100})`,
                                  color: val > 50 ? 'white' : 'hsl(var(--foreground))'
                                }}
                              >
                                {val}%
                              </span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
