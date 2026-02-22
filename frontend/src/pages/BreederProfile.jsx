import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import TrustScoreGauge from '@/components/TrustScoreGauge';
import VerifiedBadge from '@/components/VerifiedBadge';
import { mockBreeders, mockDogs, mockLitters } from '@/mockData';
import { MapPin, Star, Dog, Package, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const BreederProfile = () => {
  const { breederId } = useParams();
  const navigate = useNavigate();
  const userType = localStorage.getItem('mockUser');
  
  const breeder = mockBreeders.find(b => b.id === breederId) || mockBreeders[0];
  const breederDogs = mockDogs.filter(dog => dog.breederId === breeder.id);
  const breederLitters = mockLitters.filter(litter => litter.breederId === breeder.id);
  
  return (
    <Layout userType={userType}>
      <div className="min-h-screen bg-[#0A1628] py-12 px-6" data-testid="breeder-profile-page">
        <div className="max-w-7xl mx-auto">
          <div className="bg-[#1E3A5F]/40 backdrop-blur-md border border-white/10 rounded-xl p-8 mb-8">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-shrink-0">
                <Avatar className="w-32 h-32">
                  <AvatarImage src={breeder.avatar} alt={breeder.name} />
                  <AvatarFallback className="bg-[#C5A55A] text-[#0A1628] text-3xl font-bold">
                    {breeder.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </div>
              
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                  <div>
                    <h1 
                      className="text-4xl font-bold text-white mb-2"
                      style={{ fontFamily: 'Playfair Display, serif' }}
                      data-testid="breeder-name"
                    >
                      {breeder.name}
                    </h1>
                    <div className="flex items-center gap-2 text-slate-400 mb-3">
                      <MapPin className="w-4 h-4" />
                      <span>{breeder.location}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {breeder.badges.map((badge, index) => (
                        <VerifiedBadge key={index} status="verified" text={badge} size="small" />
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <TrustScoreGauge score={breeder.trustScore} size="medium" showBreakdown={false} />
                  </div>
                </div>
                
                <p className="text-slate-300 leading-relaxed mb-4">{breeder.bio}</p>
                
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="bg-[#0A1628] px-4 py-2 rounded-lg">
                    <span className="text-slate-400">Breeds:</span>
                    <span className="text-white font-medium ml-2">{breeder.breeds.join(', ')}</span>
                  </div>
                  <div className="bg-[#0A1628] px-4 py-2 rounded-lg">
                    <span className="text-slate-400">Total Litters:</span>
                    <span className="text-white font-medium ml-2">{breeder.totalLitters}</span>
                  </div>
                  <div className="bg-[#0A1628] px-4 py-2 rounded-lg">
                    <span className="text-slate-400">Active Litters:</span>
                    <span className="text-[#C5A55A] font-medium ml-2">{breeder.activeLitters}</span>
                  </div>
                </div>
                
                {userType === 'buyer' && (
                  <Button 
                    className="mt-6 bg-[#C5A55A] text-[#0A1628] hover:bg-[#D4B66A] gold-glow"
                    data-testid="contact-breeder-button"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Contact Breeder
                  </Button>
                )}
              </div>
            </div>
          </div>
          
          <div className="mb-8">
            <h2 
              className="text-3xl font-bold text-white mb-6 flex items-center gap-2"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              <Dog className="w-8 h-8" />
              Dogs
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {breederDogs.map(dog => (
                <div
                  key={dog.id}
                  onClick={() => navigate(`/dog/${dog.id}`)}
                  className="bg-[#1E3A5F]/40 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden hover:border-[#C5A55A]/50 transition-all cursor-pointer card-hover"
                  data-testid={`dog-card-${dog.id}`}
                >
                  <img
                    src={dog.images[0]}
                    alt={dog.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="text-xl font-semibold text-white mb-1">{dog.name}</h3>
                    <p className="text-sm text-slate-400 mb-3">{dog.breed} • {dog.age}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">
                        {dog.healthTests.filter(t => t.status === 'verified').length}/{dog.healthTests.length} health tests verified
                      </span>
                      <VerifiedBadge status="verified" size="small" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {breederLitters.length > 0 && (
            <div className="mb-8">
              <h2 
                className="text-3xl font-bold text-white mb-6 flex items-center gap-2"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                <Package className="w-8 h-8" />
                Available Litters
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {breederLitters.map(litter => (
                  <div
                    key={litter.id}
                    onClick={() => navigate(`/litter/${litter.id}`)}
                    className="bg-[#1E3A5F]/40 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden hover:border-[#C5A55A]/50 transition-all cursor-pointer card-hover"
                    data-testid={`litter-card-${litter.id}`}
                  >
                    <img
                      src={litter.images[0]}
                      alt={`${litter.breed} litter`}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-xl font-semibold text-white">{litter.breed} Litter</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          litter.status === 'upcoming' 
                            ? 'bg-[#3498DB]/20 text-[#3498DB] border border-[#3498DB]/30'
                            : 'bg-[#2ECC71]/20 text-[#2ECC71] border border-[#2ECC71]/30'
                        }`}>
                          {litter.status === 'upcoming' ? 'Upcoming' : 'Available'}
                        </span>
                      </div>
                      <p className="text-sm text-slate-300 mb-4 line-clamp-2">{litter.description}</p>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-400">{litter.puppyCount} puppies</span>
                        <span className="text-[#C5A55A] font-semibold">{litter.priceRange}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {breeder.reviews.length > 0 && (
            <div>
              <h2 
                className="text-3xl font-bold text-white mb-6 flex items-center gap-2"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                <Star className="w-8 h-8" />
                Reviews
              </h2>
              <div className="space-y-4">
                {breeder.reviews.map(review => (
                  <div
                    key={review.id}
                    className="bg-[#1E3A5F]/40 backdrop-blur-md border border-white/10 rounded-xl p-6"
                    data-testid={`review-${review.id}`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="font-semibold text-white">{review.author}</span>
                        <div className="flex gap-1 mt-1">
                          {[...Array(review.rating)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-[#F1C40F] text-[#F1C40F]" />
                          ))}
                        </div>
                      </div>
                      <span className="text-xs text-slate-500">
                        {new Date(review.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">{review.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default BreederProfile;