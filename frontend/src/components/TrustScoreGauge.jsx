import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const TrustScoreGauge = ({ score, size = 'large', showBreakdown = false }) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  
  const sizeConfig = {
    small: { radius: 35, stroke: 6, fontSize: 'text-xl' },
    medium: { radius: 50, stroke: 8, fontSize: 'text-3xl' },
    large: { radius: 70, stroke: 10, fontSize: 'text-5xl' }
  };
  
  const config = sizeConfig[size];
  const circumference = 2 * Math.PI * config.radius;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;
  
  const getScoreColor = (score) => {
    if (score >= 90) return '#2ECC71';
    if (score >= 60) return '#F1C40F';
    return '#E74C3C';
  };
  
  const breakdown = {
    'Health Testing': { weight: 40, score: score >= 90 ? 38 : score >= 60 ? 32 : 20 },
    'Pedigree Verification': { weight: 25, score: score >= 90 ? 24 : score >= 60 ? 20 : 15 },
    'Breeder History': { weight: 20, score: score >= 90 ? 19 : score >= 60 ? 15 : 10 },
    'Community Reviews': { weight: 15, score: score >= 90 ? 13 : score >= 60 ? 10 : 5 }
  };
  
  useEffect(() => {
    const timer = setTimeout(() => {
      let current = 0;
      const increment = score / 50;
      const interval = setInterval(() => {
        current += increment;
        if (current >= score) {
          setAnimatedScore(score);
          clearInterval(interval);
        } else {
          setAnimatedScore(Math.floor(current));
        }
      }, 20);
      return () => clearInterval(interval);
    }, 100);
    return () => clearTimeout(timer);
  }, [score]);
  
  const gauge = (
    <div className="relative inline-flex items-center justify-center" data-testid="trust-score-gauge">
      <svg
        width={config.radius * 2 + 20}
        height={config.radius * 2 + 20}
        className="transform -rotate-90"
      >
        <circle
          cx={config.radius + 10}
          cy={config.radius + 10}
          r={config.radius}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={config.stroke}
          fill="none"
        />
        <motion.circle
          cx={config.radius + 10}
          cy={config.radius + 10}
          r={config.radius}
          stroke={getScoreColor(score)}
          strokeWidth={config.stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: strokeDashoffset }}
          transition={{ duration: 2, ease: 'easeOut' }}
          style={{
            filter: `drop-shadow(0 0 8px ${getScoreColor(score)})`
          }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={`${config.fontSize} font-bold`} style={{ color: getScoreColor(score) }}>
          {animatedScore}
        </span>
        <span className="text-xs text-slate-400 uppercase tracking-wider">Trust Score</span>
      </div>
    </div>
  );
  
  if (!showBreakdown) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {gauge}
          </TooltipTrigger>
          <TooltipContent className="bg-[#1E3A5F] border-white/10 p-4 max-w-xs">
            <div className="space-y-2">
              <p className="font-semibold text-sm mb-2">Trust Score Breakdown</p>
              {Object.entries(breakdown).map(([category, data]) => (
                <div key={category} className="flex justify-between text-xs">
                  <span className="text-slate-300">{category}</span>
                  <span className="text-white font-medium">{data.score}/{data.weight}</span>
                </div>
              ))}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  return gauge;
};

export default TrustScoreGauge;