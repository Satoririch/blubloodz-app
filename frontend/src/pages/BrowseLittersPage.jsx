import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, MapPin, Check, FileText, Heart, Filter } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

const BREEDS = [
  'All Breeds',
  'Cane Corso', 'French Bulldog', 'American Bully', 'Exotic Bully',
  'Doodle', 'Rottweiler', 'Doberman', 'Belgian Malinois',
  'German Shepherd', 'English Bulldog', 'Pitbull', 'Other'
];

const STATUSES = [
  { value: 'all', label: 'All Statuses' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'available', label: 'Available' },
];

const BrowseLittersPage = () => {
  const navigate = useNavigate();
  const [litters, setLitters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    breed: 'All Breeds',
    status: 'all',
    priceMin: '',
    priceMax: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchLitters();
  }, [filters]);

  const fetchLitters = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('litters')
        .select(`
          *,
          sire:dogs!litters_sire_id_fkey(id, registered_name, call_name, breed, trust_score, image_url),
          dam:dogs!litters_dam_id_fkey(id, registered_name, call_name, breed, trust_score, image_url),
          breeder:users!litters_breeder_id_fkey(id, full_name, kennel_name, location)
        `)
        .order('created_at', { ascending: false });

      if (filters.breed && filters.breed !== 'All Breeds') {
        query = query.eq('breed', filters.breed);
      }
      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters.priceMin) {
        query = query.gte('price_min', parseFloat(filters.priceMin));
      }
      if (filters.priceMax) {
        query = query.lte('price_max', parseFloat(filters.priceMax));
      }

      const { data, error } = await query;
      if (error) throw error;
      setLitters(data || []);
    } catch (error) {
      console.error('Error fetching litters:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      upcoming: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      available: 'bg-[#2ECC71]/20 text-[#2ECC71] border-[#2ECC71]/30',
      sold: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    };
    return styles[status] || styles.sold;
  };

  const formatPrice = (min, max) => {
    if (!min && !max) return 'Contact for price';
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min) return `From $${min.toLocaleString()}`;
    return `Up to $${max.toLocaleString()}`;
  };

  const LitterCard = ({ litter }) => (
    <Link
      to={`/litter/${litter.id}`}
      className="block bg-[#1E3A5F]/40 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden hover:border-[#C5A55A]/50 transition-all group"
      data-testid={`litter-card-${litter.id}`}
    >
      {/* Card Header with Breed */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-white group-hover:text-[#C5A55A] transition-colors">
              {litter.breed}
            </h3>
            <p className="text-slate-400 text-sm mt-1">
              {litter.puppy_count || '?'} puppies • {litter.available_count || 0} available
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border capitalize ${getStatusBadge(litter.status)}`}>
            {litter.status}
          </span>
        </div>

        {/* Price */}
        <p className="text-2xl font-bold text-[#C5A55A] mb-4">
          {formatPrice(litter.price_min, litter.price_max)}
        </p>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          {litter.papers_verified && (
            <span className="flex items-center gap-1 px-2 py-1 bg-[#2ECC71]/10 border border-[#2ECC71]/30 rounded-full text-xs text-[#2ECC71]">
              <FileText className="w-3 h-3" />
              Papers Verified
            </span>
          )}
          {litter.health_checked && (
            <span className="flex items-center gap-1 px-2 py-1 bg-[#2ECC71]/10 border border-[#2ECC71]/30 rounded-full text-xs text-[#2ECC71]">
              <Heart className="w-3 h-3" />
              Health Checked
            </span>
          )}
        </div>

        {/* Parents */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {litter.sire && (
            <div className="p-3 bg-[#0A1628] rounded-lg">
              <p className="text-xs text-slate-400 uppercase mb-1">Sire</p>
              <p className="text-white text-sm font-medium truncate">
                {litter.sire.call_name || litter.sire.registered_name}
              </p>
            </div>
          )}
          {litter.dam && (
            <div className="p-3 bg-[#0A1628] rounded-lg">
              <p className="text-xs text-slate-400 uppercase mb-1">Dam</p>
              <p className="text-white text-sm font-medium truncate">
                {litter.dam.call_name || litter.dam.registered_name}
              </p>
            </div>
          )}
        </div>

        {/* Breeder Info */}
        {litter.breeder && (
          <div className="flex items-center gap-3 pt-4 border-t border-white/10">
            <div className="w-10 h-10 rounded-full bg-[#C5A55A] flex items-center justify-center text-[#0A1628] font-bold">
              {(litter.breeder.kennel_name || litter.breeder.full_name)?.charAt(0) || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium truncate">
                {litter.breeder.kennel_name || litter.breeder.full_name}
              </p>
              {litter.breeder.location && (
                <p className="text-slate-400 text-xs flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {litter.breeder.location}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </Link>
  );

  const EmptyState = () => (
    <div className="text-center py-16">
      <div className="w-20 h-20 rounded-full bg-[#1E3A5F]/40 flex items-center justify-center mx-auto mb-4">
        <Package className="w-10 h-10 text-slate-400" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">No Litters Found</h3>
      <p className="text-slate-400 mb-6">
        {filters.breed !== 'All Breeds' || filters.status !== 'all'
          ? 'Try adjusting your filters to find more results.'
          : 'There are no litters listed yet. Check back soon!'}
      </p>
      {(filters.breed !== 'All Breeds' || filters.status !== 'all') && (
        <Button
          onClick={() => setFilters({ breed: 'All Breeds', status: 'all', priceMin: '', priceMax: '' })}
          variant="outline"
          className="border-[#C5A55A] text-[#C5A55A] hover:bg-[#C5A55A]/10"
        >
          Clear Filters
        </Button>
      )}
    </div>
  );

  return (
    <Layout>
      <div className="min-h-screen bg-[#0A1628] py-12 px-6" data-testid="browse-litters-page">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1
              className="text-4xl md:text-5xl font-bold text-white mb-4"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Browse <span className="text-[#C5A55A]">Litters</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Find your perfect puppy from verified breeders with health-tested parents
            </p>
          </div>

          {/* Filters */}
          <div className="bg-[#1E3A5F]/40 backdrop-blur-md border border-white/10 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between mb-4 md:hidden">
              <span className="text-white font-medium">Filters</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="text-[#C5A55A]"
              >
                <Filter className="w-4 h-4 mr-2" />
                {showFilters ? 'Hide' : 'Show'}
              </Button>
            </div>

            <div className={`grid grid-cols-1 md:grid-cols-4 gap-4 ${showFilters ? 'block' : 'hidden md:grid'}`}>
              <Select
                value={filters.breed}
                onValueChange={(value) => setFilters(prev => ({ ...prev, breed: value }))}
              >
                <SelectTrigger className="bg-[#0A1628] border-white/10 text-white" data-testid="breed-filter">
                  <SelectValue placeholder="All Breeds" />
                </SelectTrigger>
                <SelectContent className="bg-[#1E3A5F] border-white/10">
                  {BREEDS.map(b => (
                    <SelectItem key={b} value={b} className="text-white">{b}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.status}
                onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger className="bg-[#0A1628] border-white/10 text-white" data-testid="status-filter">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent className="bg-[#1E3A5F] border-white/10">
                  {STATUSES.map(s => (
                    <SelectItem key={s.value} value={s.value} className="text-white">{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                type="number"
                placeholder="Min Price"
                value={filters.priceMin}
                onChange={(e) => setFilters(prev => ({ ...prev, priceMin: e.target.value }))}
                className="bg-[#0A1628] border-white/10 text-white"
                data-testid="price-min-filter"
              />

              <Input
                type="number"
                placeholder="Max Price"
                value={filters.priceMax}
                onChange={(e) => setFilters(prev => ({ ...prev, priceMax: e.target.value }))}
                className="bg-[#0A1628] border-white/10 text-white"
                data-testid="price-max-filter"
              />
            </div>
          </div>

          {/* Results Count */}
          {!loading && litters.length > 0 && (
            <p className="text-slate-400 mb-6">
              Showing <span className="text-white font-medium">{litters.length}</span> litter{litters.length !== 1 ? 's' : ''}
            </p>
          )}

          {/* Litters Grid */}
          {loading ? (
            <div className="text-center py-16">
              <div className="text-white">Loading litters...</div>
            </div>
          ) : litters.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {litters.map(litter => (
                <LitterCard key={litter.id} litter={litter} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default BrowseLittersPage;
