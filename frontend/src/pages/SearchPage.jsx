import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { supabase } from '@/lib/supabaseClient';
import { MapPin, Search, SlidersHorizontal } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const BREEDS = ['Cane Corso', 'French Bulldog', 'American Bully', 'Exotic Bully', 'Doodle'];

const LITTER_STATUSES = [
  { value: 'all', label: 'All Statuses' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'available', label: 'Available' },
  { value: 'sold', label: 'Sold' },
];

const LITTER_STATUS_STYLES = {
  upcoming: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  available: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  sold: 'bg-red-500/20 text-red-300 border-red-500/30',
};

const getTrustBadge = (score) => {
  if (!score) return null;
  if (score >= 80) return { label: 'Gold', color: '#C5A55A' };
  if (score >= 60) return { label: 'Silver', color: '#94A3B8' };
  return null;
};

const getAge = (dob) => {
  if (!dob) return null;
  const ms = Date.now() - new Date(dob).getTime();
  const years = Math.floor(ms / (365.25 * 24 * 3600 * 1000));
  if (years >= 1) return `${years}yr`;
  const months = Math.floor(ms / (30.44 * 24 * 3600 * 1000));
  return months > 0 ? `${months}mo` : null;
};

// ─── Shared helpers ─────────────────────────────────────────────────────────

const Loading = () => (
  <div className="py-20 text-center">
    <div className="w-8 h-8 border-2 border-[#C5A55A] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
    <p className="text-slate-400 text-sm">Loading...</p>
  </div>
);

const EmptyState = ({ msg }) => (
  <div className="text-center py-20 bg-[#1E3A5F]/20 rounded-xl border border-white/5">
    <Search className="w-10 h-10 text-slate-600 mx-auto mb-3" />
    <p className="text-slate-400">{msg}</p>
  </div>
);

const TrustBadge = ({ score }) => {
  const badge = getTrustBadge(score);
  if (!badge) return null;
  return (
    <span
      className="text-xs px-2 py-0.5 rounded-full border font-medium"
      style={{ color: badge.color, borderColor: badge.color + '50', backgroundColor: badge.color + '20' }}
    >
      {badge.label}
    </span>
  );
};

// ─── Filters bar ────────────────────────────────────────────────────────────

