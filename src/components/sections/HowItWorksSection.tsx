import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Database, Search, GitBranch, FileCheck } from 'lucide-react';

const steps = [
  {
    icon: Database,
    step: '01',
    title: 'Ingests Data',
    description: 'Connect your business data, financials, and context. ATLAS understands your unique situation.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Search,
    step: '02',
    title: 'Diagnoses',
    description: 'AI identifies the real problem — not symptoms. It finds what consultants often miss.',
    color: 'from-violet-500 to-purple-500',
  },
  {
    icon: GitBranch,
    step: '03',
    title: 'Simulates',
    description: 'Generates strategic options with projected outcomes. See the future before you commit.',
    color: 'from-teal-500 to-emerald-500',
  },
  {
    icon: FileCheck,
    step: '04',
    title: 'Executes',
    description: 'Delivers a complete execution plan with milestones, metrics, and accountability.',
    color: 'from-amber-500 to-orange-500',
  },
];

export function HowItWorksSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="how-it-works" className="section relative overflow-hidden">
      {/* Ambient orbs */}
      <div className="orb orb-primary w-[500px] h-[500px] top-[20%] right-[5%]" />
      <div className="orb orb-accent w-[400px] h-[400px] bottom-[10%] left-[10%]" />

      <div className="container-atlas relative z-10" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-20"
        >
          <span className="inline-block px-4 py-2 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20 mb-6 shadow-sm">
            The Engine
          </span>
          <h2 className="heading-section mb-4">
            How{' '}
            <span className="text-gradient">ATLAS</span>{' '}
            Works
          </h2>
          <p className="body-large max-w-2xl mx-auto">
            A four-step consulting engine that thinks like a partner, executes like a machine.
          </p>
        </motion.div>

        <div className="relative">
          {/* Connection line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent -translate-y-1/2" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ 
                  duration: 0.7, 
                  delay: index * 0.15,
                  ease: [0.22, 1, 0.36, 1] 
                }}
                className="relative group"
              >
                <div className="card-soothing h-full text-center">
                  {/* Step number */}
                  <div className={`absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-gradient-to-r ${step.color} text-xs font-bold text-white shadow-lg`}>
                    {step.step}
                  </div>

                  {/* Icon */}
                  <div className={`w-18 h-18 mx-auto mt-4 mb-6 rounded-2xl bg-gradient-to-br ${step.color} p-0.5`}>
                    <div className="w-full h-full rounded-2xl bg-card flex items-center justify-center p-4">
                      <step.icon size={32} className="text-foreground" />
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                </div>

                {/* Connector dot */}
                {index < steps.length - 1 && (
                  <div className={`hidden lg:block absolute top-1/2 -right-4 w-3 h-3 rounded-full bg-gradient-to-r ${step.color} -translate-y-1/2 z-10 shadow-md`} />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
