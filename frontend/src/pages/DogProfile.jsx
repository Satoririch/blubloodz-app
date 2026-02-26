import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import HealthTestCard from '@/components/HealthTestCard';
import { ArrowLeft, Award, Calendar, Weight, FileText, Camera, Plus, Trash2, Loader2, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';

const DogProfile = () => {
  const { dogId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dog, setDog] = useState(null);
  const [owner, setOwner] = useState(null);
  const [healthRecords, setHealthRecords] = useState([]);
  const [pedigreeRows, setPedigreeRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [verificationError, setVerificationError] = useState(null);
  const [pedigreeId, setPedigreeId] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dogPhotos, setDogPhotos] = useState([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingType, setUploadingType] = useState(null);
  const profilePhotoInputRef = useRef(null);
  const galleryPhotoInputRef = useRef(null);
  
  useEffect(() => {
    fetchDogData();
  }, [dogId]);
  
  const fetchDogData = async () => {
    try {
      setLoading(true);
      
      // Fetch dog data
      const { data: dogData, error: dogError } = await supabase
        .from('dogs')
        .select('*')
        .eq('id', dogId)
        .single();
      
      if (dogError) throw dogError;
      setDog(dogData);
      
      // Fetch owner data
      const { data: ownerData, error: ownerError } = await supabase
        .from('users')
        .select('*')
        .eq('id', dogData.owner_id)
        .single();
      
      if (ownerError) throw ownerError;
      setOwner(ownerData);
      
      // Fetch health records
      const { data: healthData, error: healthError } = await supabase
        .from('health_records')
        .select('*')
        .eq('dog_id', dogId)
        .order('test_date', { ascending: false });
      
      if (healthError) throw healthError;
      setHealthRecords(healthData || []);
      
      // Fetch pedigree — returns array (multiple ancestor rows possible)
      const { data: pedigreeData } = await supabase
        .from('pedigrees')
        .select('*')
        .eq('dog_id', dogId);

      setPedigreeRows(pedigreeData || []);
      
    } catch (error) {
      console.error('Error fetching dog data:', error);
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
    if (score >= 80) return { text: 'Gold Badge', color: '#C5A55A' };
    if (score >= 60) return { text: 'Silver Badge', color: '#94A3B8' };
    return null;
  };
  
  // Convert health records to the format expected by HealthTestCard
  const formatHealthTests = () => {
    const testTypes = ['OFA Hips', 'OFA Elbows', 'Cardiac', 'Eyes', 'DNA Panel', 'Patella'];
    
    return testTypes.map(testType => {
      const record = healthRecords.find(r => r.test_type === testType);
      
      if (record) {
        return {
          name: record.test_type,
          status: record.verified ? 'verified' : 'pending',
          result: record.result,
          date: record.test_date
        };
      }
      
      return {
        name: testType,
        status: 'missing',
        result: 'Not Done',
        date: null
      };
    });
  };
  
  const handleVerifyPedigree = async () => {
    setVerifying(true);
    setVerificationError(null);
    setVerificationResult(null);
    try {
      if (!pedigreeId.trim()) {
        setVerificationError('Please enter a pedigree database ID.');
        setVerifying(false);
        return;
      }
      const response = await fetch(
        `https://blubloodz-scraper.vercel.app/api/verify-pedigree?id=${encodeURIComponent(pedigreeId.trim())}`
      );
      const data = await response.json();
      if (data.success && data.data) {
        setVerificationResult(data.data);
      } else {
        setVerificationError('Dog not found. Check the ID and try again.');
      }
    } catch (err) {
      setVerificationError('Verification service unavailable. Please try again later.');
    }
    setVerifying(false);
  };

  const handleSaveVerification = async () => {
    if (!verificationResult || !dog) return;
    setSaving(true);
    setVerificationError(null);
    try {
      const { error: pedigreeError } = await supabase.from('pedigrees').insert({
        dog_id: dog.id,
        sire_name: verificationResult.sire?.name || null,
        dam_name: verificationResult.dam?.name || null,
        lineage: {
          sire: verificationResult.sire || null,
          dam: verificationResult.dam || null,
          pedigree_number: verificationResult.pedigree_number || null,
          inbreeding_coefficient: verificationResult.inbreeding_coefficient || null
        },
        verification_source: 'canecorsopedigree.com',
        verification_status: 'verified'
      });
      if (pedigreeError) {
        setVerificationError('Pedigree save failed: ' + pedigreeError.message);
        setSaving(false);
        return;
      }

      const trustScore = calculateTrustScore(verificationResult);
      await supabase.from('dogs').update({ trust_score: trustScore }).eq('id', dog.id);
      setDog(prev => ({ ...prev, trust_score: trustScore }));

      // Refresh pedigree rows from DB so the saved data shows immediately
      const { data: refreshed } = await supabase
        .from('pedigrees')
        .select('*')
        .eq('dog_id', dog.id)
        .order('created_at', { ascending: false });
      if (refreshed) setPedigree(refreshed);

      setSaved(true);
    } catch (err) {
      setVerificationError('Save failed: ' + (err.message || 'Unknown error'));
    }
    setSaving(false);
  };

  const calculateTrustScore = (data) => {
    let score = 0;
    if (data.sire?.name) score += 15;
    if (data.dam?.name) score += 15;
    if (data.pedigree_number) score += 10;
    if (data.hd_score && data.hd_score !== 'unknown') score += 20;
    if (data.ed_score && data.ed_score !== 'Unknown' && data.ed_score !== 'unknown') score += 15;
    if (data.dsra_result && data.dsra_result !== 'UNKNOWN') score += 15;
    if (data.dvl2_result && data.dvl2_result !== 'UNKNOWN') score += 10;
    return Math.min(score, 100);
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-[#0A1628] py-12 px-6 flex items-center justify-center">
          <div className="text-white">Loading dog profile...</div>
        </div>
      </Layout>
    );
  }
  
  if (!dog) {
    return (
      <Layout>
        <div className="min-h-screen bg-[#0A1628] py-12 px-6 flex items-center justify-center">
          <div className="text-white">Dog not found</div>
        </div>
      </Layout>
    );
  }
  
  const badge = getTrustScoreBadge(dog.trust_score);
  const healthTests = formatHealthTests();
  
  return (
    <Layout>
      <div className="min-h-screen bg-[#0A1628] py-12 px-6" data-testid="dog-profile-page">
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
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div>
              <div className="bg-[#1E3A5F]/40 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden h-96 flex items-center justify-center">
                {dog.image_url ? (
                  <img
                    src={dog.image_url}
                    alt={dog.registered_name}
                    className="w-full h-full object-cover"
                    data-testid="dog-main-image"
                  />
                ) : (
                  <div className="text-[#C5A55A] text-6xl font-bold">
                    {dog.registered_name?.charAt(0) || '?'}
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h1 
                className="text-5xl font-bold text-white mb-3"
                style={{ fontFamily: 'Playfair Display, serif' }}
                data-testid="dog-name"
              >
                {dog.call_name || dog.registered_name}
              </h1>
              <p className="text-2xl text-slate-400 mb-6">{dog.breed}</p>
              
              <div className="mb-6" data-testid="trust-score-section">
                <span className="text-slate-400 text-sm block mb-1">Trust Score</span>
                <div className="flex items-center gap-3">
                  <span 
                    className="text-4xl font-bold" 
                    style={{ color: '#C5A55A' }}
                    data-testid="trust-score-value"
                  >
                    {dog.trust_score !== null && dog.trust_score !== undefined ? dog.trust_score : 0}
                  </span>
                  {badge && (
                    <span
                      className="inline-block px-3 py-1 rounded-full text-sm font-semibold border"
                      style={{
                        color: badge.color,
                        borderColor: badge.color,
                        backgroundColor: badge.color + '20'
                      }}
                      data-testid="trust-score-badge"
                    >
                      {badge.text}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="bg-[#1E3A5F]/40 backdrop-blur-md border border-white/10 rounded-xl p-6 mb-6">
                <h3 className="text-lg font-semibold text-white mb-4">Details</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-[#C5A55A]" />
                    <div>
                      <span className="text-slate-400 text-sm">Age</span>
                      <p className="text-white font-medium">{calculateAge(dog.dob)}</p>
                    </div>
                  </div>
                  {dog.weight && (
                    <div className="flex items-center gap-3">
                      <Weight className="w-5 h-5 text-[#C5A55A]" />
                      <div>
                        <span className="text-slate-400 text-sm">Weight</span>
                        <p className="text-white font-medium">{dog.weight} lbs</p>
                      </div>
                    </div>
                  )}
                  {dog.registration_number && (
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-[#C5A55A]" />
                      <div>
                        <span className="text-slate-400 text-sm">Registration</span>
                        <p className="text-white font-medium">{dog.registration_number}</p>
                      </div>
                    </div>
                  )}
                  {dog.sex && (
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400 text-sm">Sex:</span>
                      <p className="text-white font-medium">{dog.sex}</p>
                    </div>
                  )}
                  {dog.color && (
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400 text-sm">Color:</span>
                      <p className="text-white font-medium">{dog.color}</p>
                    </div>
                  )}
                </div>
              </div>
              
              {owner && (
                <div className="bg-[#1E3A5F]/40 backdrop-blur-md border border-white/10 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Breeder</h3>
                  <div
                    onClick={() => navigate(`/breeder/${owner.id}`)}
                    className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                    data-testid="breeder-link"
                  >
                    <div className="w-12 h-12 rounded-full bg-[#C5A55A] flex items-center justify-center text-[#0A1628] font-bold text-xl">
                      {owner.kennel_name?.charAt(0) || owner.full_name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <p className="text-white font-medium">{owner.kennel_name || owner.full_name}</p>
                      <p className="text-sm text-slate-400">{owner.location}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="mb-8">
            <h2 
              className="text-3xl font-bold text-white mb-6 flex items-center gap-2"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              <Award className="w-8 h-8" />
              Health Test Results
            </h2>

            {user?.id === dog.owner_id && (
              <div style={{ margin: '24px 0', padding: '20px', background: '#1a1a2e', borderRadius: '12px', border: '1px solid #2d2d44' }}>
                {pedigreeRows && pedigreeRows.length > 0 && (
                  <div style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid #4ade80', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
                    <h4 style={{ color: '#4ade80', marginBottom: '12px' }}>✅ Verified Pedigree</h4>
                    {pedigreeRows.map((row, i) => (
                      <div key={i} style={{ marginBottom: '8px', color: '#fff' }}>
                        <strong style={{ textTransform: 'capitalize' }}>{row.position}:</strong> {row.ancestor_name} {row.ancestor_registration ? '(' + row.ancestor_registration + ')' : ''}
                      </div>
                    ))}
                  </div>
                )}
                {/* Verify pedigree input section */}
                {(!pedigreeRows || pedigreeRows.length === 0) && (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                      <div>
                        <h3 style={{ color: '#c9a94e', margin: '0 0 4px 0', fontSize: '18px' }}>Pedigree Verification</h3>
                        <p style={{ color: '#999', margin: '0 0 12px 0', fontSize: '14px' }}>
                          {verificationResult ? 'Verification complete — data pulled from canecorsopedigree.com' : 'Enter your dog\'s canecorsopedigree.com ID to pull verified health records and pedigree data.'}
                        </p>
                      </div>
                      {!verificationResult && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                          <input
                            type="text"
                            value={pedigreeId}
                            onChange={(e) => setPedigreeId(e.target.value)}
                            placeholder="e.g. 115752"
                            style={{
                              padding: '10px 14px',
                              background: '#0d0d1a',
                              border: '1px solid #2d2d44',
                              borderRadius: '8px',
                              color: '#fff',
                              fontSize: '14px',
                              width: '160px'
                            }}
                          />
                          <button
                            onClick={handleVerifyPedigree}
                            disabled={verifying}
                            style={{
                              padding: '10px 24px',
                              background: verifying ? '#555' : 'linear-gradient(135deg, #c9a94e, #b8962d)',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '8px',
                              cursor: verifying ? 'not-allowed' : 'pointer',
                              fontWeight: 'bold',
                              fontSize: '14px'
                            }}
                          >
                            {verifying ? 'Verifying...' : '🔍 Verify Pedigree'}
                          </button>
                        </div>
                      )}
                    </div>
                    {verificationError && (
                      <p style={{ color: '#ff6b6b', marginTop: '12px', fontSize: '14px' }}>{verificationError}</p>
                    )}
                    {verificationResult && (
                      <div style={{ marginTop: '16px', padding: '16px', background: '#0d0d1a', borderRadius: '8px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                          <div><span style={{ color: '#999', fontSize: '12px' }}>Registered Name</span><p style={{ color: '#fff', margin: '4px 0 0' }}>{verificationResult.registered_name}</p></div>
                          <div><span style={{ color: '#999', fontSize: '12px' }}>Sire</span><p style={{ color: '#fff', margin: '4px 0 0' }}>{verificationResult.sire?.name || 'Unknown'}</p></div>
                          <div><span style={{ color: '#999', fontSize: '12px' }}>Dam</span><p style={{ color: '#fff', margin: '4px 0 0' }}>{verificationResult.dam?.name || 'Unknown'}</p></div>
                          <div><span style={{ color: '#999', fontSize: '12px' }}>HD (Hips)</span><p style={{ color: verificationResult.hd_score ? '#4ade80' : '#999', margin: '4px 0 0', fontWeight: 'bold' }}>{verificationResult.hd_score || 'Not tested'}</p></div>
                          <div><span style={{ color: '#999', fontSize: '12px' }}>ED (Elbows)</span><p style={{ color: verificationResult.ed_score ? '#4ade80' : '#999', margin: '4px 0 0', fontWeight: 'bold' }}>{verificationResult.ed_score || 'Not tested'}</p></div>
                          <div><span style={{ color: '#999', fontSize: '12px' }}>DSRA</span><p style={{ color: verificationResult.dsra_certified ? '#4ade80' : '#999', margin: '4px 0 0', fontWeight: 'bold' }}>{verificationResult.dsra_result || 'Not tested'}</p></div>
                          <div><span style={{ color: '#999', fontSize: '12px' }}>Color</span><p style={{ color: '#fff', margin: '4px 0 0' }}>{verificationResult.color || 'Unknown'}</p></div>
                          <div><span style={{ color: '#999', fontSize: '12px' }}>Inbreeding</span><p style={{ color: '#fff', margin: '4px 0 0' }}>{verificationResult.inbreeding_coefficient ? verificationResult.inbreeding_coefficient.toFixed(2) + '%' : 'Unknown'}</p></div>
                        </div>
                        <p style={{ color: '#4ade80', marginTop: '16px', fontSize: '13px' }}>✅ Verified from canecorsopedigree.com at {new Date(verificationResult.verified_at).toLocaleString()}</p>
                        {!saved ? (
                          <button
                            onClick={handleSaveVerification}
                            disabled={saving}
                            style={{
                              marginTop: '16px',
                              padding: '10px 24px',
                              background: saving ? '#555' : 'linear-gradient(135deg, #4ade80, #22c55e)',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '8px',
                              cursor: saving ? 'not-allowed' : 'pointer',
                              fontWeight: 'bold',
                              fontSize: '14px'
                            }}
                          >
                            {saving ? 'Saving...' : '💾 Save to Profile'}
                          </button>
                        ) : (
                          <p style={{ color: '#4ade80', marginTop: '16px', fontWeight: 'bold' }}>✅ Verified data saved to profile!</p>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {healthTests.map((test, index) => (
                <HealthTestCard key={index} test={test} />
              ))}
            </div>
          </div>
          
          {pedigree.length > 0 && (
            <div data-testid="pedigree-section">
              <h2 
                className="text-3xl font-bold text-white mb-6"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                Pedigree
              </h2>
              <div className="bg-[#1E3A5F]/40 backdrop-blur-md border border-white/10 rounded-xl p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-1 flex items-center justify-center">
                    <div className="text-center bg-[#0A1628] rounded-xl p-6 w-full border border-[#C5A55A]/50">
                      <div className="w-20 h-20 rounded-full bg-[#C5A55A] flex items-center justify-center text-[#0A1628] font-bold text-2xl mx-auto mb-3">
                        {dog.registered_name?.charAt(0) || '?'}
                      </div>
                      <h3 className="font-bold text-white text-lg mb-1">{dog.registered_name}</h3>
                      <p className="text-xs text-slate-400">{dog.registration_number}</p>
                    </div>
                  </div>
                  
                  <div className="md:col-span-2 space-y-4">
                    {pedigree.map((row, idx) => {
                      const isSire = row.position?.toLowerCase() === 'sire';
                      const isDam = row.position?.toLowerCase() === 'dam';
                      return (
                        <div 
                          key={row.id || idx} 
                          className="bg-[#0A1628] rounded-xl p-6 border border-white/10" 
                          data-testid={`pedigree-${row.position || 'ancestor'}-${idx}`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <div className={`w-3 h-3 rounded-full ${isSire ? 'bg-[#3498DB]' : isDam ? 'bg-[#E91E63]' : 'bg-[#C5A55A]'}`}></div>
                            <span className="text-sm text-slate-400 uppercase tracking-wider">
                              {row.position || 'Ancestor'}
                            </span>
                            {row.source && (
                              <span className="text-xs text-green-400 ml-2">✓ Verified</span>
                            )}
                          </div>
                          <h4 className="font-semibold text-white text-lg mb-1">{row.ancestor_name}</h4>
                          {row.ancestor_registration && (
                            <p className="text-xs text-slate-400">{row.ancestor_registration}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                <div className="mt-6 text-center">
                  <p className="text-sm text-slate-400">
                    3-generation pedigree available upon request
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default DogProfile;
