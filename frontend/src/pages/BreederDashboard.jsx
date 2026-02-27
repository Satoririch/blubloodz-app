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
                  {newInquiriesCount > 0 && (
                    <span className="bg-[#C5A55A] text-[#0A1628] text-xs font-bold px-2 py-1 rounded-full">
                      {newInquiriesCount} new
                    </span>
                  )}
                </div>
                {inquiries.length === 0 ? (
                  <div className="text-center py-6">
                    <MessageSquare className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                    <p className="text-slate-400 text-sm">
                      No inquiries yet. When buyers are interested in your litters, their messages will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                    {inquiries.map(inquiry => {
                      const statusStyle = getInquiryStatusBadge(inquiry.status);
                      return (
                        <div
                          key={inquiry.id}
                          className="bg-[#0A1628] border border-white/10 rounded-lg p-4"
                          data-testid={`inquiry-card-${inquiry.id}`}
                        >
                          {/* Header with buyer name and status */}
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <span className="font-medium text-white">
                                {inquiry.users?.full_name || 'Anonymous Buyer'}
                              </span>
                              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium border capitalize ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                                {inquiry.status}
                              </span>
                            </div>
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatInquiryDate(inquiry.created_at)}
                            </span>
                          </div>

                          {/* Contact info */}
                          <div className="flex flex-wrap gap-3 mb-3 text-xs">
                            {inquiry.users?.email && (
                              <a 
                                href={`mailto:${inquiry.users.email}`}
                                className="text-[#C5A55A] hover:underline flex items-center gap-1"
                              >
                                <Mail className="w-3 h-3" />
                                {inquiry.users.email}
                              </a>
                            )}
                            {inquiry.users?.phone && (
                              <a 
                                href={`tel:${inquiry.users.phone}`}
                                className="text-[#C5A55A] hover:underline flex items-center gap-1"
                              >
                                <Phone className="w-3 h-3" />
                                {inquiry.users.phone}
                              </a>
                            )}
                          </div>

                          {/* Litter info */}
                          {inquiry.litters && (
                            <div className="text-xs text-slate-400 mb-3 p-2 bg-[#1E3A5F]/30 rounded">
                              Re: <span className="text-white">{inquiry.litters.breed} Litter</span>
                              {inquiry.litters.puppy_count && (
                                <span> ({inquiry.litters.puppy_count} puppies)</span>
                              )}
                            </div>
                          )}

                          {/* Message */}
                          <p className="text-sm text-slate-300 mb-3 whitespace-pre-wrap">{inquiry.message}</p>

                          {/* Action buttons */}
                          {inquiry.status !== 'closed' && (
                            <div className="flex gap-2 pt-2 border-t border-white/10">
                              {inquiry.status === 'new' && (
                                <Button
                                  size="sm"
                                  onClick={() => handleUpdateInquiryStatus(inquiry.id, 'replied')}
                                  className="bg-[#2ECC71] text-white hover:bg-[#27AE60] text-xs"
                                  data-testid={`mark-replied-${inquiry.id}`}
                                >
                                  <Check className="w-3 h-3 mr-1" />
                                  Mark as Replied
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUpdateInquiryStatus(inquiry.id, 'closed')}
                                className="border-white/20 text-slate-400 hover:text-white text-xs"
                                data-testid={`close-inquiry-${inquiry.id}`}
                              >
                                <X className="w-3 h-3 mr-1" />
                                Close
                              </Button>
                            </div>
                          )}
                        </div>
                      );
                    })}
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
