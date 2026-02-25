import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MapPin, Calendar, DollarSign, Package, FileText, Heart, Mail, ExternalLink } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

const LitterDetailPage = () => {
  const { litterId } = useParams();
  const navigate = useNavigate();
  const [litter, setLitter] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLitter();
  }, [litterId]);

  const fetchLitter = async () => {
    try {
      const { data, error } = await supabase
        .from('litters')
        .select(`
          *,
          sire:dogs!litters_sire_id_fkey(id, registered_name, call_name, breed, trust_score, image_url, registration_number),
          dam:dogs!litters_dam_id_fkey(id, registered_name, call_name, breed, trust_score, image_url, registration_number),
          breeder:users!litters_breeder_id_fkey(id, full_name, kennel_name, location, bio)
        `)
        .eq('id', litterId)
        .single();

      if (error) throw error;
      setLitter(data);
    } catch (error) {
      console.error('Error fetching litter:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      upcoming: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' },
      available: { bg: 'bg-[#2ECC71]/20', text: 'text-[#2ECC71]', border: 'border-[#2ECC71]/30' },
      sold: { bg: 'bg-slate-500/20', text: 'text-slate-400', border: 'border-slate-500/30' },
    };
    return styles[status] || styles.sold;
  };

  const formatPrice = (min, max) => {
    if (!min && !max) return 'Contact for price';
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min) return `From $${min.toLocaleString()}`;
    return `Up to $${max.toLocaleString()}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleInquiry = () => {
    if (litter?.breeder) {
      alert('Inquiry feature coming soon! For now, please contact the breeder directly through their profile.');
    }
  };

  const TrustScoreCircle = ({ score }) => {
    const radius = 30;
    const circumference = 2 * Math.PI * radius;
    const progress = (score / 100) * circumference;
    
    return (
      <div className="relative w-20 h-20">
        <svg className="w-20 h-20 transform -rotate-90">
          <circle
            cx="40"
            cy="40"
            r={radius}
            stroke="#1E3A5F"
            strokeWidth="6"
            fill="none"
          />
          <circle
            cx="40"
            cy="40"
            r={radius}
            stroke={score >= 60 ? '#2ECC71' : score >= 30 ? '#C5A55A' : '#EF4444'}
            strokeWidth="6"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white font-bold text-lg">{score || 0}</span>
        </div>
      </div>
    );
  };

  const DogCard = ({ dog, role }) => (
    <Link
      to={`/dog/${dog.id}`}
      className="block bg-[#1E3A5F]/40 backdrop-blur-md border border-white/10 rounded-xl p-6 hover:border-[#C5A55A]/50 transition-all group"
      data-testid={`${role}-card`}
    >
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-full bg-[#0A1628] flex items-center justify-center overflow-hidden border-2 border-[#C5A55A]/30">
          {dog.image_url ? (
            <img src={dog.image_url} alt={dog.registered_name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-3xl font-bold text-[#C5A55A]">
              {dog.registered_name?.charAt(0) || '?'}
            </span>
          )}
        </div>
        <div className="flex-1">
          <p className="text-xs text-[#C5A55A] uppercase tracking-wider mb-1">{role}</p>
          <h4 className="text-lg font-semibold text-white group-hover:text-[#C5A55A] transition-colors">
            {dog.call_name || dog.registered_name}
          </h4>
          <p className="text-slate-400 text-sm">{dog.breed}</p>
          {dog.registration_number && (
            <p className="text-xs text-[#2ECC71] mt-1 flex items-center gap-1">
              <FileText className="w-3 h-3" />
              {dog.registration_number}
            </p>
          )}
        </div>
        <TrustScoreCircle score={dog.trust_score} />
      </div>
      <div className="mt-4 flex items-center justify-end text-slate-400 text-sm group-hover:text-[#C5A55A]">
        View Profile <ExternalLink className="w-4 h-4 ml-1" />
      </div>
    </Link>
  );

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-[#0A1628] py-12 px-6 flex items-center justify-center">
          <div className="text-white">Loading litter details...</div>
        </div>
      </Layout>
    );
  }

  if (!litter) {
    return (
      <Layout>
        <div className="min-h-screen bg-[#0A1628] py-12 px-6 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Litter Not Found</h2>
            <Button onClick={() => navigate('/litters')} className="bg-[#C5A55A] text-[#0A1628]">
              Browse All Litters
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const statusStyle = getStatusBadge(litter.status);

  return (
    <Layout>
      <div className="min-h-screen bg-[#0A1628] py-12 px-6" data-testid="litter-detail-page">
        <div className="max-w-5xl mx-auto">
          <Button
            onClick={() => navigate('/litters')}
            variant="ghost"
            className="text-slate-300 hover:text-white mb-6"
            data-testid="back-button"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Litters
          </Button>

          {/* Main Info Card */}
          <div className="bg-[#1E3A5F]/40 backdrop-blur-md border border-white/10 rounded-xl p-8 mb-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1
                    className="text-4xl font-bold text-white"
                    style={{ fontFamily: 'Playfair Display, serif' }}
                  >
                    {litter.breed} <span className="text-[#C5A55A]">Litter</span>
                  </h1>
                  <span className={`px-4 py-1 rounded-full text-sm font-semibold border capitalize ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                    {litter.status}
                  </span>
                </div>
                <p className="text-3xl font-bold text-[#C5A55A] mt-4">
                  {formatPrice(litter.price_min, litter.price_max)}
                </p>
              </div>

              <Button
                onClick={handleInquiry}
                size="lg"
                className="bg-[#C5A55A] text-[#0A1628] hover:bg-[#D4B66A] font-semibold"
                data-testid="inquire-button"
              >
                <Mail className="w-5 h-5 mr-2" />
                Inquire About This Litter
              </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="p-4 bg-[#0A1628] rounded-lg">
                <div className="flex items-center gap-2 text-slate-400 mb-1">
                  <Package className="w-4 h-4" />
                  <span className="text-sm">Puppies</span>
                </div>
                <p className="text-2xl font-bold text-white">{litter.puppy_count || '—'}</p>
              </div>
              <div className="p-4 bg-[#0A1628] rounded-lg">
                <div className="flex items-center gap-2 text-slate-400 mb-1">
                  <Package className="w-4 h-4" />
                  <span className="text-sm">Available</span>
                </div>
                <p className="text-2xl font-bold text-[#2ECC71]">{litter.available_count || 0}</p>
              </div>
              <div className="p-4 bg-[#0A1628] rounded-lg">
                <div className="flex items-center gap-2 text-slate-400 mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">{litter.born_date ? 'Born' : 'Expected'}</span>
                </div>
                <p className="text-lg font-semibold text-white">
                  {formatDate(litter.born_date || litter.expected_date) || '—'}
                </p>
              </div>
              <div className="p-4 bg-[#0A1628] rounded-lg">
                <div className="flex items-center gap-2 text-slate-400 mb-1">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-sm">Price Range</span>
                </div>
                <p className="text-lg font-semibold text-[#C5A55A]">
                  {formatPrice(litter.price_min, litter.price_max)}
                </p>
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-4 mb-8">
              {litter.papers_verified && (
                <div className="flex items-center gap-2 px-4 py-2 bg-[#2ECC71]/10 border border-[#2ECC71]/30 rounded-lg">
                  <FileText className="w-5 h-5 text-[#2ECC71]" />
                  <div>
                    <p className="text-[#2ECC71] font-semibold">Papers Verified</p>
                    <p className="text-xs text-slate-400">Both parents have registration papers</p>
                  </div>
                </div>
              )}
              {litter.health_checked && (
                <div className="flex items-center gap-2 px-4 py-2 bg-[#2ECC71]/10 border border-[#2ECC71]/30 rounded-lg">
                  <Heart className="w-5 h-5 text-[#2ECC71]" />
                  <div>
                    <p className="text-[#2ECC71] font-semibold">Health Checked</p>
                    <p className="text-xs text-slate-400">Both parents have health records</p>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            {litter.description && (
              <div>
                <h3 className="text-lg font-semibold text-[#C5A55A] mb-3">About This Litter</h3>
                <p className="text-slate-300 leading-relaxed whitespace-pre-line">{litter.description}</p>
              </div>
            )}
          </div>

          {/* Parents Section */}
          <div className="mb-8">
            <h2
              className="text-2xl font-bold text-white mb-6"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Parents
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {litter.sire && <DogCard dog={litter.sire} role="Sire" />}
              {litter.dam && <DogCard dog={litter.dam} role="Dam" />}
            </div>
          </div>

          {/* Breeder Section */}
          {litter.breeder && (
            <div className="bg-[#1E3A5F]/40 backdrop-blur-md border border-white/10 rounded-xl p-6">
              <h2
                className="text-2xl font-bold text-white mb-6"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                Breeder Information
              </h2>
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-16 h-16 rounded-full bg-[#C5A55A] flex items-center justify-center text-[#0A1628] text-2xl font-bold">
                    {(litter.breeder.kennel_name || litter.breeder.full_name)?.charAt(0) || '?'}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">
                      {litter.breeder.kennel_name || litter.breeder.full_name}
                    </h3>
                    {litter.breeder.location && (
                      <p className="text-slate-400 flex items-center gap-1 mt-1">
                        <MapPin className="w-4 h-4" />
                        {litter.breeder.location}
                      </p>
                    )}
                  </div>
                </div>
                <Link
                  to={`/breeder/${litter.breeder.id}`}
                  className="inline-flex"
                  data-testid="view-breeder-button"
                >
                  <Button variant="outline" className="border-[#C5A55A] text-[#C5A55A] hover:bg-[#C5A55A]/10">
                    View Breeder Profile
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
              {litter.breeder.bio && (
                <p className="text-slate-300 mt-4 pt-4 border-t border-white/10">{litter.breeder.bio}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default LitterDetailPage;
