import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Play, Sparkles } from 'lucide-react';

export function CTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const scrollToDemo = () => {
    const element = document.querySelector('#demo');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="section relative overflow-hidden">
      {/* Ambient orbs */}
      <div className="orb orb-primary w-[600px] h-[600px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      <div className="orb orb-accent w-[400px] h-[400px] top-[20%] right-[20%]" />

      <div className="container-atlas relative z-10" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl mx-auto text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20 mb-8 shadow-sm"
          >
            <Sparkles size={14} className="animate-pulse-slow" />
            Ready to transform?
          </motion.div>

          <h2 className="heading-hero mb-6">
            The last consulting platform you'll ever need.
          </h2>
          <p className="body-large mb-10">
            Join the leaders who are already making better decisions, faster.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/signup" className="btn-primary text-lg px-8 py-4 glow">
              Request Access
              <ArrowRight size={20} />
            </Link>
            <button onClick={scrollToDemo} className="btn-secondary text-lg px-8 py-4">
              <Play size={20} />
              See Live Demo
            </button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
