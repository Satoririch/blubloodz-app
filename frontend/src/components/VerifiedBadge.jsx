import React from 'react';
import { CheckCircle2, Clock, XCircle, UploadCloud } from 'lucide-react';

const VerifiedBadge = ({ status = 'verified', text, size = 'default' }) => {
  const sizeClasses = {
    small: 'text-xs px-2 py-0.5',
    default: 'text-sm px-3 py-1',
    large: 'text-base px-4 py-2'
  };
  
  const iconSizes = {
    small: 'w-3 h-3',
    default: 'w-4 h-4',
    large: 'w-5 h-5'
  };
  
  const configs = {
    verified: {
      icon: CheckCircle2,
      className: 'bg-[#2ECC71]/20 text-[#2ECC71] border border-[#2ECC71]/30',
      defaultText: 'Auto-Verified'
    },
    uploaded: {
      icon: UploadCloud,
      className: 'bg-[#3498DB]/20 text-[#3498DB] border border-[#3498DB]/30',
      defaultText: 'Uploaded'
    },
    pending: {
      icon: Clock,
      className: 'bg-[#F1C40F]/20 text-[#F1C40F] border border-[#F1C40F]/30',
      defaultText: 'Pending'
    },
    missing: {
      icon: XCircle,
      className: 'bg-[#E74C3C]/20 text-[#E74C3C] border border-[#E74C3C]/30',
      defaultText: 'Not Done'
    }
  };
  
  const config = configs[status] || configs.verified;
  const Icon = config.icon;
  
  return (
    <span 
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${sizeClasses[size]} ${config.className}`}
      data-testid={`badge-${status}`}
    >
      <Icon className={iconSizes[size]} />
      {text || config.defaultText}
    </span>
  );
};

export default VerifiedBadge;