const FiltersBar = ({ children, onClear, dirty }) => (
  <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-[#1E3A5F]/30 rounded-xl border border-white/10">
    <div className="flex items-center gap-2">
      <SlidersHorizontal className="w-4 h-4 text-[#C5A55A]" />
      <span className="text-sm text-slate-300 font-medium">Filters</span>
    </div>
    {children}
    {dirty && (
      <Button variant="ghost" size="sm" onClick={onClear} className="text-slate-400 hover:text-white text-xs">
        Clear
      </Button>
    )}
  </div>
);

// ─── Breeders Tab ────────────────────────────────────────────────────────────

const BreedersTab = () => {
  const navigate = useNavigate();
  const [breeders, setBreeders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'breeder')
        .order('created_at', { ascending: false });
      setBreeders(data || []);
      setLoading(false);
    })();
  }, []);

  if (loading) return <Loading />;

  return (
    <>
      <p className="text-slate-400 text-sm mb-6">
        <span className="text-white font-semibold">{breeders.length}</span> breeders found
      </p>
      {breeders.length === 0 ? (
        <EmptyState msg="No breeders yet." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {breeders.map((b) => (
            <div
              key={b.id}
              onClick={() => navigate(`/breeder/${b.id}`)}
              className="bg-[#1E3A5F]/40 backdrop-blur-md border border-white/10 rounded-xl p-5 hover:border-[#C5A55A]/50 transition-all cursor-pointer group"
              data-testid={`breeder-card-${b.id}`}
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#C5A55A] to-[#8B6914] flex items-center justify-center text-[#0A1628] font-bold text-xl flex-shrink-0 group-hover:scale-105 transition-transform">
                  {(b.kennel_name || b.full_name || '?').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white text-base leading-tight mb-0.5 truncate group-hover:text-[#C5A55A] transition-colors">
                    {b.kennel_name || b.full_name || 'Unnamed Breeder'}
                  </h3>
                  {b.kennel_name && b.full_name && (
                    <p className="text-sm text-slate-400 mb-1 truncate">{b.full_name}</p>
                  )}
                  {b.location && (
                    <div className="flex items-center gap-1 text-xs text-slate-400 mb-2">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{b.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 flex-wrap">
                    {b.trust_score > 0 && (
                      <span className="text-xs text-slate-400">
                        Trust: <span className="text-white font-medium">{b.trust_score}</span>
                      </span>
                    )}
                    <TrustBadge score={b.trust_score} />
                    {b.ofa_verified && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        OFA
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

// ─── Dogs Tab ────────────────────────────────────────────────────────────────

const DogsTab = () => {
  const navigate = useNavigate();
  const [dogs, setDogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [breedFilter, setBreedFilter] = useState('all');
  const [onlyBreeding, setOnlyBreeding] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      let q = supabase
        .from('dogs')
        .select('*, users!owner_id(full_name, kennel_name)')
        .order('created_at', { ascending: false });
      if (breedFilter !== 'all') q = q.eq('breed', breedFilter);
      if (onlyBreeding) q = q.eq('available_for_breeding', true);
      const { data } = await q;
      setDogs(data || []);
      setLoading(false);
    })();
  }, [breedFilter, onlyBreeding]);

  const dirty = breedFilter !== 'all' || onlyBreeding;

  return (
    <>
      <FiltersBar dirty={dirty} onClear={() => { setBreedFilter('all'); setOnlyBreeding(false); }}>
        <Select value={breedFilter} onValueChange={setBreedFilter}>
          <SelectTrigger className="w-44 bg-[#0A1628] border-white/10 text-white text-sm h-9" data-testid="dog-breed-filter">
            <SelectValue placeholder="All Breeds" />
          </SelectTrigger>
          <SelectContent className="bg-[#1E3A5F] border-white/10">
            <SelectItem value="all" className="text-white">All Breeds</SelectItem>
            {BREEDS.map((b) => (
              <SelectItem key={b} value={b} className="text-white">{b}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2">
          <Switch
            id="breeding-toggle"
            checked={onlyBreeding}
            onCheckedChange={setOnlyBreeding}
            data-testid="available-for-breeding-toggle"
          />
          <Label htmlFor="breeding-toggle" className="text-sm text-slate-300 cursor-pointer select-none">
            Available for Breeding
          </Label>
        </div>
      </FiltersBar>

      {loading ? <Loading /> : (
        <>
          <p className="text-slate-400 text-sm mb-6">
            <span className="text-white font-semibold">{dogs.length}</span> dogs found
          </p>
          {dogs.length === 0 ? (
            <EmptyState msg="No dogs found matching your filters." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {dogs.map((dog) => {
                const age = getAge(dog.dob);
                const ownerName = dog.users?.kennel_name || dog.users?.full_name;
                return (
                  <div
                    key={dog.id}
                    onClick={() => navigate(`/dog/${dog.id}`)}
                    className="bg-[#1E3A5F]/40 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden hover:border-[#C5A55A]/50 transition-all cursor-pointer group"
                    data-testid={`dog-card-${dog.id}`}
                  >
                    <div className="h-36 bg-[#0A1628] flex items-center justify-center overflow-hidden">
                      {dog.image_url ? (
                        <img
                          src={dog.image_url}
                          alt={dog.registered_name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <span className="text-5xl font-bold text-[#C5A55A]/60 group-hover:text-[#C5A55A] transition-colors">
                          {(dog.registered_name || '?').charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-white mb-1 truncate group-hover:text-[#C5A55A] transition-colors">
                        {dog.call_name || dog.registered_name}
                      </h3>
                      <p className="text-sm text-slate-400 mb-2">
                        {[dog.breed, dog.sex && (dog.sex.charAt(0).toUpperCase() + dog.sex.slice(1)), age]
                          .filter(Boolean)
                          .join(' • ')}
                      </p>
                      <div className="flex items-center justify-between gap-2">
                        {ownerName && (
                          <p className="text-xs text-slate-500 truncate">{ownerName}</p>
                        )}
                        <TrustBadge score={dog.trust_score} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </>
  );
};

// ─── Litters Tab ─────────────────────────────────────────────────────────────

const LittersTab = () => {
  const navigate = useNavigate();
  const [litters, setLitters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [breedFilter, setBreedFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    (async () => {
      setLoading(true);
      let q = supabase
        .from('litters')
        .select('*, users!breeder_id(full_name, kennel_name)')
        .order('created_at', { ascending: false });
      if (breedFilter !== 'all') q = q.eq('breed', breedFilter);
      if (statusFilter !== 'all') q = q.eq('status', statusFilter);
      const { data } = await q;
      setLitters(data || []);
      setLoading(false);
    })();
  }, [breedFilter, statusFilter]);

  const dirty = breedFilter !== 'all' || statusFilter !== 'all';

  return (
    <>
      <FiltersBar dirty={dirty} onClear={() => { setBreedFilter('all'); setStatusFilter('all'); }}>
        <Select value={breedFilter} onValueChange={setBreedFilter}>
          <SelectTrigger className="w-44 bg-[#0A1628] border-white/10 text-white text-sm h-9" data-testid="litter-breed-filter">
            <SelectValue placeholder="All Breeds" />
          </SelectTrigger>
          <SelectContent className="bg-[#1E3A5F] border-white/10">
            <SelectItem value="all" className="text-white">All Breeds</SelectItem>
            {BREEDS.map((b) => (
              <SelectItem key={b} value={b} className="text-white">{b}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40 bg-[#0A1628] border-white/10 text-white text-sm h-9" data-testid="litter-status-filter">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent className="bg-[#1E3A5F] border-white/10">
            {LITTER_STATUSES.map((s) => (
              <SelectItem key={s.value} value={s.value} className="text-white">{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FiltersBar>

      {loading ? <Loading /> : (
        <>
          <p className="text-slate-400 text-sm mb-6">
            <span className="text-white font-semibold">{litters.length}</span> litters found
          </p>
          {litters.length === 0 ? (
            <EmptyState msg="No litters found matching your filters." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {litters.map((litter) => {
                const breederName = litter.users?.kennel_name || litter.users?.full_name;
                const statusClass = LITTER_STATUS_STYLES[litter.status] || 'bg-slate-500/20 text-slate-400 border-slate-500/30';
                const dateLabel = litter.birth_date ? 'Born' : litter.expected_date ? 'Expected' : null;
                const dateVal = litter.birth_date || litter.expected_date;
                return (
                  <div
                    key={litter.id}
                    onClick={() => navigate(`/litter/${litter.id}`)}
                    className="bg-[#1E3A5F]/40 backdrop-blur-md border border-white/10 rounded-xl p-5 hover:border-[#C5A55A]/50 transition-all cursor-pointer group"
                    data-testid={`litter-card-${litter.id}`}
                  >
                    <div className="flex items-start justify-between mb-3 gap-2">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-white text-base mb-0.5 group-hover:text-[#C5A55A] transition-colors">
                          {litter.breed} Litter
                        </h3>
                        {breederName && (
                          <p className="text-sm text-slate-400 truncate">{breederName}</p>
                        )}
                      </div>
                      {litter.status && (
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border flex-shrink-0 ${statusClass}`}>
                          {litter.status.charAt(0).toUpperCase() + litter.status.slice(1)}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      <div>
                        <p className="text-slate-400 text-xs">Puppies</p>
                        <p className="text-white font-medium">{litter.puppy_count ?? '—'}</p>
                      </div>
                      {litter.price_range && (
                        <div>
                          <p className="text-slate-400 text-xs">Price Range</p>
                          <p className="text-[#C5A55A] font-semibold">{litter.price_range}</p>
                        </div>
                      )}
                      {litter.status === 'available' && litter.available_count > 0 && (
                        <div>
                          <p className="text-slate-400 text-xs">Available</p>
                          <p className="text-emerald-400 font-medium">{litter.available_count}</p>
                        </div>
                      )}
                      {dateLabel && dateVal && (
                        <div>
                          <p className="text-slate-400 text-xs">{dateLabel}</p>
                          <p className="text-white">
                            {new Date(dateVal).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </>
  );
};

// ─── Main Page ───────────────────────────────────────────────────────────────

const SearchPage = () => {
  const [activeTab, setActiveTab] = useState('breeders');

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

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList
              className="bg-[#1E3A5F]/40 border border-white/10 mb-8"
              data-testid="search-tabs"
            >
              <TabsTrigger
                value="breeders"
                className="data-[state=active]:bg-[#C5A55A] data-[state=active]:text-[#0A1628] font-medium"
                data-testid="breeders-tab"
              >
                Breeders
              </TabsTrigger>
              <TabsTrigger
                value="dogs"
                className="data-[state=active]:bg-[#C5A55A] data-[state=active]:text-[#0A1628] font-medium"
                data-testid="dogs-tab"
              >
                Dogs
              </TabsTrigger>
              <TabsTrigger
                value="litters"
                className="data-[state=active]:bg-[#C5A55A] data-[state=active]:text-[#0A1628] font-medium"
                data-testid="litters-tab"
              >
                Litters
              </TabsTrigger>
            </TabsList>

            <TabsContent value="breeders">
              <BreedersTab />
            </TabsContent>
            <TabsContent value="dogs">
              <DogsTab />
            </TabsContent>
            <TabsContent value="litters">
              <LittersTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default SearchPage;
