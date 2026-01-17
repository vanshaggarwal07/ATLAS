import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2, 
  Target,
  Clock,
  Shield,
  Zap,
  BarChart3,
  ArrowRight,
  Sparkles,
  Plus
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useCompany } from '@/hooks/useCompany';
import { cn } from '@/lib/utils';

interface Scenario {
  id: string;
  name: string;
  description: string;
  risk_level: string;
  confidence_score: number;
  time_to_impact: string;
  is_recommended: boolean;
  assumptions: any;
  expected_outcome: any;
}

const mockScenarios: Scenario[] = [
  {
    id: '1',
    name: 'Aggressive Expansion',
    description: 'Rapid market expansion with heavy investment in sales and marketing',
    risk_level: 'high',
    confidence_score: 72,
    time_to_impact: '6 months',
    is_recommended: false,
    assumptions: ['Market demand remains strong', 'Funding secured', 'Hiring targets met'],
    expected_outcome: { revenue_growth: 150, market_share: 25, burn_rate: 180 }
  },
  {
    id: '2',
    name: 'Sustainable Growth',
    description: 'Balanced approach focusing on profitability while growing steadily',
    risk_level: 'medium',
    confidence_score: 85,
    time_to_impact: '12 months',
    is_recommended: true,
    assumptions: ['Unit economics improve', 'Retention stays above 90%', 'Cost optimization'],
    expected_outcome: { revenue_growth: 80, market_share: 15, burn_rate: 50 }
  },
  {
    id: '3',
    name: 'Product-Led Growth',
    description: 'Focus on product improvements to drive organic acquisition',
    risk_level: 'low',
    confidence_score: 78,
    time_to_impact: '9 months',
    is_recommended: false,
    assumptions: ['Product improvements resonate', 'Viral coefficient improves', 'Low CAC maintained'],
    expected_outcome: { revenue_growth: 60, market_share: 12, burn_rate: 20 }
  }
];

const getRiskColor = (risk: string) => {
  switch (risk) {
    case 'high': return 'text-destructive bg-destructive/10';
    case 'medium': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30';
    case 'low': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
    default: return 'text-muted-foreground bg-muted';
  }
};

const getRiskIcon = (risk: string) => {
  switch (risk) {
    case 'high': return AlertTriangle;
    case 'medium': return Shield;
    case 'low': return CheckCircle2;
    default: return Target;
  }
};

export default function StrategyScenarios() {
  const { company } = useCompany();
  const [scenarios, setScenarios] = useState<Scenario[]>(mockScenarios);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(mockScenarios[1]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchScenarios = async () => {
      if (!company) return;
      
      setLoading(true);
      const { data } = await supabase
        .from('strategy_scenarios')
        .select('*')
        .order('confidence_score', { ascending: false });
      
      if (data && data.length > 0) {
        setScenarios(data as Scenario[]);
        setSelectedScenario(data.find(s => s.is_recommended) || data[0]);
      }
      setLoading(false);
    };

    fetchScenarios();
  }, [company]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Strategy Scenarios</h1>
          <p className="text-muted-foreground mt-1">
            Compare strategic options and understand risk-reward tradeoffs
          </p>
        </div>
        <Button className="gap-2">
          <Plus size={16} />
          New Scenario
        </Button>
      </div>

      {/* Scenario Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        {scenarios.map((scenario, idx) => {
          const RiskIcon = getRiskIcon(scenario.risk_level);
          return (
            <motion.div
              key={scenario.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card 
                className={cn(
                  "cursor-pointer transition-all hover:shadow-md",
                  selectedScenario?.id === scenario.id && "ring-2 ring-primary"
                )}
                onClick={() => setSelectedScenario(scenario)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      {scenario.is_recommended && (
                        <Badge className="mb-2 bg-primary/10 text-primary border-0">
                          <Sparkles size={12} className="mr-1" />
                          Recommended
                        </Badge>
                      )}
                      <CardTitle className="text-lg">{scenario.name}</CardTitle>
                    </div>
                    <Badge className={cn("gap-1", getRiskColor(scenario.risk_level))}>
                      <RiskIcon size={12} />
                      {scenario.risk_level}
                    </Badge>
                  </div>
                  <CardDescription>{scenario.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Confidence</span>
                      <span className="font-medium">{scenario.confidence_score}%</span>
                    </div>
                    <Progress value={scenario.confidence_score} className="h-2" />
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock size={14} />
                    <span>Impact in {scenario.time_to_impact}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Selected Scenario Details */}
      {selectedScenario && (
        <motion.div
          key={selectedScenario.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target size={20} />
                {selectedScenario.name} - Detailed Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="outcomes">
                <TabsList className="mb-4">
                  <TabsTrigger value="outcomes">Expected Outcomes</TabsTrigger>
                  <TabsTrigger value="assumptions">Key Assumptions</TabsTrigger>
                  <TabsTrigger value="risks">Risk Analysis</TabsTrigger>
                </TabsList>

                <TabsContent value="outcomes" className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-100 dark:bg-green-800 rounded-lg">
                            <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Revenue Growth</p>
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                              +{selectedScenario.expected_outcome?.revenue_growth || 0}%
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg">
                            <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Market Share</p>
                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                              {selectedScenario.expected_outcome?.market_share || 0}%
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800">
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-orange-100 dark:bg-orange-800 rounded-lg">
                            <Zap className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Burn Rate Change</p>
                            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                              +{selectedScenario.expected_outcome?.burn_rate || 0}%
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="assumptions" className="space-y-3">
                  {(selectedScenario.assumptions || []).map((assumption: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <CheckCircle2 size={18} className="text-primary mt-0.5" />
                      <span>{assumption}</span>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="risks" className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <Card className="border-destructive/30">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2 text-destructive">
                          <TrendingDown size={16} />
                          Downside Risks
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <p>• Market conditions may deteriorate</p>
                        <p>• Execution delays could impact timeline</p>
                        <p>• Competition may respond aggressively</p>
                      </CardContent>
                    </Card>

                    <Card className="border-green-500/30">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2 text-green-600 dark:text-green-400">
                          <TrendingUp size={16} />
                          Upside Potential
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <p>• Market expansion faster than expected</p>
                        <p>• Viral growth coefficient improves</p>
                        <p>• Strategic partnerships accelerate growth</p>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
                <Button variant="outline">Compare Scenarios</Button>
                <Button className="gap-2">
                  Select This Strategy
                  <ArrowRight size={16} />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
