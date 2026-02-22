import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import TrustScoreGauge from '@/components/TrustScoreGauge';
import VerifiedBadge from '@/components/VerifiedBadge';
import { MapPin, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabaseClient';

const SearchPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('breeders');
  const [breeders, setBreeders] = useState([]);
  const [dogs, setDogs] = useState([]);
  const [litters, setLitters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    breed: 'all',
    location: '',
    minTrustScore: 0
  });
  
  useEffect(() => {
    fetchSearchData();
  }, [filters, activeTab]);
  
  const fetchSearchData = async () => {
    try {
      setLoading(true);
      
      if (activeTab === 'breeders') {
        let query = supabase
          .from('users')
          .select('*')
          .or('role.eq.breeder,role.eq.both');
        
        if (filters.minTrustScore > 0) {
          query = query.gte('trust_score', filters.minTrustScore);
        }
        
        const { data, error } = await query.order('trust_score', { ascending: false });
        
        if (error) throw error;
        setBreeders(data || []);
      } else if (activeTab === 'dogs') {
        let query = supabase
          .from('dogs')
          .select(`
            *,
            owner:users!dogs_owner_id_fkey(*)
          `)
          .eq('available_for_breeding', true);
        
        if (filters.breed !== 'all') {
          query = query.eq('breed', filters.breed);
        }
        
        if (filters.minTrustScore > 0) {
          query = query.gte('trust_score', filters.minTrustScore);
        }
        
        const { data, error } = await query.order('trust_score', { ascending: false });
        
        if (error) throw error;
        setDogs(data || []);
      } else if (activeTab === 'litters') {
        let query = supabase
          .from('litters')
          .select(`
            *,
            breeder:users!litters_breeder_id_fkey(*)
          `)
          .eq('status', 'available');
        
        if (filters.breed !== 'all') {
          query = query.eq('breed', filters.breed);
        }
        
        const { data, error } = await query.order('created_at', { ascending: false });
        
        if (error) throw error;
        setLitters(data || []);
      }
      
    } catch (error) {
      console.error('Error fetching search data:', error);
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
  
  return (
    <Layout>
      <div className="min-h-screen bg-[#0A1628] py-12 px-6" data-testid="search-page">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 
              className="text-4xl md:text-5xl font-bold text-white mb-2"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Browse Dogs & Breeders
            </h1>
            <p className="text-slate-400 text-lg">Find verified breeders and health-tested dogs</p>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="bg-[#1E3A5F]/40 border border-white/10">
              <TabsTrigger value="breeders" className="data-[state=active]:bg-[#C5A55A] data-[state=active]:text-[#0A1628]">Breeders</TabsTrigger>
              <TabsTrigger value="dogs" className="data-[state=active]:bg-[#C5A55A] data-[state=active]:text-[#0A1628]">Dogs</TabsTrigger>
              <TabsTrigger value="litters" className="data-[state=active]:bg-[#C5A55A] data-[state=active]:text-[#0A1628]">Litters</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <div className="bg-[#1E3A5F]/40 backdrop-blur-md border border-white/10 rounded-xl p-6 sticky top-24">
                <div className="flex items-center gap-2 mb-6">
                  <Filter className="w-5 h-5 text-[#C5A55A]" />
                  <h2 className="text-xl font-semibold text-white">Filters</h2>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="breed" className="text-white mb-2 block">Breed</Label>
                    <Select
                      value={filters.breed}
                      onValueChange={(value) => setFilters({ ...filters, breed: value })}
                    >
                      <SelectTrigger 
                        id="breed"
                        className="bg-[#0A1628] border-white/10 text-white"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1E3A5F] border-white/10">
                        <SelectItem value="all" className="text-white">All Breeds</SelectItem>
                        <SelectItem value="Cane Corso" className="text-white">Cane Corso</SelectItem>
                        <SelectItem value="French Bulldog" className="text-white">French Bulldog</SelectItem>
                        <SelectItem value="American Bully" className="text-white">American Bully</SelectItem>
                        <SelectItem value="Exotic Bully" className="text-white">Exotic Bully</SelectItem>
                        <SelectItem value="Doodle" className="text-white">Doodle</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-white mb-3 block">
                      Min Trust Score: {filters.minTrustScore}
                    </Label>
                    <Slider
                      value={[filters.minTrustScore]}
                      onValueChange={(value) => setFilters({ ...filters, minTrustScore: value[0] })}
                      max={100}
                      step={10}
                      className="mb-2"
                    />
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>0</span>
                      <span>50</span>
                      <span>100</span>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => setFilters({ breed: 'all', location: '', minTrustScore: 0 })}
                    variant="outline"
                    className="w-full border-white/10 text-slate-300"
                  >
                    Reset Filters
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-3">
              <TabsContent value="breeders">
                {loading ? (
                  <div className="text-white text-center py-12">Loading...</div>
                ) : (
                  <>
                    <div className="mb-6">
                      <p className="text-slate-400">
                        <span className="text-white font-semibold">{breeders.length}</span> breeders found
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {breeders.map(breeder => (
                        <div
                          key={breeder.id}
                          onClick={() => navigate(`/breeder/${breeder.id}`)}
                          className="bg-[#1E3A5F]/40 backdrop-blur-md border border-white/10 rounded-xl p-6 hover:border-[#C5A55A]/50 transition-all cursor-pointer card-hover"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-16 h-16 rounded-full bg-[#C5A55A] flex items-center justify-center text-[#0A1628] font-bold text-2xl">
                                {(breeder.kennel_name || breeder.full_name)?.charAt(0) || '?'}
                              </div>
                              <div>
                                <h3 className="text-xl font-semibold text-white mb-1">{breeder.kennel_name || breeder.full_name}</h3>
                                <div className="flex items-center gap-1 text-sm text-slate-400">
                                  <MapPin className="w-3 h-3" />
                                  {breeder.location || 'N/A'}
                                </div>
                              </div>
                            </div>
                            <TrustScoreGauge score={breeder.trust_score || 0} size="small" />
                          </div>
                          
                          {breeder.bio && (
                            <p className="text-slate-300 text-sm mb-4 line-clamp-2">{breeder.bio}</p>
                          )}
                          
                          <div className="flex flex-wrap gap-2">
                            {breeder.ofa_verified && <VerifiedBadge status="verified" text="OFA" size="small" />}
                            {breeder.dna_tested && <VerifiedBadge status="verified" text="DNA" size="small" />}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </TabsContent>
              
              <TabsContent value="dogs">
                {loading ? (
                  <div className="text-white text-center py-12">Loading...</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {dogs.map(dog => {
                      const badge = getTrustScoreBadge(dog.trust_score);
                      return (
                        <div
                          key={dog.id}
                          onClick={() => navigate(`/dog/${dog.id}`)}
                          className="bg-[#1E3A5F]/40 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden hover:border-[#C5A55A]/50 transition-all cursor-pointer card-hover"
                        >
                          <div className="h-48 bg-[#0A1628] flex items-center justify-center text-[#C5A55A] text-6xl font-bold">
                            {dog.registered_name?.charAt(0) || '?'}
                          </div>
                          <div className="p-4">
                            <h3 className="text-lg font-semibold text-white mb-1">{dog.call_name || dog.registered_name}</h3>
                            <p className="text-sm text-slate-400 mb-2">{dog.breed} • {dog.sex}</p>
                            {badge && (
                              <span 
                                className="inline-block px-2 py-1 rounded-full text-xs font-medium border"
                                style={{ 
                                  color: badge.color, 
                                  borderColor: badge.color + '50',
                                  backgroundColor: badge.color + '20'
                                }}
                              >
                                {badge.text}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="litters">
                {loading ? (
                  <div className="text-white text-center py-12">Loading...</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {litters.map(litter => (
                      <div
                        key={litter.id}
                        onClick={() => navigate(`/litter/${litter.id}`)}
                        className="bg-[#1E3A5F]/40 backdrop-blur-md border border-white/10 rounded-xl p-6 hover:border-[#C5A55A]/50 transition-all cursor-pointer card-hover"
                      >
                        <h3 className="text-xl font-semibold text-white mb-2">{litter.breed} Litter</h3>
                        {litter.breeder && (
                          <p className="text-sm text-slate-400 mb-3">By {litter.breeder.kennel_name || litter.breeder.full_name}</p>
                        )}
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-400">{litter.puppy_count || 0} puppies</span>
                          {litter.price_range && (
                            <span className="text-[#C5A55A] font-semibold">{litter.price_range}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SearchPage;
