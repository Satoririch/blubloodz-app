import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import TrustScoreGauge from '@/components/TrustScoreGauge';
import VerifiedBadge from '@/components/VerifiedBadge';
import { Dog, Package, MessageSquare, ArrowRight, Plus, Check, X, Mail, Phone, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';

const BreederDashboard = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [dogs, setDogs] = useState([]);
  const [litters, setLitters] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const profileCompleteness = profile ? 85 : 0;
  
  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);
  
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch dogs
      const { data: dogsData, error: dogsError } = await supabase
        .from('dogs')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });
      
      if (dogsError) throw dogsError;
      setDogs(dogsData || []);
      
      // Fetch litters
      const { data: littersData, error: littersError } = await supabase
        .from('litters')
        .select('*')
        .eq('breeder_id', user.id)
        .order('created_at', { ascending: false });
      
      if (littersError) throw littersError;
      setLitters(littersData || []);
      
      // Fetch inquiries with full details
      const { data: inquiriesData, error: inquiriesError } = await supabase
        .from('inquiries')
        .select(`
          id,
          message,
          status,
          created_at,
          updated_at,
          litter_id,
          buyer_id,
          litters (
            id,
            breed,
            puppy_count,
            status
          ),
          users!inquiries_buyer_id_fkey (
            id,
            full_name,
            email,
            phone
          )
        `)
        .eq('breeder_id', user.id)
        .order('created_at', { ascending: false });
      
      if (inquiriesError) throw inquiriesError;
      setInquiries(inquiriesData || []);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const calculateAge = (dob) => {
    if (!dob) return 'N/A';
    const birthDate = new Date(dob);
    const today = new Date();
    const years = today.getFullYear() - birthDate.getFullYear();
    const months = today.getMonth() - birthDate.getMonth();
    
    if (years > 0) {
      return `${years} year${years > 1 ? 's' : ''}`;
    }
    return `${months} month${months > 1 ? 's' : ''}`;
  };
  
  const getTrustScoreBadge = (score) => {
    if (!score) return null;
    if (score >= 80) return { text: 'Gold', color: '#C5A55A' };
    if (score >= 60) return { text: 'Silver', color: '#94A3B8' };
    return null;
  };

  const handleUpdateInquiryStatus = async (inquiryId, newStatus) => {
    try {
      const { error } = await supabase
        .from('inquiries')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', inquiryId);

      if (error) throw error;

      // Update local state
      setInquiries(prev => 
        prev.map(inq => inq.id === inquiryId ? { ...inq, status: newStatus } : inq)
      );
    } catch (error) {
      console.error('Error updating inquiry status:', error);
      alert('Failed to update inquiry status');
    }
  };

  const getInquiryStatusBadge = (status) => {
    const styles = {
      new: { bg: 'bg-[#C5A55A]/20', text: 'text-[#C5A55A]', border: 'border-[#C5A55A]/30' },
      replied: { bg: 'bg-[#2ECC71]/20', text: 'text-[#2ECC71]', border: 'border-[#2ECC71]/30' },
      closed: { bg: 'bg-slate-500/20', text: 'text-slate-400', border: 'border-slate-500/30' },
    };
    return styles[status] || styles.new;
  };

  const formatInquiryDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const newInquiriesCount = inquiries.filter(i => i.status === 'new').length;
  
  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-[#0A1628] py-12 px-6 flex items-center justify-center">
          <div className="text-white">Loading dashboard...</div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="min-h-screen bg-[#0A1628] py-12 px-6" data-testid="breeder-dashboard">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 
              className="text-4xl md:text-5xl font-bold text-white mb-2"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Welcome back, {profile?.full_name || profile?.kennel_name || 'Breeder'}
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
                    My Dogs ({dogs.length})
                  </h2>
                  <Button 
                    size="sm" 
                    className="bg-[#C5A55A] text-[#0A1628] hover:bg-[#D4B66A]"
                    onClick={() => navigate('/dog/add')}
                    data-testid="add-dog-button"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Dog
                  </Button>
                </div>
                {dogs.length === 0 ? (
                  <p className="text-slate-400 text-center py-8">
                    No dogs added yet. Add your first dog to get started!
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {dogs.map(dog => {
                      const badge = getTrustScoreBadge(dog.trust_score);
                      return (
                        <div
                          key={dog.id}
                          onClick={() => navigate(`/dog/${dog.id}`)}
                          className="bg-[#0A1628] border border-white/10 rounded-lg p-4 hover:border-[#C5A55A]/50 transition-all cursor-pointer card-hover"
                          data-testid={`dog-card-${dog.id}`}
                        >
                          <div className="flex gap-4">
                            <div className="w-20 h-20 rounded-lg bg-[#1E3A5F] flex items-center justify-center text-[#C5A55A] font-bold text-2xl">
                              {dog.registered_name?.charAt(0) || '?'}
                            </div>
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-white mb-1">
                                {dog.call_name || dog.registered_name}
                              </h3>
                              <p className="text-sm text-slate-400 mb-2">
                                {dog.breed} • {calculateAge(dog.dob)}
                              </p>
                              <div className="flex gap-2 flex-wrap">
                                {badge && (
                                  <span 
                                    className="px-2 py-0.5 rounded-full text-xs font-medium border"
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
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              
              <div className="bg-[#1E3A5F]/40 backdrop-blur-md border border-white/10 rounded-xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
                    <Package className="w-6 h-6" />
                    Active Litters ({litters.length})
                  </h2>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-[#C5A55A] text-[#C5A55A] hover:bg-[#C5A55A] hover:text-[#0A1628] transition-colors"
                    onClick={() => navigate('/litter/add')}
                    data-testid="add-litter-button"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Litter
                  </Button>
                </div>
                {litters.length === 0 ? (
                  <p className="text-slate-400 text-center py-8">
                    No litters added yet.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {litters.map(litter => (
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
                              {litter.expected_date ? `Expected: ${new Date(litter.expected_date).toLocaleDateString()}` : 
                               litter.birth_date ? `Born: ${new Date(litter.birth_date).toLocaleDateString()}` : 'Date TBD'}
                            </p>
                          </div>
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
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-300">
                            {litter.puppy_count || 0} puppies
                            {litter.price_range && ` • ${litter.price_range}`}
                          </span>
                          {litter.status === 'available' && litter.available_count > 0 && (
                            <span className="text-[#C5A55A] font-medium">{litter.available_count} available</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-[#1E3A5F]/40 backdrop-blur-md border border-white/10 rounded-xl p-8">
                <h2 className="text-xl font-semibold text-white mb-6 text-center">Your Trust Score</h2>
                <div className="flex justify-center mb-4">
                  <TrustScoreGauge score={profile?.trust_score || 0} size="medium" showBreakdown={false} />
                </div>
                <div className="space-y-2 text-sm">
                  {profile?.ofa_verified && (
                    <div className="flex items-center justify-between py-2 border-b border-white/10">
                      <span className="text-slate-300">OFA Verified</span>
                      <VerifiedBadge status="verified" size="small" />
                    </div>
                  )}
                  {profile?.dna_tested && (
                    <div className="flex items-center justify-between py-2 border-b border-white/10">
                      <span className="text-slate-300">DNA Tested</span>
                      <VerifiedBadge status="verified" size="small" />
                    </div>
                  )}
                  {profile?.pedigree_confirmed && (
                    <div className="flex items-center justify-between py-2 border-b border-white/10 last:border-0">
                      <span className="text-slate-300">Pedigree Confirmed</span>
                      <VerifiedBadge status="verified" size="small" />
                    </div>
                  )}
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
                  {inquiries.length > 0 && (
                    <span className="bg-[#E74C3C] text-white text-xs font-bold px-2 py-1 rounded-full">
                      {inquiries.length}
                    </span>
                  )}
                </div>
                {inquiries.length === 0 ? (
                  <p className="text-slate-400 text-center py-4 text-sm">
                    No pending inquiries
                  </p>
                ) : (
                  <div className="space-y-3">
                    {inquiries.map(inquiry => (
                      <div
                        key={inquiry.id}
                        className="bg-[#0A1628] border border-white/10 rounded-lg p-4 hover:border-[#C5A55A]/50 transition-all cursor-pointer"
                        data-testid={`inquiry-card-${inquiry.id}`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium text-white text-sm">{inquiry.buyer_name || 'Anonymous'}</span>
                          <span className="text-xs text-slate-500">
                            {new Date(inquiry.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-slate-300 line-clamp-2">{inquiry.message}</p>
                        <Button size="sm" variant="ghost" className="mt-2 text-[#C5A55A] p-0 h-auto hover:bg-transparent">
                          Reply <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BreederDashboard;
