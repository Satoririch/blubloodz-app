import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Shield, Heart, FileCheck, Users, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

const TrustScorePage = () => {
  const navigate = useNavigate();
  const userType = localStorage.getItem('mockUser');
  
  const categories = [
    {
      name: 'Health Testing',
      weight: 40,
      icon: Heart,
      color: '#2ECC71',
      description: 'Comprehensive health testing verified through official databases',
      criteria: [
        'OFA Hip & Elbow certifications',
        'Cardiac clearances',
        'Eye examinations (CERF)',
        'DNA health panels',
        'Breed-specific testing'
      ]
    },
    {
      name: 'Pedigree Verification',
      weight: 25,
      icon: FileCheck,
      color: '#3498DB',
      description: 'Registration and pedigree authenticity confirmed',
      criteria: [
        'AKC/UKC registration verified',
        'Pedigree documentation complete',
        'Championship titles confirmed',
        'Lineage cross-referenced',
        'No fraudulent claims'
      ]
    },
    {
      name: 'Breeder History',
      weight: 20,
      icon: Shield,
      color: '#C5A55A',
      description: 'Track record and reputation in the breeding community',
      criteria: [
        'Years of breeding experience',
        'Number of healthy litters produced',
        'Health guarantee policies',
        'Return/refund history',
        'Professional affiliations'
      ]
    },
    {
      name: 'Community Reviews',
      weight: 15,
      icon: Users,
      color: '#F1C40F',
      description: 'Verified buyer feedback and satisfaction ratings',
      criteria: [
        'Verified buyer reviews only',
        'Average rating score',
        'Response to complaints',
        'Communication quality',
        'Post-purchase support'
      ]
    }
  ];
  
  return (
    <Layout userType={userType}>
      <div className="min-h-screen bg-[#0A1628] py-12 px-6" data-testid="trust-score-page">
        <div className="max-w-5xl mx-auto">
          <Button
            onClick={() => navigate(-1)}
            variant="ghost"
            className="text-slate-300 hover:text-white mb-6"
            data-testid="back-button"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <div className="text-center mb-12">
            <h1 
              className="text-5xl md:text-6xl font-bold text-white mb-4"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              How Trust Score Works
            </h1>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Our transparent 0-100 rating system verifies breeder claims with real data, not marketing promises
            </p>
          </div>
          
          <div className="bg-[#1E3A5F]/40 backdrop-blur-md border border-white/10 rounded-xl p-8 mb-8">
            <div className="flex items-center justify-center gap-4 mb-6">
              <Shield className="w-12 h-12 text-[#C5A55A]" />
              <h2 className="text-3xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                Trust Score = Verified Data Only
              </h2>
            </div>
            <p className="text-center text-slate-300 leading-relaxed max-w-2xl mx-auto">
              Every point in a breeder's Trust Score comes from independently verified information. We cross-check health test results with OFA databases, confirm registrations with kennel clubs, and validate buyer reviews. No self-reported claims are counted.
            </p>
          </div>
          
          <div className="space-y-6 mb-8">
            {categories.map((category, index) => {
              const Icon = category.icon;
              return (
                <div
                  key={index}
                  className="bg-[#1E3A5F]/40 backdrop-blur-md border border-white/10 rounded-xl p-8 hover:border-[#C5A55A]/50 transition-all"
                  data-testid={`category-${index}`}
                >
                  <div className="flex items-start gap-6">
                    <div 
                      className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${category.color}20` }}
                    >
                      <Icon className="w-8 h-8" style={{ color: category.color }} />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-2xl font-semibold text-white">{category.name}</h3>
                        <span className="text-2xl font-bold" style={{ color: category.color }}>
                          {category.weight}%
                        </span>
                      </div>
                      
                      <Progress 
                        value={category.weight * 2.5} 
                        className="h-2 mb-4"
                        style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                      />
                      
                      <p className="text-slate-300 mb-4">{category.description}</p>
                      
                      <div className="space-y-2">
                        {category.criteria.map((criterion, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: category.color }} />
                            <span className="text-sm text-slate-400">{criterion}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="bg-gradient-to-r from-[#1E3A5F]/60 to-[#C5A55A]/20 border border-[#C5A55A]/30 rounded-xl p-8">
            <h2 
              className="text-3xl font-bold text-white mb-6 text-center"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Score Interpretation
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#0A1628]/60 rounded-lg p-6 border border-[#2ECC71]/30">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-[#2ECC71]/20 flex items-center justify-center">
                    <span className="text-2xl font-bold text-[#2ECC71]">90+</span>
                  </div>
                  <h3 className="text-xl font-semibold text-[#2ECC71]">Excellent</h3>
                </div>
                <p className="text-sm text-slate-300">
                  Fully verified health testing, complete pedigrees, established reputation, and excellent reviews
                </p>
              </div>
              
              <div className="bg-[#0A1628]/60 rounded-lg p-6 border border-[#F1C40F]/30">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-[#F1C40F]/20 flex items-center justify-center">
                    <span className="text-2xl font-bold text-[#F1C40F]">60-89</span>
                  </div>
                  <h3 className="text-xl font-semibold text-[#F1C40F]">Good</h3>
                </div>
                <p className="text-sm text-slate-300">
                  Some verifications complete, but missing documentation in one or more categories
                </p>
              </div>
              
              <div className="bg-[#0A1628]/60 rounded-lg p-6 border border-[#E74C3C]/30">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-[#E74C3C]/20 flex items-center justify-center">
                    <span className="text-2xl font-bold text-[#E74C3C]">&lt;60</span>
                  </div>
                  <h3 className="text-xl font-semibold text-[#E74C3C]">Needs Work</h3>
                </div>
                <p className="text-sm text-slate-300">
                  Significant gaps in verification. Proceed with caution and ask detailed questions
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TrustScorePage;