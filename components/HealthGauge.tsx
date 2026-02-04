'use client';

interface HealthGaugeProps {
  score: number;
  size?: number;
}

export function HealthGauge({ score, size = 120 }: HealthGaugeProps) {
  const radius = size / 2 - 10;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  
  const color = score >= 70 ? '#16a34a' : score >= 40 ? '#eab308' : '#dc2626';
  
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth="8"
          fill="none"
          className="text-border"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth="8"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-3xl font-bold" style={{ color }}>
            {Math.round(score)}
          </div>
          <div className="text-xs text-muted-foreground">Health</div>
        </div>
      </div>
    </div>
  );
}
