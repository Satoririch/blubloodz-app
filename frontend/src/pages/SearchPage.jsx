import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import TrustScoreGauge from '@/components/TrustScoreGauge';
import VerifiedBadge from '@/components/VerifiedBadge';
import { mockBreeders } from '@/mockData';
import { Search, MapPin, Filter, Grid, Map as MapIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

const SearchPage = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('grid');
  const [filters, setFilters] = useState({
    breed: 'all',
    location: '',
    minTrustScore: 0,
    priceRange: [0, 10000]
  });
  
  const filteredBreeders = mockBreeders.filter(breeder => {
    if (filters.breed !== 'all' && !breeder.breeds.includes(filters.breed)) return false;
    if (filters.minTrustScore > 0 && breeder.trustScore < filters.minTrustScore) return false;
    return true;
  });
  
  return (
    <Layout userType="buyer">
      <div className="min-h-screen bg-[#0A1628] py-12 px-6" data-testid="search-page">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 
              className="text-4xl md:text-5xl font-bold text-white mb-2"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Find Your Perfect Puppy
            </h1>
            <p className="text-slate-400 text-lg">Search verified breeders with transparent health testing</p>
          </div>
          
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
                        data-testid="breed-filter"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1E3A5F] border-white/10">
                        <SelectItem value="all" className="text-white">All Breeds</SelectItem>
                        <SelectItem value="Cane Corso" className="text-white">Cane Corso</SelectItem>
                        <SelectItem value="French Bulldog" className="text-white">French Bulldog</SelectItem>
                        <SelectItem value="American Bully" className="text-white">American Bully</SelectItem>
                        <SelectItem value="Exotic Bully" className="text-white">Exotic Bully</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="location" className="text-white mb-2 block">Location</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <Input
                        id="location"
                        type="text"
                        value={filters.location}
                        onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                        placeholder="Enter zip code"
                        className="pl-10 bg-[#0A1628] border-white/10 text-white"
                        data-testid="location-filter"
                      />
                    </div>
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
                      data-testid="trust-score-slider"
                    />
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>0</span>
                      <span>50</span>
                      <span>100</span>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => setFilters({ breed: 'all', location: '', minTrustScore: 0, priceRange: [0, 10000] })}
                    variant="outline"
                    className="w-full border-white/10 text-slate-300"
                    data-testid="reset-filters-button"
                  >
                    Reset Filters
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-3">
              <div className="flex items-center justify-between mb-6">
                <p className="text-slate-400">
                  <span className="text-white font-semibold">{filteredBreeders.length}</span> breeders found
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    onClick={() => setViewMode('grid')}
                    className={viewMode === 'grid' ? 'bg-[#C5A55A] text-[#0A1628]' : 'border-white/10 text-slate-300'}
                    data-testid="grid-view-button"
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={viewMode === 'map' ? 'default' : 'outline'}
                    onClick={() => setViewMode('map')}
                    className={viewMode === 'map' ? 'bg-[#C5A55A] text-[#0A1628]' : 'border-white/10 text-slate-300'}
                    data-testid="map-view-button"
                  >
                    <MapIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredBreeders.map(breeder => (
                    <div
                      key={breeder.id}
                      onClick={() => navigate(`/breeder/${breeder.id}`)}
                      className="bg-[#1E3A5F]/40 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden hover:border-[#C5A55A]/50 transition-all cursor-pointer card-hover"
                      data-testid={`breeder-card-${breeder.id}`}
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-16 h-16 rounded-full bg-[#C5A55A] flex items-center justify-center text-[#0A1628] font-bold text-2xl">
                              {breeder.name.charAt(0)}
                            </div>
                            <div>
                              <h3 className="text-xl font-semibold text-white mb-1">{breeder.name}</h3>
                              <div className="flex items-center gap-1 text-sm text-slate-400">
                                <MapPin className="w-3 h-3" />
                                {breeder.location}
                              </div>
                            </div>
                          </div>
                          <TrustScoreGauge score={breeder.trustScore} size="small" showBreakdown={false} />
                        </div>
                        
                        <p className="text-slate-300 text-sm mb-4 line-clamp-2">{breeder.bio}</p>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          {breeder.badges.slice(0, 2).map((badge, index) => (
                            <VerifiedBadge key={index} status="verified" text={badge} size="small" />
                          ))}
                        </div>
                        
                        <div className="flex justify-between text-sm pt-4 border-t border-white/10">
                          <span className="text-slate-400">Breeds: <span className="text-white">{breeder.breeds.join(', ')}</span></span>
                          {breeder.activeLitters > 0 && (
                            <span className="text-[#2ECC71] font-medium">{breeder.activeLitters} litter{breeder.activeLitters > 1 ? 's' : ''} available</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-[#1E3A5F]/40 backdrop-blur-md border border-white/10 rounded-xl p-8 h-[600px] flex items-center justify-center">
                  <div className="text-center">
                    <MapIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">Map view coming soon</p>
                    <p className="text-sm text-slate-500 mt-2">Interactive map to visualize breeder locations</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SearchPage;