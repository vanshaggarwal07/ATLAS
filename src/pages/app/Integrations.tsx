import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Link2, 
  Check, 
  Plus,
  Settings,
  ExternalLink,
  RefreshCw,
  Zap,
  Database,
  BarChart3,
  MessageSquare,
  Calendar,
  CreditCard,
  FileText,
  Users
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: typeof Zap;
  category: string;
  connected: boolean;
  popular: boolean;
  features: string[];
}

const integrations: Integration[] = [
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Sync revenue, subscription data, and payment analytics',
    icon: CreditCard,
    category: 'payments',
    connected: true,
    popular: true,
    features: ['Revenue sync', 'Subscription analytics', 'Churn tracking']
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    description: 'CRM integration for sales and customer data',
    icon: Users,
    category: 'crm',
    connected: true,
    popular: true,
    features: ['Contact sync', 'Deal tracking', 'Pipeline analytics']
  },
  {
    id: 'quickbooks',
    name: 'QuickBooks',
    description: 'Financial data and accounting integration',
    icon: FileText,
    category: 'finance',
    connected: false,
    popular: true,
    features: ['P&L sync', 'Expense tracking', 'Cash flow data']
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Get alerts and updates in your Slack workspace',
    icon: MessageSquare,
    category: 'communication',
    connected: true,
    popular: true,
    features: ['Alert notifications', 'Weekly digests', 'Team updates']
  },
  {
    id: 'google-analytics',
    name: 'Google Analytics',
    description: 'Website and product analytics integration',
    icon: BarChart3,
    category: 'analytics',
    connected: false,
    popular: true,
    features: ['Traffic data', 'Conversion tracking', 'User behavior']
  },
  {
    id: 'salesforce',
    name: 'Salesforce',
    description: 'Enterprise CRM data synchronization',
    icon: Database,
    category: 'crm',
    connected: false,
    popular: true,
    features: ['Opportunity sync', 'Account data', 'Forecasting']
  },
  {
    id: 'calendly',
    name: 'Calendly',
    description: 'Meeting and scheduling data integration',
    icon: Calendar,
    category: 'productivity',
    connected: false,
    popular: false,
    features: ['Meeting analytics', 'Scheduling data', 'Team availability']
  },
  {
    id: 'mixpanel',
    name: 'Mixpanel',
    description: 'Product analytics and user behavior tracking',
    icon: BarChart3,
    category: 'analytics',
    connected: false,
    popular: false,
    features: ['Event tracking', 'Funnel analysis', 'Retention data']
  }
];

const categories = [
  { id: 'all', name: 'All' },
  { id: 'payments', name: 'Payments' },
  { id: 'crm', name: 'CRM' },
  { id: 'finance', name: 'Finance' },
  { id: 'analytics', name: 'Analytics' },
  { id: 'communication', name: 'Communication' },
  { id: 'productivity', name: 'Productivity' },
];

export default function Integrations() {
  const [integrationsState, setIntegrationsState] = useState<Integration[]>(integrations);
  const [activeCategory, setActiveCategory] = useState('all');
  const [syncing, setSyncing] = useState<string | null>(null);

  const handleConnect = (id: string) => {
    setIntegrationsState(prev => 
      prev.map(i => i.id === id ? { ...i, connected: true } : i)
    );
    toast.success('Integration connected successfully');
  };

  const handleDisconnect = (id: string) => {
    setIntegrationsState(prev => 
      prev.map(i => i.id === id ? { ...i, connected: false } : i)
    );
    toast.success('Integration disconnected');
  };

  const handleSync = async (id: string) => {
    setSyncing(id);
    await new Promise(r => setTimeout(r, 2000));
    setSyncing(null);
    toast.success('Data synced successfully');
  };

  const connectedIntegrations = integrationsState.filter(i => i.connected);
  const availableIntegrations = integrationsState.filter(i => !i.connected);

  const filteredAvailable = activeCategory === 'all' 
    ? availableIntegrations 
    : availableIntegrations.filter(i => i.category === activeCategory);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Integrations</h1>
          <p className="text-muted-foreground mt-1">
            Connect your tools to enhance ATLAS insights
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <Plus size={16} />
          Request Integration
        </Button>
      </div>

      {/* Connected Integrations */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Link2 size={18} />
          Connected ({connectedIntegrations.length})
        </h2>
        
        {connectedIntegrations.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {connectedIntegrations.map((integration, idx) => (
              <motion.div
                key={integration.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="border-primary/20 bg-primary/5">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <integration.icon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{integration.name}</CardTitle>
                          <Badge className="mt-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            <Check size={10} className="mr-1" />
                            Connected
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{integration.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {integration.features.map((feature) => (
                        <Badge key={feature} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 pt-2 border-t">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-1"
                        onClick={() => handleSync(integration.id)}
                        disabled={syncing === integration.id}
                      >
                        <RefreshCw size={14} className={cn(syncing === integration.id && "animate-spin")} />
                        Sync
                      </Button>
                      <Button variant="ghost" size="sm" className="gap-1">
                        <Settings size={14} />
                        Configure
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-destructive hover:text-destructive ml-auto"
                        onClick={() => handleDisconnect(integration.id)}
                      >
                        Disconnect
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <Card className="py-8">
            <CardContent className="text-center">
              <Link2 size={48} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No integrations connected</h3>
              <p className="text-muted-foreground">Connect your first integration to enhance ATLAS</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Available Integrations */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Available Integrations</h2>
        
        {/* Category Tabs */}
        <Tabs value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList className="flex-wrap h-auto gap-2 bg-transparent p-0">
            {categories.map((category) => (
              <TabsTrigger 
                key={category.id} 
                value={category.id}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAvailable.map((integration, idx) => (
            <motion.div
              key={integration.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-muted rounded-lg">
                        <integration.icon className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-base">{integration.name}</CardTitle>
                          {integration.popular && (
                            <Badge variant="secondary" className="text-xs">Popular</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{integration.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {integration.features.map((feature) => (
                      <Badge key={feature} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                  <Button 
                    className="w-full gap-2"
                    onClick={() => handleConnect(integration.id)}
                  >
                    <Zap size={14} />
                    Connect
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
