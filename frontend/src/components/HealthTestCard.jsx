import React from 'react';
import VerifiedBadge from './VerifiedBadge';
import { Calendar } from 'lucide-react';

const HealthTestCard = ({ test }) => {
  return (
    <div 
      className="bg-[#1E3A5F]/40 backdrop-blur-md border border-white/10 rounded-xl p-4 hover:border-[#C5A55A]/50 transition-colors"
      data-testid={`health-test-${test.name.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="flex justify-between items-start mb-3">
        <h4 className="font-semibold text-white">{test.name}</h4>
        <VerifiedBadge status={test.status} size="small" />
      </div>
      
      {test.result && (
        <p className="text-slate-300 text-sm mb-2">
          Result: <span className="font-medium text-white">{test.result}</span>
        </p>
      )}
      
      {test.date && (
        <div className="flex items-center gap-1 text-xs text-slate-400">
          <Calendar className="w-3 h-3" />
          {new Date(test.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
        </div>
      )}
    </div>
  );
};

export default HealthTestCard;