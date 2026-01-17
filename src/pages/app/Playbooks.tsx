import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Search,
  Filter,
  Star,
  Clock,
  Users,
  ArrowRight,
  Bookmark,
  TrendingUp,
  Target,
  DollarSign,
  Briefcase
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface Playbook {
  id: string;
  title: string;
  description: string | null;
  problem_domain: string | null;
  industry: string | null;
  stage: string | null;
  is_featured: boolean;
  content: any;
}

const mockPlaybooks: Playbook[] = [
  {
    id: '1',
    title: 'Pricing Strategy for SaaS Startups',
    description: 'A comprehensive guide to designing, testing, and optimizing your SaaS pricing model for maximum revenue.',
    problem_domain: 'pricing',
    industry: 'technology',
    stage: 'seed',
    is_featured: true,
    content: { steps: 12, readTime: '25 min' }
  },
  {
    id: '2',
    title: 'Product-Led Growth Playbook',
    description: 'Learn how to build a product-led growth engine that drives organic acquisition and expansion.',
    problem_domain: 'growth',
    industry: 'technology',
    stage: 'series_a',
    is_featured: true,
    content: { steps: 18, readTime: '40 min' }
  },
  {
    id: '3',
    title: 'Enterprise Sales Motion',
    description: 'Build an enterprise sales team and process from scratch to close six-figure deals.',
    problem_domain: 'growth',
    industry: null,
    stage: 'series_a',
    is_featured: false,
    content: { steps: 15, readTime: '35 min' }
  },
  {
    id: '4',
    title: 'Hiring Your First 10 Engineers',
    description: 'Strategies and tactics for recruiting top engineering talent as an early-stage startup.',
    problem_domain: 'hiring',
    industry: 'technology',
    stage: 'seed',
    is_featured: false,
    content: { steps: 10, readTime: '20 min' }
  },
  {
    id: '5',
    title: 'Fundraising Preparation Guide',
    description: 'Everything you need to prepare for a successful fundraise, from materials to pitch practice.',
    problem_domain: 'fundraising',
    industry: null,
    stage: 'pre_seed',
    is_featured: true,
    content: { steps: 14, readTime: '30 min' }
  },
  {
    id: '6',
    title: 'Operations Scaling Framework',
    description: 'Build scalable operations that support 10x growth without proportional cost increases.',
    problem_domain: 'operations',
    industry: null,
    stage: 'series_b',
    is_featured: false,
    content: { steps: 20, readTime: '45 min' }
  },
  {
    id: '7',
    title: 'Healthcare Go-to-Market',
    description: 'Navigate the unique challenges of selling to healthcare organizations.',
    problem_domain: 'growth',
    industry: 'healthcare',
    stage: null,
    is_featured: false,
    content: { steps: 16, readTime: '35 min' }
  },
  {
    id: '8',
    title: 'Retail Digital Transformation',
    description: 'Strategies for retail businesses to compete in the digital-first economy.',
    problem_domain: 'product_strategy',
    industry: 'retail',
    stage: 'growth',
    is_featured: false,
    content: { steps: 12, readTime: '28 min' }
  }
];

const domainIcons: Record<string, typeof TrendingUp> = {
  growth: TrendingUp,
  pricing: DollarSign,
  operations: Briefcase,
  fundraising: Target,
  hiring: Users,
  product_strategy: BookOpen
};

const domainLabels: Record<string, string> = {
  growth: 'Growth',
  pricing: 'Pricing',
  operations: 'Operations',
  fundraising: 'Fundraising',
  hiring: 'Hiring',
  product_strategy: 'Product Strategy'
};

