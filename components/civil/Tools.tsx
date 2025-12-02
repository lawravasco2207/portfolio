'use client';

import { motion } from 'framer-motion';

const tools = [
  { name: "AutoCAD", type: "Drafting" },
  { name: "Revit", type: "BIM" },
  { name: "Civil 3D", type: "Topography" },
  { name: "SAP2000", type: "Analysis" },
  { name: "ETABS", type: "Structural" },
  { name: "ArcGIS", type: "Mapping" }
];

export function CivilTools() {
  return (
    <section className="mb-20">
      <h3 className="text-2xl font-bold text-white flex items-center gap-2 mb-8">
        <span className="text-blueprint-blue">05.</span> INSTRUMENTATION
      </h3>

      <div className="flex flex-wrap gap-4 justify-center">
        {tools.map((tool, index) => (
          <motion.div
            key={tool.name}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -5 }}
            className="w-32 h-32 border border-blueprint-blue/30 bg-deep-charcoal flex flex-col items-center justify-center gap-2 hover:bg-blueprint-blue/10 transition-colors cursor-crosshair"
          >
            <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center bg-white/5">
                <span className="text-xl font-bold text-white">{tool.name[0]}</span>
            </div>
            <div className="text-center">
                <div className="font-bold text-white text-sm">{tool.name}</div>
                <div className="text-[10px] text-blue-300/60 uppercase">{tool.type}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
