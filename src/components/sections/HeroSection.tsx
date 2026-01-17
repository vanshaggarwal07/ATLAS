import { motion } from 'framer-motion';
import { ArrowDown, Play, Sparkles } from 'lucide-react';
import { DecisionGraph } from '../three/DecisionGraph';

export function HeroSection() {
  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 gradient-hero" />
      
      {/* Floating orbs for soothing ambient effect */}
      <div className="orb orb-primary w-[500px] h-[500px] top-[10%] left-[5%] animate-breathe" />
      <div className="orb orb-accent w-[400px] h-[400px] bottom-[20%] right-[10%] animate-breathe delay-300" />
      <div className="orb orb-warm w-[300px] h-[300px] top-[60%] left-[20%] animate-breathe delay-500" />
      
      {/* Gradient mesh overlay */}
      <div className="absolute inset-0 gradient-mesh" />

      <div className="container-atlas relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-screen py-32">
          {/* Left: Text content */}
          <div className="text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20 mb-6 shadow-sm">
                <Sparkles size={14} className="animate-pulse-slow" />
                The Future of Strategy
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="heading-hero mb-6"
            >
              Consulting.{' '}
              <span className="text-gradient">Rebuilt for Scale.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="body-large max-w-xl mx-auto lg:mx-0 mb-10"
            >
              ATLAS delivers strategy, decisions, and execution — without consultants.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <button 
                onClick={() => scrollToSection('#demo')}
                className="btn-primary group"
              >
                <Play size={18} />
                View Demo
              </button>
              <button 
                onClick={() => scrollToSection('#how-it-works')}
                className="btn-secondary"
              >
                How ATLAS Works
              </button>
            </motion.div>
          </div>

          {/* Right: 3D Decision Graph */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="relative h-[400px] lg:h-[600px]"
          >
            <DecisionGraph />
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="p-2 rounded-full border border-border bg-card/50 backdrop-blur-sm shadow-md"
          >
            <ArrowDown size={20} className="text-muted-foreground" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
