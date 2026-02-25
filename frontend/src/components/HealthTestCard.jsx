import React, { useRef } from 'react';
import VerifiedBadge from './VerifiedBadge';
import { Calendar, Upload, FileText, ExternalLink } from 'lucide-react';

const HealthTestCard = ({ test, isOwner, onUpload, uploading }) => {
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && onUpload) {
      onUpload(test.name, file);
    }
    e.target.value = '';
  };

  return (
    <div 
      className="bg-[#1E3A5F]/40 backdrop-blur-md border border-white/10 rounded-xl p-5 hover:border-[#C5A55A]/50 transition-colors"
      data-testid={`health-test-${test.name.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="flex justify-between items-start mb-3">
        <h4 className="font-semibold text-white text-lg">{test.name}</h4>
        <VerifiedBadge status={test.status} size="small" />
      </div>
      
      {test.result && test.result !== 'Not Done' && (
        <p className="text-slate-300 text-sm mb-2">
          Result: <span className="font-medium text-white">{test.result}</span>
        </p>
      )}
      
      {test.date && (
        <div className="flex items-center gap-1 text-xs text-slate-400 mb-3">
          <Calendar className="w-3 h-3" />
          {new Date(test.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
        </div>
      )}

      {test.source && (
        <p className="text-xs text-slate-500 mb-3">
          Source: <span className="text-slate-400">{test.source}</span>
        </p>
      )}

      {test.documentUrl && (
        <a
          href={test.documentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-[#C5A55A] hover:text-[#d4b85e] transition-colors mb-3"
        >
          <FileText className="w-4 h-4" />
          View Document
          <ExternalLink className="w-3 h-3" />
        </a>
      )}

      {isOwner && test.status === 'missing' && (
        <>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*,.pdf"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
            style={{
              background: uploading ? '#555' : 'linear-gradient(135deg, #C5A55A, #b8962d)',
              color: '#fff',
              cursor: uploading ? 'not-allowed' : 'pointer',
              border: 'none'
            }}
          >
            <Upload className="w-4 h-4" />
            {uploading ? 'Uploading...' : `Upload ${test.name} Record`}
          </button>
        </>
      )}

      {isOwner && test.status !== 'missing' && (
        <>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*,.pdf"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full mt-2 flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white border border-white/10 hover:border-white/30 transition-all"
          >
            <Upload className="w-3 h-3" />
            {uploading ? 'Uploading...' : 'Update Record'}
          </button>
        </>
      )}
    </div>
  );
};

export default HealthTestCard;