export default function Playbooks() {
  const [playbooks, setPlaybooks] = useState<Playbook[]>(mockPlaybooks);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [domainFilter, setDomainFilter] = useState<string>('all');
  const [industryFilter, setIndustryFilter] = useState<string>('all');
  const [savedPlaybooks, setSavedPlaybooks] = useState<Set<string>>(new Set(['1', '5']));

  useEffect(() => {
    const fetchPlaybooks = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('playbooks')
        .select('*')
        .order('is_featured', { ascending: false });
      
      if (data && data.length > 0) {
        setPlaybooks(data as Playbook[]);
      }
      setLoading(false);
    };

    fetchPlaybooks();
  }, []);

  const toggleSave = (id: string) => {
    setSavedPlaybooks(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const filteredPlaybooks = playbooks.filter(p => {
    const matchesSearch = !search || 
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase());
    const matchesDomain = domainFilter === 'all' || p.problem_domain === domainFilter;
    const matchesIndustry = industryFilter === 'all' || p.industry === industryFilter || !p.industry;
    return matchesSearch && matchesDomain && matchesIndustry;
  });

  const featuredPlaybooks = filteredPlaybooks.filter(p => p.is_featured);
  const otherPlaybooks = filteredPlaybooks.filter(p => !p.is_featured);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Strategy Playbooks</h1>
          <p className="text-muted-foreground mt-1">
            Proven frameworks and guides for common business challenges
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Bookmark size={16} />
            Saved ({savedPlaybooks.size})
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search playbooks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={domainFilter} onValueChange={setDomainFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <Filter size={14} className="mr-2" />
            <SelectValue placeholder="Domain" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Domains</SelectItem>
            <SelectItem value="growth">Growth</SelectItem>
            <SelectItem value="pricing">Pricing</SelectItem>
            <SelectItem value="operations">Operations</SelectItem>
            <SelectItem value="fundraising">Fundraising</SelectItem>
            <SelectItem value="hiring">Hiring</SelectItem>
            <SelectItem value="product_strategy">Product Strategy</SelectItem>
          </SelectContent>
        </Select>
        <Select value={industryFilter} onValueChange={setIndustryFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Industry" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Industries</SelectItem>
            <SelectItem value="technology">Technology</SelectItem>
            <SelectItem value="healthcare">Healthcare</SelectItem>
            <SelectItem value="finance">Finance</SelectItem>
            <SelectItem value="retail">Retail</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Featured Playbooks */}
      {featuredPlaybooks.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Star size={18} className="text-yellow-500" />
            Featured Playbooks
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredPlaybooks.map((playbook, idx) => {
              const DomainIcon = domainIcons[playbook.problem_domain || 'growth'] || BookOpen;
              return (
                <motion.div
                  key={playbook.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="h-full hover:shadow-md transition-shadow cursor-pointer group">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <DomainIcon className="w-5 h-5 text-primary" />
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSave(playbook.id);
                          }}
                          className={cn(
                            "p-1.5 rounded-lg transition-colors",
                            savedPlaybooks.has(playbook.id) 
                              ? "bg-primary/10 text-primary" 
                              : "hover:bg-muted text-muted-foreground"
                          )}
                        >
                          <Bookmark size={16} fill={savedPlaybooks.has(playbook.id) ? "currentColor" : "none"} />
                        </button>
                      </div>
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">
                        {playbook.title}
                      </CardTitle>
                      <CardDescription>{playbook.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap items-center gap-2 mb-4">
                        <Badge variant="secondary">
                          {domainLabels[playbook.problem_domain || 'growth']}
                        </Badge>
                        {playbook.industry && (
                          <Badge variant="outline" className="capitalize">
                            {playbook.industry.replace('_', ' ')}
                          </Badge>
                        )}
                        {playbook.stage && (
                          <Badge variant="outline" className="capitalize">
                            {playbook.stage.replace('_', ' ')}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          {playbook.content?.readTime || '20 min'}
                        </span>
                        <span>{playbook.content?.steps || 10} steps</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* All Playbooks */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">All Playbooks</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {otherPlaybooks.map((playbook, idx) => {
            const DomainIcon = domainIcons[playbook.problem_domain || 'growth'] || BookOpen;
            return (
              <motion.div
                key={playbook.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="h-full hover:shadow-md transition-shadow cursor-pointer group">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="p-2 bg-muted rounded-lg">
                        <DomainIcon className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSave(playbook.id);
                        }}
                        className={cn(
                          "p-1.5 rounded-lg transition-colors",
                          savedPlaybooks.has(playbook.id) 
                            ? "bg-primary/10 text-primary" 
                            : "hover:bg-muted text-muted-foreground"
                        )}
                      >
                        <Bookmark size={16} fill={savedPlaybooks.has(playbook.id) ? "currentColor" : "none"} />
                      </button>
                    </div>
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      {playbook.title}
                    </CardTitle>
                    <CardDescription>{playbook.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      <Badge variant="secondary">
                        {domainLabels[playbook.problem_domain || 'growth']}
                      </Badge>
                      {playbook.industry && (
                        <Badge variant="outline" className="capitalize">
                          {playbook.industry.replace('_', ' ')}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {playbook.content?.readTime || '20 min'}
                      </span>
                      <Button variant="ghost" size="sm" className="gap-1 -mr-2">
                        Read <ArrowRight size={14} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {filteredPlaybooks.length === 0 && (
        <Card className="py-12">
          <CardContent className="text-center">
            <BookOpen size={48} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No playbooks found</h3>
            <p className="text-muted-foreground">Try adjusting your filters or search terms</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
