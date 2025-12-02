import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';

export function PlanMorphShowcase() {
  const [showCaseStudy, setShowCaseStudy] = useState(false);

  return (
    <section className="relative rounded-2xl overflow-hidden border border-electric-cyan/20 bg-gradient-to-br from-gray-900 to-black p-8 md:p-12 mb-20">
      <div className="absolute top-0 right-0 p-4">
        <div className="flex items-center gap-2 text-xs font-mono text-electric-cyan border border-electric-cyan/30 px-3 py-1 rounded-full bg-cyan-950/30">
            <Sparkles className="w-3 h-3" />
            FEATURED STARTUP
        </div>
      </div>
      
      <div className="relative z-10 max-w-2xl">
        <h3 className="text-4xl font-bold text-white mb-4 tracking-tight">
          PlanMorph
        </h3>
        <p className="text-xl text-gray-300 mb-8 font-light">
          The future of engineering project management. AI-driven workflows, automated resource allocation, and predictive analytics.
        </p>
        
        <div className="flex flex-wrap gap-4 mb-8">
            <a 
              href="https://tech.planmorph.software/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-6 py-3 bg-electric-cyan text-deep-charcoal font-bold rounded-lg hover:bg-cyan-300 transition-colors flex items-center gap-2"
            >
                Launch Demo <ArrowRight className="w-4 h-4" />
            </a>
            <button 
              onClick={() => setShowCaseStudy(!showCaseStudy)}
              className="px-6 py-3 border border-white/20 text-white rounded-lg hover:bg-white/5 transition-colors flex items-center gap-2"
            >
                Read Case Study {showCaseStudy ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
        </div>

        <AnimatePresence>
          {showCaseStudy && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-white/5 border border-white/10 rounded-lg p-6 text-gray-300 text-sm leading-relaxed">
                <h4 className="text-electric-cyan font-bold mb-2">CASE STUDY: AUTOMATING EFFICIENCY</h4>
                <p className="mb-4">
                  PlanMorph addresses the critical inefficiencies in traditional engineering project management. 
                  By leveraging machine learning algorithms, it predicts project bottlenecks before they occur.
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-400">
                  <li>Reduced resource idle time by 40% in beta trials.</li>
                  <li>Automated Gantt chart generation from raw scope data.</li>
                  <li>Real-time budget tracking with predictive overrun alerts.</li>
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Abstract background graphic */}
      <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-electric-cyan/10 rounded-full blur-3xl" />
    </section>
  );
}
