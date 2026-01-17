import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { Upload, Brain, GitBranch, CheckCircle, ArrowRight, TrendingUp, BarChart3, FileText } from 'lucide-react';

const demoSteps = [
  { id: 'upload', label: 'Upload Data', icon: Upload },
  { id: 'diagnose', label: 'AI Diagnosis', icon: Brain },
  { id: 'simulate', label: 'Strategy Options', icon: GitBranch },
  { id: 'execute', label: 'Execution Plan', icon: CheckCircle },
];

const mockMetrics = [
  { label: 'Revenue', current: '$2.4M', projected: '$4.1M', change: '+71%' },
  { label: 'Margin', current: '12%', projected: '24%', change: '+100%' },
  { label: 'CAC', current: '$340', projected: '$180', change: '-47%' },
];

const strategies = [
  { name: 'Aggressive Growth', roi: '+127%', risk: 'High', time: '12 months' },
  { name: 'Balanced Expansion', roi: '+71%', risk: 'Medium', time: '18 months' },
  { name: 'Conservative Scale', roi: '+34%', risk: 'Low', time: '24 months' },
];

export function DemoSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [activeStep, setActiveStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const advanceStep = () => {
    if (isAnimating || activeStep >= 3) return;
    setIsAnimating(true);
    setTimeout(() => {
      setActiveStep((prev) => Math.min(prev + 1, 3));
      setIsAnimating(false);
    }, 500);
  };

  const resetDemo = () => {
    setActiveStep(0);
  };

  return (
    <section id="demo" className="section relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/20 to-background" />
      
      {/* Ambient orbs */}
      <div className="orb orb-accent w-[400px] h-[400px] top-[10%] left-[5%]" />

      <div className="container-atlas relative z-10" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 rounded-full text-sm font-medium bg-accent/10 text-accent border border-accent/20 mb-6 shadow-sm">
            Interactive Preview
          </span>
          <h2 className="heading-section mb-4">
            See{' '}
            <span className="text-gradient">ATLAS</span>{' '}
            in Action
          </h2>
          <p className="body-large max-w-2xl mx-auto">
            Experience the consulting engine that transforms data into decisions.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-5xl mx-auto"
        >
          {/* Demo window */}
          <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-2xl">
            {/* Window header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-secondary/30">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
              </div>
              <span className="text-sm text-muted-foreground font-medium">ATLAS Console</span>
              <div className="w-16" />
            </div>

            {/* Step indicators */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-border bg-secondary/10">
              {demoSteps.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex items-center gap-3 transition-all duration-300 ${
                    index <= activeStep ? 'opacity-100' : 'opacity-40'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                      index < activeStep
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : index === activeStep
                        ? 'bg-primary/20 text-primary border-2 border-primary'
                        : 'bg-secondary text-muted-foreground'
                    }`}
                  >
                    {index < activeStep ? (
                      <CheckCircle size={20} />
                    ) : (
                      <step.icon size={20} />
                    )}
                  </div>
                  <span className="hidden sm:block text-sm font-medium">{step.label}</span>
                  {index < demoSteps.length - 1 && (
                    <ArrowRight size={16} className="text-muted-foreground ml-2 hidden md:block" />
                  )}
                </div>
              ))}
            </div>

            {/* Content area */}
            <div className="p-8 min-h-[400px]">
              {/* Step 0: Upload */}
              {activeStep === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-12"
                >
                  <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border-2 border-dashed border-primary/30 flex items-center justify-center">
                    <Upload size={40} className="text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Upload Your Business Data</h3>
                  <p className="text-muted-foreground mb-6">Drop your CSV, connect APIs, or enter metrics manually</p>
                  <button onClick={advanceStep} className="btn-primary">
                    <FileText size={18} />
                    Upload Sample Data
                  </button>
                </motion.div>
              )}

              {/* Step 1: Diagnosis */}
              {activeStep === 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center">
                      <Brain size={20} className="text-violet-500 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="font-semibold">AI Diagnosis Complete</h3>
                      <p className="text-sm text-muted-foreground">3 critical insights identified</p>
                    </div>
                  </div>

                  <div className="grid gap-4">
                    {[
                      { severity: 'High', title: 'Customer acquisition cost exceeds LTV', action: 'Requires immediate attention', color: 'rose' },
                      { severity: 'Medium', title: 'Revenue concentration risk', action: 'Diversification recommended', color: 'amber' },
                      { severity: 'Low', title: 'Operational inefficiency in fulfillment', action: 'Optimization opportunity', color: 'emerald' },
                    ].map((insight, i) => (
                      <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-secondary/30 border border-border hover:border-primary/20 transition-colors">
                        <div className={`px-2 py-1 rounded text-xs font-medium ${
                          insight.color === 'rose' ? 'bg-rose-500/20 text-rose-500' :
                          insight.color === 'amber' ? 'bg-amber-500/20 text-amber-500' :
                          'bg-emerald-500/20 text-emerald-500'
                        }`}>
                          {insight.severity}
                        </div>
                        <div>
                          <p className="font-medium">{insight.title}</p>
                          <p className="text-sm text-muted-foreground">{insight.action}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button onClick={advanceStep} className="btn-primary w-full mt-4">
                    Generate Strategy Options
                    <ArrowRight size={18} />
                  </button>
                </motion.div>
              )}

              {/* Step 2: Strategy Options */}
              {activeStep === 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500/20 to-emerald-500/20 flex items-center justify-center">
                        <GitBranch size={20} className="text-teal-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Strategy Scenarios</h3>
                        <p className="text-sm text-muted-foreground">Compare projected outcomes</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    {strategies.map((strategy, i) => (
                      <div
                        key={i}
                        className={`p-5 rounded-xl border transition-all duration-300 cursor-pointer ${
                          i === 1 ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10' : 'border-border bg-secondary/20 hover:border-primary/50 hover:shadow-md'
                        }`}
                      >
                        {i === 1 && (
                          <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-primary text-primary-foreground mb-2">
                            Recommended
                          </span>
                        )}
                        <h4 className="font-semibold mb-3">{strategy.name}</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">ROI</span>
                            <span className="text-emerald-500 font-medium">{strategy.roi}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Risk</span>
                            <span className="font-medium">{strategy.risk}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Timeline</span>
                            <span className="font-medium">{strategy.time}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button onClick={advanceStep} className="btn-primary w-full mt-4">
                    Generate Execution Plan
                    <ArrowRight size={18} />
                  </button>
                </motion.div>
              )}

              {/* Step 3: Execution Plan */}
              {activeStep === 3 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 flex items-center justify-center">
                        <CheckCircle size={20} className="text-emerald-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Execution Plan Ready</h3>
                        <p className="text-sm text-muted-foreground">18-month roadmap generated</p>
                      </div>
                    </div>
                  </div>

                  {/* Metrics preview */}
                  <div className="grid md:grid-cols-3 gap-4 mb-6">
                    {mockMetrics.map((metric, i) => (
                      <div key={i} className="p-4 rounded-xl bg-secondary/30 border border-border hover:border-primary/20 transition-colors">
                        <div className="flex items-center gap-2 mb-2">
                          <BarChart3 size={16} className="text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{metric.label}</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold">{metric.projected}</span>
                          <span className="text-sm text-emerald-500 font-medium flex items-center gap-1">
                            <TrendingUp size={14} />
                            {metric.change}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">from {metric.current}</span>
                      </div>
                    ))}
                  </div>

                  {/* Timeline preview */}
                  <div className="p-4 rounded-xl bg-secondary/20 border border-border">
                    <h4 className="font-semibold mb-4">Quarterly Milestones</h4>
                    <div className="space-y-3">
                      {['Q1: Optimize CAC through channel restructuring', 'Q2: Launch revenue diversification initiative', 'Q3: Scale winning channels 3x', 'Q4: Operational efficiency overhaul'].map((milestone, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-primary to-accent" />
                          <span className="text-sm">{milestone}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button onClick={resetDemo} className="btn-secondary w-full mt-4">
                    Restart Demo
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
