import type { LucideIcon } from 'lucide-react';

interface SystemMetricProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  detail: string;
  tone?: 'cyan' | 'green' | 'amber' | 'red';
}

const toneClasses = {
  cyan: 'border-electric-cyan/25 bg-electric-cyan/10 text-electric-cyan',
  green: 'border-green-400/25 bg-green-400/10 text-green-300',
  amber: 'border-amber-300/25 bg-amber-300/10 text-amber-200',
  red: 'border-red-400/25 bg-red-400/10 text-red-300',
};

export function SystemMetric({ icon: Icon, label, value, detail, tone = 'cyan' }: SystemMetricProps) {
  return (
    <div className="min-h-32 rounded-lg border border-white/10 bg-black/35 p-4 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-3">
        <div className={`rounded-md border p-2 ${toneClasses[tone]}`}>
          <Icon className="h-4 w-4" />
        </div>
        <span className="text-[10px] uppercase tracking-[0.18em] text-gray-500 font-mono">{label}</span>
      </div>
      <div className="mt-4 text-2xl font-bold text-white tabular-nums">{value}</div>
      <p className="mt-1 text-xs leading-relaxed text-gray-400">{detail}</p>
    </div>
  );
}