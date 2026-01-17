import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Check, X, Minus } from 'lucide-react';

const comparisons = [
  {
    feature: 'Delivers decisions',
    atlas: true,
    consulting: 'partial',
    analytics: false,
    aiChat: false,
  },
  {
    feature: 'Tracks outcomes',
    atlas: true,
    consulting: false,
    analytics: 'partial',
    aiChat: false,
  },
  {
    feature: 'Scales globally',
    atlas: true,
    consulting: false,
    analytics: true,
    aiChat: true,
  },
  {
    feature: 'Continuous learning',
    atlas: true,
    consulting: false,
    analytics: 'partial',
    aiChat: 'partial',
  },
  {
    feature: 'Execution plans',
    atlas: true,
    consulting: true,
    analytics: false,
    aiChat: false,
  },
  {
    feature: 'Affordable pricing',
    atlas: true,
    consulting: false,
    analytics: true,
    aiChat: true,
  },
];

const StatusIcon = ({ status }: { status: boolean | string }) => {
  if (status === true) {
    return (
      <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
        <Check size={18} className="text-emerald-500" />
      </div>
    );
  }
  if (status === 'partial') {
    return (
      <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
        <Minus size={18} className="text-amber-500" />
      </div>
    );
  }
  return (
    <div className="w-8 h-8 rounded-lg bg-rose-500/20 flex items-center justify-center">
      <X size={18} className="text-rose-500" />
    </div>
  );
};

export function DifferentiationSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="why-atlas" className="section relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-secondary/30 via-background to-background" />
      
      {/* Ambient orb */}
      <div className="orb orb-primary w-[500px] h-[500px] bottom-[10%] right-[5%]" />

      <div className="container-atlas relative z-10" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20 mb-6 shadow-sm">
            The Difference
          </span>
          <h2 className="heading-section mb-4">
            Why{' '}
            <span className="text-gradient">ATLAS</span>
          </h2>
          <p className="body-large max-w-2xl mx-auto">
            Not another chatbot. Not another dashboard. A decision-making engine.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-4xl mx-auto"
        >
          <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-xl">
            {/* Header */}
            <div className="grid grid-cols-5 gap-4 p-4 bg-secondary/30 border-b border-border">
              <div className="col-span-1" />
              <div className="text-center">
                <div className="w-10 h-10 mx-auto mb-2 rounded-xl flex items-center justify-center shadow-md overflow-hidden">
                  <img src="/logo.png" alt="ATLAS" className="w-full h-full object-contain" />
                </div>
                <span className="text-sm font-semibold">ATLAS</span>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-secondary flex items-center justify-center">
                  <span className="text-lg">💼</span>
                </div>
                <span className="text-sm font-medium text-muted-foreground">Consulting</span>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-secondary flex items-center justify-center">
                  <span className="text-lg">📊</span>
                </div>
                <span className="text-sm font-medium text-muted-foreground">Analytics</span>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-secondary flex items-center justify-center">
                  <span className="text-lg">🤖</span>
                </div>
                <span className="text-sm font-medium text-muted-foreground">AI Chat</span>
              </div>
            </div>

            {/* Rows */}
            {comparisons.map((row, index) => (
              <div
                key={row.feature}
                className={`grid grid-cols-5 gap-4 p-4 items-center transition-colors hover:bg-secondary/20 ${
                  index < comparisons.length - 1 ? 'border-b border-border' : ''
                }`}
              >
                <div className="col-span-1">
                  <span className="font-medium">{row.feature}</span>
                </div>
                <div className="flex justify-center">
                  <StatusIcon status={row.atlas} />
                </div>
                <div className="flex justify-center">
                  <StatusIcon status={row.consulting} />
                </div>
                <div className="flex justify-center">
                  <StatusIcon status={row.analytics} />
                </div>
                <div className="flex justify-center">
                  <StatusIcon status={row.aiChat} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Bottom callout */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mt-12"
        >
          <p className="text-xl text-muted-foreground">
            ATLAS delivers <span className="text-foreground font-semibold">decisions</span>, not reports.{' '}
            Tracks <span className="text-foreground font-semibold">outcomes</span>, not insights.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
