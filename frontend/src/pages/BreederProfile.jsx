import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import TrustScoreGauge from '@/components/TrustScoreGauge';
import VerifiedBadge from '@/components/VerifiedBadge';
import { MapPin, Star, Dog, Package, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';

const BreederProfile = () => {
  const { breederId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [breeder, setBreeder] = useState(null);
  const [dogs, setDogs] = useState([]);
  const [litters, setLitters] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchBreederData();
  }, [breederId]);
  
  const fetchBreederData = async () => {
    try {
      setLoading(true);
      
      // Fetch breeder profile
      const { data: breederData, error: breederError } = await supabase
        .from('users')
        .select('*')
        .eq('id', breederId)
        .single();
      
      if (breederError) throw breederError;
      setBreeder(breederData);
      
      // Fetch breeder's dogs
      const { data: dogsData, error: dogsError } = await supabase
        .from('dogs')
        .select('*')
        .eq('owner_id', breederId)
        .order('created_at', { ascending: false });
      
      if (dogsError) throw dogsError;
      setDogs(dogsData || []);
      
      // Fetch breeder's litters
      const { data: littersData, error: littersError } = await supabase
        .from('litters')
        .select('*')
        .eq('breeder_id', breederId)
        .order('created_at', { ascending: false });
      
      if (littersError) throw littersError;
      setLitters(littersData || []);
      
    } catch (error) {
      console.error('Error fetching breeder data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const getTrustScoreBadge = (score) => {
    if (!score) return null;
    if (score >= 80) return { text: 'Gold', color: '#C5A55A' };
    if (score >= 60) return { text: 'Silver', color: '#94A3B8' };
    return null;
  };
  
  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-[#0A1628] py-12 px-6 flex items-center justify-center">
          <div className="text-white">Loading profile...</div>
        </div>
      </Layout>
    );
  }
  
  if (!breeder) {
    return (
      <Layout>
        <div className="min-h-screen bg-[#0A1628] py-12 px-6 flex items-center justify-center">
          <div className="text-white">Breeder not found</div>
        </div>
      </Layout>
    );
  }
  
  const badges = [];
  if (breeder.ofa_verified) badges.push('OFA Verified');
  if (breeder.dna_tested) badges.push('DNA Tested');
  if (breeder.pedigree_confirmed) badges.push('Pedigree Confirmed');
  
  return (
    <Layout>
      <div className="min-h-screen bg-[#0A1628] py-12 px-6" data-testid="breeder-profile-page">
        <div className="max-w-7xl mx-auto">
          <div className="bg-[#1E3A5F]/40 backdrop-blur-md border border-white/10 rounded-xl p-8 mb-8">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-shrink-0">
                <Avatar className="w-32 h-32">
                  <AvatarImage src={breeder.avatar_url} alt={breeder.kennel_name || breeder.full_name} />
                  <AvatarFallback className="bg-[#C5A55A] text-[#0A1628] text-3xl font-bold">
                    {(breeder.kennel_name || breeder.full_name)?.charAt(0) || '?'}
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
                      {breeder.kennel_name || breeder.full_name}
                    </h1>
                    <div className="flex items-center gap-2 text-slate-400 mb-3">
                      <MapPin className="w-4 h-4" />
                      <span>{breeder.location || 'Location not specified'}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {badges.map((badge, index) => (
                        <VerifiedBadge key={index} status="verified" text={badge} size="small" />
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <TrustScoreGauge score={breeder.trust_score || 0} size="medium" showBreakdown={false} />
                  </div>
                </div>
                
                {breeder.bio && (
                  <p className="text-slate-300 leading-relaxed mb-4">{breeder.bio}</p>
                )}
                
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="bg-[#0A1628] px-4 py-2 rounded-lg">
                    <span className="text-slate-400">Total Dogs:</span>
                    <span className="text-white font-medium ml-2">{dogs.length}</span>
                  </div>
                  <div className="bg-[#0A1628] px-4 py-2 rounded-lg">
                    <span className="text-slate-400">Active Litters:</span>
                    <span className="text-[#C5A55A] font-medium ml-2">{litters.filter(l => l.status === 'available').length}</span>
                  </div>
                </div>
                
                {user && user.id !== breederId && (
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
          
          {dogs.length > 0 && (
            <div className="mb-8">
              <h2 
                className="text-3xl font-bold text-white mb-6 flex items-center gap-2"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                <Dog className="w-8 h-8" />
                Dogs ({dogs.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dogs.map(dog => {
                  const badge = getTrustScoreBadge(dog.trust_score);
                  return (
                    <div
                      key={dog.id}
                      onClick={() => navigate(`/dog/${dog.id}`)}
                      className="bg-[#1E3A5F]/40 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden hover:border-[#C5A55A]/50 transition-all cursor-pointer card-hover"
                      data-testid={`dog-card-${dog.id}`}
                    >
                      <div className="h-48 bg-[#0A1628] flex items-center justify-center text-[#C5A55A] text-6xl font-bold">
                        {dog.registered_name?.charAt(0) || '?'}
                      </div>
                      <div className="p-4">
                        <h3 className="text-xl font-semibold text-white mb-1">{dog.call_name || dog.registered_name}</h3>
                        <p className="text-sm text-slate-400 mb-3">{dog.breed} • {dog.sex}</p>
                        <div className="flex items-center justify-between">
                          {badge && (
                            <span 
                              className="px-2 py-1 rounded-full text-xs font-medium border"
                              style={{ 
                                color: badge.color, 
                                borderColor: badge.color + '50',
                                backgroundColor: badge.color + '20'
                              }}
                            >
                              {badge.text} Badge
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {litters.length > 0 && (
            <div className="mb-8">
              <h2 
                className="text-3xl font-bold text-white mb-6 flex items-center gap-2"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                <Package className="w-8 h-8" />
                Litters ({litters.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {litters.map(litter => (
                  <div
                    key={litter.id}
                    onClick={() => navigate(`/litter/${litter.id}`)}
                    className="bg-[#1E3A5F]/40 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden hover:border-[#C5A55A]/50 transition-all cursor-pointer card-hover"
                    data-testid={`litter-card-${litter.id}`}
                  >
                    <div className="h-48 bg-[#0A1628]"></div>
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-xl font-semibold text-white">{litter.breed} Litter</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          litter.status === 'upcoming' 
                            ? 'bg-[#3498DB]/20 text-[#3498DB] border border-[#3498DB]/30'
                            : litter.status === 'available'
                            ? 'bg-[#2ECC71]/20 text-[#2ECC71] border border-[#2ECC71]/30'
                            : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                        }`}>
                          {litter.status || 'Unknown'}
                        </span>
                      </div>
                      <p className="text-sm text-slate-300 mb-4 line-clamp-2">{litter.description}</p>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-400">{litter.puppy_count || 0} puppies</span>
                        {litter.price_range && (
                          <span className="text-[#C5A55A] font-semibold">{litter.price_range}</span>
                        )}
                      </div>
                    </div>
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