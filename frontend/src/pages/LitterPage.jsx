import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { mockLitters, mockDogs, mockBreeders } from '@/mockData';
import { ArrowLeft, Calendar, DollarSign, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

const LitterPage = () => {
  const { litterId } = useParams();
  const navigate = useNavigate();
  const userType = localStorage.getItem('mockUser');
  
  const litter = mockLitters.find(l => l.id === litterId) || mockLitters[0];
  const sire = mockDogs.find(d => d.id === litter.sireId);
  const dam = mockDogs.find(d => d.id === litter.damId);
  const breeder = mockBreeders.find(b => b.id === litter.breederId);
  
  const statusColors = {
    available: 'bg-[#2ECC71]/20 text-[#2ECC71] border-[#2ECC71]/30',
    reserved: 'bg-[#F1C40F]/20 text-[#F1C40F] border-[#F1C40F]/30',
    sold: 'bg-[#E74C3C]/20 text-[#E74C3C] border-[#E74C3C]/30'
  };
  
  return (
    <Layout userType={userType}>
      <div className="min-h-screen bg-[#0A1628] py-12 px-6" data-testid="litter-page">
        <div className="max-w-7xl mx-auto">
          <Button
            onClick={() => navigate(-1)}
            variant="ghost"
            className="text-slate-300 hover:text-white mb-6"
            data-testid="back-button"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <div className="bg-[#1E3A5F]/40 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
              <img
                src={litter.images[0]}
                alt={`${litter.breed} litter`}
                className="w-full h-96 object-cover"
                data-testid="litter-main-image"
              />
              {litter.images[1] && (
                <img
                  src={litter.images[1]}
                  alt={`${litter.breed} litter 2`}
                  className="w-full h-96 object-cover"
                />
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 
                      className="text-5xl font-bold text-white mb-3"
                      style={{ fontFamily: 'Playfair Display, serif' }}
                      data-testid="litter-title"
                    >
                      {litter.breed} Litter
                    </h1>
                    <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium border ${
                      litter.status === 'upcoming' 
                        ? 'bg-[#3498DB]/20 text-[#3498DB] border-[#3498DB]/30'
                        : 'bg-[#2ECC71]/20 text-[#2ECC71] border-[#2ECC71]/30'
                    }`}>
                      {litter.status === 'upcoming' ? 'Upcoming' : 'Available Now'}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-400 mb-1">Price Range</p>
                    <p className="text-3xl font-bold text-[#C5A55A]" style={{ fontFamily: 'Playfair Display, serif' }}>
                      {litter.priceRange}
                    </p>
                  </div>
                </div>
                
                <p className="text-lg text-slate-300 leading-relaxed mb-6">{litter.description}</p>
                
                <div className="bg-[#1E3A5F]/40 backdrop-blur-md border border-white/10 rounded-xl p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-slate-400 mb-1">Total Puppies</p>
                      <p className="text-2xl font-bold text-white">{litter.puppyCount}</p>
                    </div>
                    {litter.status === 'available' && (
                      <div>
                        <p className="text-sm text-slate-400 mb-1">Available</p>
                        <p className="text-2xl font-bold text-[#2ECC71]">{litter.availableCount}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-slate-400 mb-1">{litter.status === 'upcoming' ? 'Expected' : 'Born'}</p>
                      <p className="text-lg font-semibold text-white">
                        {new Date(litter.expectedDate || litter.birthDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {litter.puppies && litter.puppies.length > 0 && (
                <div>
                  <h2 
                    className="text-3xl font-bold text-white mb-6"
                    style={{ fontFamily: 'Playfair Display, serif' }}
                  >
                    Individual Puppies
                  </h2>
                  <div className="space-y-4">
                    {litter.puppies.map(puppy => (
                      <div
                        key={puppy.id}
                        className="bg-[#1E3A5F]/40 backdrop-blur-md border border-white/10 rounded-xl p-6"
                        data-testid={`puppy-card-${puppy.id}`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-semibold text-white">{puppy.name}</h3>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[puppy.status]}`}>
                                {puppy.status.charAt(0).toUpperCase() + puppy.status.slice(1)}
                              </span>
                            </div>
                            <p className="text-slate-300">
                              <span className="text-slate-400">{puppy.gender}</span> • <span className="text-slate-400">{puppy.color}</span>
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-[#C5A55A]">{puppy.price}</p>
                            {puppy.status === 'available' && (
                              <Button
                                size="sm"
                                className="mt-2 bg-[#C5A55A] text-[#0A1628] hover:bg-[#D4B66A]"
                                data-testid={`inquire-button-${puppy.id}`}
                              >
                                <Heart className="w-4 h-4 mr-2" />
                                Inquire
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-6">
              <div className="bg-[#1E3A5F]/40 backdrop-blur-md border border-white/10 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Breeder</h3>
                <div
                  onClick={() => navigate(`/breeder/${breeder.id}`)}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  data-testid="breeder-link"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-16 h-16 rounded-full bg-[#C5A55A] flex items-center justify-center text-[#0A1628] font-bold text-2xl">
                      {breeder.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-white font-semibold text-lg">{breeder.name}</p>
                      <p className="text-sm text-slate-400">{breeder.location}</p>
                    </div>
                  </div>
                </div>
                <Button
                  className="w-full bg-[#C5A55A] text-[#0A1628] hover:bg-[#D4B66A] gold-glow"
                  data-testid="contact-breeder-button"
                >
                  Contact Breeder
                </Button>
              </div>
              
              <div className="bg-[#1E3A5F]/40 backdrop-blur-md border border-white/10 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Parents</h3>
                <div className="space-y-4">
                  <div
                    onClick={() => navigate(`/dog/${sire.id}`)}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                    data-testid="sire-link"
                  >
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Sire (Father)</p>
                    <div className="flex items-center gap-3 bg-[#0A1628] rounded-lg p-3">
                      <img
                        src={sire.images[0]}
                        alt={sire.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div>
                        <p className="font-semibold text-white">{sire.name}</p>
                        <p className="text-xs text-slate-400">{sire.breed}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div
                    onClick={() => navigate(`/dog/${dam.id}`)}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                    data-testid="dam-link"
                  >
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Dam (Mother)</p>
                    <div className="flex items-center gap-3 bg-[#0A1628] rounded-lg p-3">
                      <img
                        src={dam.images[0]}
                        alt={dam.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div>
                        <p className="font-semibold text-white">{dam.name}</p>
                        <p className="text-xs text-slate-400">{dam.breed}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LitterPage;