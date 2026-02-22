import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import TrustScoreGauge from '@/components/TrustScoreGauge';
import VerifiedBadge from '@/components/VerifiedBadge';
import { mockBreeders, mockDogs, mockLitters, mockInquiries } from '@/mockData';
import { Dog, Package, MessageSquare, ArrowRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

const BreederDashboard = () => {
  const navigate = useNavigate();
  const breeder = mockBreeders[0];
  const breederDogs = mockDogs.filter(dog => dog.breederId === breeder.id);
  const breederLitters = mockLitters.filter(litter => litter.breederId === breeder.id);
  const breederInquiries = mockInquiries;
  
  const profileCompleteness = 85;
  
  return (
    <Layout userType="breeder">
      <div className="min-h-screen bg-[#0A1628] py-12 px-6" data-testid="breeder-dashboard">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 
              className="text-4xl md:text-5xl font-bold text-white mb-2"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Welcome back, {breeder.name}
            </h1>
            <p className="text-slate-400 text-lg">Manage your dogs, litters, and inquiries</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-[#1E3A5F]/40 backdrop-blur-md border border-white/10 rounded-xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold text-white">Profile Completeness</h2>
                  <span className="text-[#C5A55A] font-bold text-xl">{profileCompleteness}%</span>
                </div>
                <Progress value={profileCompleteness} className="h-3 mb-4" />
                <p className="text-slate-300 text-sm">
                  Complete your profile to increase your Trust Score and attract more buyers
                </p>
                <Button
                  className="mt-4 bg-[#C5A55A] text-[#0A1628] hover:bg-[#D4B66A]"
                  size="sm"
                  data-testid="complete-profile-button"
                >
                  Complete Profile
                </Button>
              </div>
              
              <div className="bg-[#1E3A5F]/40 backdrop-blur-md border border-white/10 rounded-xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
                    <Dog className="w-6 h-6" />
                    My Dogs
                  </h2>
                  <Button size="sm" variant="outline" className="border-[#C5A55A] text-[#C5A55A]" data-testid="add-dog-button">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Dog
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {breederDogs.map(dog => (
                    <div
                      key={dog.id}
                      onClick={() => navigate(`/dog/${dog.id}`)}
                      className="bg-[#0A1628] border border-white/10 rounded-lg p-4 hover:border-[#C5A55A]/50 transition-all cursor-pointer card-hover"
                      data-testid={`dog-card-${dog.id}`}
                    >
                      <div className="flex gap-4">
                        <img
                          src={dog.images[0]}
                          alt={dog.name}
                          className="w-20 h-20 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white mb-1">{dog.name}</h3>
                          <p className="text-sm text-slate-400 mb-2">{dog.breed} • {dog.age}</p>
                          <div className="flex gap-2 flex-wrap">
                            {dog.healthTests.filter(t => t.status === 'verified').length > 0 && (
                              <VerifiedBadge status="verified" text={`${dog.healthTests.filter(t => t.status === 'verified').length} Tests`} size="small" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-[#1E3A5F]/40 backdrop-blur-md border border-white/10 rounded-xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
                    <Package className="w-6 h-6" />
                    Active Litters
                  </h2>
                  <Button size="sm" variant="outline" className="border-[#C5A55A] text-[#C5A55A]" data-testid="add-litter-button">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Litter
                  </Button>
                </div>
                <div className="space-y-4">
                  {breederLitters.map(litter => (
                    <div
                      key={litter.id}
                      onClick={() => navigate(`/litter/${litter.id}`)}
                      className="bg-[#0A1628] border border-white/10 rounded-lg p-4 hover:border-[#C5A55A]/50 transition-all cursor-pointer card-hover"
                      data-testid={`litter-card-${litter.id}`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-1">{litter.breed} Litter</h3>
                          <p className="text-sm text-slate-400">
                            {litter.status === 'upcoming' ? `Expected: ${litter.expectedDate}` : `Born: ${litter.birthDate}`}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          litter.status === 'upcoming' 
                            ? 'bg-[#3498DB]/20 text-[#3498DB] border border-[#3498DB]/30'
                            : 'bg-[#2ECC71]/20 text-[#2ECC71] border border-[#2ECC71]/30'
                        }`}>
                          {litter.status === 'upcoming' ? 'Upcoming' : 'Available'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-300">{litter.puppyCount} puppies • {litter.priceRange}</span>
                        {litter.status === 'available' && (
                          <span className="text-[#C5A55A] font-medium">{litter.availableCount} available</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-[#1E3A5F]/40 backdrop-blur-md border border-white/10 rounded-xl p-8">
                <h2 className="text-xl font-semibold text-white mb-6 text-center">Your Trust Score</h2>
                <div className="flex justify-center mb-4">
                  <TrustScoreGauge score={breeder.trustScore} size="medium" showBreakdown={false} />
                </div>
                <div className="space-y-2 text-sm">
                  {breeder.badges.map((badge, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-white/10 last:border-0">
                      <span className="text-slate-300">{badge}</span>
                      <VerifiedBadge status="verified" size="small" />
                    </div>
                  ))}
                </div>
                <Button
                  onClick={() => navigate('/trust-score-info')}
                  variant="outline"
                  size="sm"
                  className="w-full mt-4 border-[#C5A55A] text-[#C5A55A]"
                  data-testid="view-score-breakdown-button"
                >
                  View Score Breakdown
                </Button>
              </div>
              
              <div className="bg-[#1E3A5F]/40 backdrop-blur-md border border-white/10 rounded-xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Inquiries
                  </h2>
                  {breederInquiries.length > 0 && (
                    <span className="bg-[#E74C3C] text-white text-xs font-bold px-2 py-1 rounded-full">
                      {breederInquiries.length}
                    </span>
                  )}
                </div>
                <div className="space-y-3">
                  {breederInquiries.map(inquiry => (
                    <div
                      key={inquiry.id}
                      className="bg-[#0A1628] border border-white/10 rounded-lg p-4 hover:border-[#C5A55A]/50 transition-all cursor-pointer"
                      data-testid={`inquiry-card-${inquiry.id}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-white text-sm">{inquiry.buyerName}</span>
                        <span className="text-xs text-slate-500">{inquiry.date}</span>
                      </div>
                      <p className="text-sm text-slate-300 line-clamp-2">{inquiry.message}</p>
                      <Button size="sm" variant="ghost" className="mt-2 text-[#C5A55A] p-0 h-auto hover:bg-transparent">
                        Reply <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BreederDashboard;