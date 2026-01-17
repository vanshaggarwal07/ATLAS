import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { DollarSign, Clock, Users, TrendingDown } from 'lucide-react';

const problems = [
  {
    icon: DollarSign,
    title: 'Expensive',
    description: '$200K+ for a single project',
    gradient: 'from-rose-500/20 to-orange-500/20',
    iconColor: 'text-rose-500',
  },
  {
    icon: Clock,
    title: 'Slow',
    description: 'Months to deliver insights',
    gradient: 'from-amber-500/20 to-yellow-500/20',
    iconColor: 'text-amber-500',
  },
  {
    icon: Users,
    title: 'Human-Dependent',
    description: 'Quality varies with consultants',
    gradient: 'from-purple-500/20 to-pink-500/20',
    iconColor: 'text-purple-500',
  },
  {
    icon: TrendingDown,
    title: 'Not Scalable',
    description: "Can't serve millions",
    gradient: 'from-red-500/20 to-rose-500/20',
    iconColor: 'text-red-500',
  },
];

export function ProblemSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="section relative overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/30 to-background" />
      
      {/* Ambient orb */}
      <div className="orb w-[600px] h-[600px] bg-destructive/10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

      <div className="container-atlas relative z-10" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 rounded-full text-sm font-medium bg-destructive/10 text-destructive border border-destructive/20 mb-6 shadow-sm">
            The Problem
          </span>
          <h2 className="heading-section mb-4">
            Consulting Is{' '}
            <span className="text-destructive">Broken</span>
          </h2>
          <p className="body-large max-w-2xl mx-auto">
            Traditional consulting was built for a different era.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {problems.map((problem, index) => (
            <motion.div
              key={problem.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ 
                duration: 0.6, 
                delay: index * 0.1,
                ease: [0.22, 1, 0.36, 1] 
              }}
              className="group"
            >
              <div className="card-soothing h-full text-center">
                <div className={`w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br ${problem.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <problem.icon size={28} className={problem.iconColor} />
                </div>
                <h3 className="text-xl font-semibold mb-2">{problem.title}</h3>
                <p className="text-muted-foreground">{problem.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
