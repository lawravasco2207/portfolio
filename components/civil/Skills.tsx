'use client';

import { motion } from 'framer-motion';

const skills = [
  { name: "AutoCAD", level: 90 },
  { name: "Structural Analysis", level: 85 },
  { name: "Surveying", level: 80 },
  { name: "Project Mgmt", level: 75 },
];

export function CivilSkills() {
  return (
    <section className="mb-20">
      <h3 className="text-2xl font-bold text-white flex items-center gap-2 mb-8">
        <span className="text-blueprint-blue">03.</span> TECHNICAL PROFICIENCY
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {skills.map((skill, index) => (
          <div key={skill.name} className="flex flex-col items-center">
            <div className="relative w-32 h-32 flex items-center justify-center mb-4">
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="60"
                  fill="transparent"
                  stroke="#1a365d"
                  strokeWidth="8"
                />
                <motion.circle
                  cx="64"
                  cy="64"
                  r="60"
                  fill="transparent"
                  stroke="#005BCE"
                  strokeWidth="8"
                  strokeDasharray={377}
                  strokeDashoffset={377}
                  whileInView={{ strokeDashoffset: 377 - (377 * skill.level) / 100 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">{skill.level}%</span>
              </div>
            </div>
            <h4 className="font-bold text-blue-200 text-center">{skill.name}</h4>
          </div>
        ))}
      </div>
    </section>
  );
}
