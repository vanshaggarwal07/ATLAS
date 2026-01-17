import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Quote } from 'lucide-react';

const testimonials = [
  {
    quote: "ATLAS gave us the strategic clarity that would have taken 6 months with a traditional firm. In 2 days.",
    author: "Sarah Chen",
    role: "CEO",
    company: "Nextera Labs",
    initials: "SC",
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    quote: "We went from gut-feel decisions to data-backed strategy. The execution plan was exactly what we needed.",
    author: "Marcus Williams",
    role: "Founder",
    company: "Scale Commerce",
    initials: "MW",
    gradient: 'from-violet-500 to-purple-500',
  },
  {
    quote: "The diagnosis was spot-on. ATLAS found the real problem we'd been missing for months.",
    author: "Priya Sharma",
    role: "COO",
    company: "Fintech One",
    initials: "PS",
    gradient: 'from-teal-500 to-emerald-500',
  },
];

export function TestimonialsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="testimonials" className="section relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/20 to-background" />
      
      {/* Ambient orb */}
      <div className="orb orb-warm w-[400px] h-[400px] top-[30%] right-[10%]" />

      <div className="container-atlas relative z-10" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20 mb-6 shadow-sm">
            Success Stories
          </span>
          <h2 className="heading-section mb-4">
            Trusted by{' '}
            <span className="text-gradient">Leaders</span>
          </h2>
          <p className="body-large max-w-2xl mx-auto">
            Founders and operators who made the leap.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.author}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ 
                duration: 0.7, 
                delay: index * 0.15,
                ease: [0.22, 1, 0.36, 1] 
              }}
            >
              <div className="card-soothing h-full flex flex-col">
                <Quote size={32} className="text-primary/30 mb-4" />
                <p className="text-lg leading-relaxed mb-6 flex-grow">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center gap-4 pt-4 border-t border-border">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${testimonial.gradient} flex items-center justify-center text-sm font-bold text-white shadow-md`}>
                    {testimonial.initials}
                  </div>
                  <div>
                    <p className="font-semibold">{testimonial.author}</p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.role}, {testimonial.company}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
