import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Code2, RefreshCw, Globe } from 'lucide-react';

const scalePoints = [
  {
    icon: Code2,
    title: 'Logic Encoded',
    description: 'Consulting frameworks and strategic thinking embedded in software.',
    gradient: 'from-blue-500 to-indigo-500',
  },
  {
    icon: RefreshCw,
    title: 'Continuous Learning',
    description: 'Every decision outcome feeds back to improve future recommendations.',
    gradient: 'from-violet-500 to-purple-500',
  },
  {
    icon: Globe,
    title: 'Global Reach',
    description: 'Serve millions of businesses across markets simultaneously.',
    gradient: 'from-teal-500 to-cyan-500',
  },
];

export function ScaleSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="section relative overflow-hidden">
      {/* Ambient orbs */}
      <div className="orb orb-accent w-[500px] h-[500px] top-[20%] left-[10%]" />
      <div className="orb orb-primary w-[400px] h-[400px] bottom-[20%] right-[15%]" />

      <div className="container-atlas relative z-10" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 rounded-full text-sm font-medium bg-accent/10 text-accent border border-accent/20 mb-6 shadow-sm">
            Built for Scale
          </span>
          <h2 className="heading-section mb-4">
            Why This{' '}
            <span className="text-gradient">Scales</span>
          </h2>
          <p className="body-large max-w-2xl mx-auto">
            The first consulting platform designed for infinite reach.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {scalePoints.map((point, index) => (
            <motion.div
              key={point.title}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ 
                duration: 0.7, 
                delay: index * 0.15,
                ease: [0.22, 1, 0.36, 1] 
              }}
              className="group text-center"
            >
              <div className="card-soothing h-full">
                <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${point.gradient} p-0.5`}>
                  <div className="w-full h-full rounded-2xl bg-card flex items-center justify-center">
                    <point.icon size={36} className="text-foreground" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-3">{point.title}</h3>
                <p className="text-muted-foreground">{point.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
