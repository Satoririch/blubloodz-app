import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import HealthTestCard from '@/components/HealthTestCard';
import { ArrowLeft, Award, Calendar, Weight, FileText, Shield } from 'lucide-react';
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
  const [pedigree, setPedigree] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [verificationError, setVerificationError] = useState(null);
  const [pedigreeId, setPedigreeId] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingType, setUploadingType] = useState(null);
  
  useEffect(() => {
    fetchDogData();
  }, [dogId]);
  
  const fetchDogData = async () => {
    try {
      setLoading(true);
      
      const { data: dogData, error: dogError } = await supabase
        .from('dogs')
        .select('*')
        .eq('id', dogId)
        .single();
      
      if (dogError) throw dogError;
      setDog(dogData);
      
      const { data: ownerData, error: ownerError } = await supabase
        .from('users')
        .select('*')
        .eq('id', dogData.owner_id)
        .single();
      
      if (ownerError) throw ownerError;
      setOwner(ownerData);
      
      const { data: healthData, error: healthError } = await supabase
        .from('health_records')
        .select('*')
        .eq('dog_id', dogId)
        .order('test_date', { ascending: false });
      
      if (healthError) throw healthError;
      setHealthRecords(healthData || []);
      
      const { data: pedigreeData, error: pedigreeError } = await supabase
        .from('pedigrees')
        .select('*')
        .eq('dog_id', dogId);
      
      if (!pedigreeError && pedigreeData && pedigreeData.length > 0) {
        setPedigree(pedigreeData);
      }
      
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
      return years + ' year' + (years > 1 ? 's' : '');
    }
    return months + ' month' + (months > 1 ? 's' : '');
  };
  
  const getTrustScoreInfo = (score) => {
    if (!score || score === 0) return { label: 'Unverified', color: '#E74C3C', tier: null };
    if (score >= 80) return { label: 'Gold Verified', color: '#C5A55A', tier: 'gold' };
    if (score >= 60) return { label: 'Silver Verified', color: '#94A3B8', tier: 'silver' };
    if (score >= 40) return { label: 'Bronze Verified', color: '#CD7F32', tier: 'bronze' };
    return { label: 'Getting Started', color: '#F1C40F', tier: null };
  };

  const formatHealthTests = () => {
    const categories = [
      { type: 'OFA Hips', label: 'Hip Evaluation (OFA)' },
      { type: 'PennHIP', label: 'Hip Evaluation (PennHIP)' },
      { type: 'Deworming', label: 'Deworming Records' },
      { type: 'Vaccinations', label: 'Vaccination Records' }
    ];
    
    return categories.map(function(cat) {
      var record = healthRecords.find(function(r) { return r.test_type === cat.type; });
      
      if (record) {
        return {
          name: cat.label,
          testType: cat.type,
          status: record.verified ? 'verified' : 'uploaded',
          result: record.result || 'Documented',
          date: record.test_date,
          source: record.source,
          documentUrl: record.document_url
        };
      }
      
      return {
        name: cat.label,
        testType: cat.type,
        status: 'missing',
        result: 'Not Done',
        date: null,
        source: null,
        documentUrl: null
      };
    });
  };

  const handleHealthUpload = async (testLabel, file) => {
    if (!file || !dog || !user) return;

    var labelToType = {
      'Hip Evaluation (OFA)': 'OFA Hips',
      'Hip Evaluation (PennHIP)': 'PennHIP',
      'Deworming Records': 'Deworming',
      'Vaccination Records': 'Vaccinations'
    };
    var testType = labelToType[testLabel];
    if (!testType) return;

    setUploading(true);
    setUploadingType(testType);

    try {
      var fileExt = file.name.split('.').pop();
      var fileName = dog.id + '/' + testType.replace(/\s+/g, '-').toLowerCase() + '-' + Date.now() + '.' + fileExt;
      
      var uploadResult = await supabase
        .storage
        .from('health-docs')
        .upload(fileName, file);

      if (uploadResult.error) throw uploadResult.error;

      var urlResult = supabase
        .storage
        .from('health-docs')
        .getPublicUrl(fileName);

      var publicUrl = urlResult.data.publicUrl;

      var existingRecord = healthRecords.find(function(r) { return r.test_type === testType; });

      if (existingRecord) {
        var updateResult = await supabase
          .from('health_records')
          .update({
            document_url: publicUrl,
            test_date: new Date().toISOString().split('T')[0],
            source: 'breeder_upload',
            result: 'Documented'
          })
          .eq('id', existingRecord.id);

        if (updateResult.error) throw updateResult.error;
      } else {
        var insertResult = await supabase
          .from('health_records')
          .insert({
            dog_id: dog.id,
            test_type: testType,
            result: 'Documented',
            test_date: new Date().toISOString().split('T')[0],
            source: 'breeder_upload',
            verified: false,
            document_url: publicUrl
          });

        if (insertResult.error) throw insertResult.error;
      }

      await recalculateTrustScore();
      await fetchDogData();

    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed: ' + (error.message || 'Unknown error'));
    } finally {
      setUploading(false);
      setUploadingType(null);
    }
  };

  const recalculateTrustScore = async () => {
    var score = 0;

    var pedResult = await supabase
      .from('pedigrees')
      .select('position')
      .eq('dog_id', dogId);

    if (pedResult.data && pedResult.data.length > 0) {
      var hasSire = pedResult.data.some(function(p) { return p.position === 'sire'; });
      var hasDam = pedResult.data.some(function(p) { return p.position === 'dam'; });
      if (hasSire) score += 20;
      if (hasDam) score += 20;
    }

    var hrResult = await supabase
      .from('health_records')
      .select('test_type')
      .eq('dog_id', dogId);

    if (hrResult.data && hrResult.data.length > 0) {
      var types = hrResult.data.map(function(r) { return r.test_type; });
      if (types.includes('OFA Hips') || types.includes('PennHIP')) score += 25;
      if (types.includes('Deworming')) score += 20;
      if (types.includes('Vaccinations')) score += 15;
    }

    score = Math.min(score, 100);

    await supabase
      .from('dogs')
      .update({ trust_score: score })
      .eq('id', dogId);
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
      var response = await fetch(
        'https://blubloodz-scraper.vercel.app/api/verify-pedigree?id=' + encodeURIComponent(pedigreeId.trim())
      );
      var data = await response.json();
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
      var supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
      var supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
      var session = await supabase.auth.getSession();
      var token = session.data.session.access_token;
      var headers = {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': 'Bearer ' + token,
        'Prefer': 'return=minimal'
      };

      var pedigreeRows = [];
      if (verificationResult.sire && verificationResult.sire.name) {
        pedigreeRows.push({
          dog_id: dog.id,
          ancestor_name: verificationResult.sire.name,
          ancestor_registration: verificationResult.pedigree_number || null,
          generation: 1,
          position: 'sire',
          titles: verificationResult.titles || null,
          source: 'canecorsopedigree.com'
        });
      }
      if (verificationResult.dam && verificationResult.dam.name) {
        pedigreeRows.push({
          dog_id: dog.id,
          ancestor_name: verificationResult.dam.name,
          ancestor_registration: null,
          generation: 1,
          position: 'dam',
          titles: null,
          source: 'canecorsopedigree.com'
        });
      }

      if (pedigreeRows.length > 0) {
        var pedigreeRes = await fetch(supabaseUrl + '/rest/v1/pedigrees', {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(pedigreeRows)
        });
        if (!pedigreeRes.ok) {
          var errText = await pedigreeRes.text();
          setVerificationError('Pedigree save failed: ' + errText);
          setSaving(false);
          return;
        }
      }

      await recalculateTrustScore();
      await fetchDogData();

      setSaved(true);
    } catch (err) {
      setVerificationError('Save failed: ' + (err.message || 'Unknown error'));
    }
    setSaving(false);
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
  
  var trustInfo = getTrustScoreInfo(dog.trust_score);
  var healthTests = formatHealthTests();
  var isOwner = user && user.id === dog.owner_id;

  var verifiedCount = healthTests.filter(function(t) { return t.status !== 'missing'; }).length;
  var hasPedigree = pedigree && pedigree.length > 0;
  var totalChecks = 5;
  var completedChecks = (hasPedigree ? Math.min(pedigree.length, 2) : 0) + verifiedCount;

  var scoreChecks = [
    { label: 'Sire', pts: 20, done: hasPedigree && pedigree.some(function(p) { return p.position === 'sire'; }) },
    { label: 'Dam', pts: 20, done: hasPedigree && pedigree.some(function(p) { return p.position === 'dam'; }) },
    { label: 'Hips', pts: 25, done: healthRecords.some(function(r) { return r.test_type === 'OFA Hips' || r.test_type === 'PennHIP'; }) },
    { label: 'Deworming', pts: 20, done: healthRecords.some(function(r) { return r.test_type === 'Deworming'; }) },
    { label: 'Shots', pts: 15, done: healthRecords.some(function(r) { return r.test_type === 'Vaccinations'; }) }
  ];
  
  return (
    <Layout>
      <div className="min-h-screen bg-[#0A1628] py-12 px-6" data-testid="dog-profile-page">
        <div className="max-w-7xl mx-auto">
          <Button
            onClick={function() { navigate(-1); }}
            variant="ghost"
            className="text-slate-300 hover:text-white mb-6"
            data-testid="back-button"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <div 
            className="mb-8 rounded-xl p-6 border"
            style={{ 
              background: 'linear-gradient(135deg, ' + trustInfo.color + '15, ' + trustInfo.color + '05)',
              borderColor: trustInfo.color + '40'
            }}
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div 
                  className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold"
                  style={{ 
                    background: 'linear-gradient(135deg, ' + trustInfo.color + ', ' + trustInfo.color + '80)',
                    color: '#0A1628'
                  }}
                >
                  {dog.trust_score || 0}
                </div>
                <div>
                  <h3 className="text-white text-xl font-bold">{trustInfo.label}</h3>
                  <p className="text-slate-400 text-sm">
                    {completedChecks} of {totalChecks} verification checks completed
                  </p>
                </div>
              </div>
              
              <div className="w-full md:w-64">
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Trust Score</span>
                  <span>{dog.trust_score || 0}/100</span>
                </div>
                <div className="w-full bg-[#0A1628] rounded-full h-3 overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ 
                      width: (dog.trust_score || 0) + '%',
                      background: 'linear-gradient(90deg, ' + trustInfo.color + ', ' + trustInfo.color + 'CC)'
                    }}
                  />
                </div>
                {isOwner && dog.trust_score < 100 && (
                  <p className="text-xs mt-2" style={{ color: trustInfo.color }}>
                    Upload health records below to increase your score
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4 pt-4 border-t" style={{ borderColor: trustInfo.color + '20' }}>
              {scoreChecks.map(function(item, i) {
                return (
                  <div key={i} className="text-center">
                    <div className={'text-xs font-medium mb-1 ' + (item.done ? 'text-[#2ECC71]' : 'text-slate-500')}>
                      {item.done ? '\u2713' : '\u25CB'} {item.label}
                    </div>
                    <div className={'text-xs ' + (item.done ? 'text-[#2ECC71]' : 'text-slate-600')}>
                      {item.done ? '+' + item.pts + ' pts' : item.pts + ' pts available'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

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
                    {dog.registered_name ? dog.registered_name.charAt(0) : '?'}
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
                    onClick={function() { navigate('/breeder/' + owner.id); }}
                    className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                    data-testid="breeder-link"
                  >
                    <div className="w-12 h-12 rounded-full bg-[#C5A55A] flex items-center justify-center text-[#0A1628] font-bold text-xl">
                      {owner.kennel_name ? owner.kennel_name.charAt(0) : (owner.full_name ? owner.full_name.charAt(0) : '?')}
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
              className="text-3xl font-bold text-white mb-2 flex items-center gap-2"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              <Shield className="w-8 h-8 text-[#C5A55A]" />
              Health Verification
            </h2>
            <p className="text-slate-400 mb-6">
              {isOwner 
                ? "Upload your dog's health records to build trust and increase your verification score."
                : 'Verified health records for this dog. Documents uploaded by the breeder.'
              }
            </p>

            {isOwner && (
              <div style={{ marginBottom: '1rem', padding: '1rem', background: 'rgba(197,165,90,0.1)', borderRadius: '0.75rem', border: '1px solid rgba(197,165,90,0.2)' }}>
                <p className="text-sm text-[#C5A55A]">
                  <strong>Tip:</strong> Upload OFA hip results, deworming records, and vaccination documents to maximize your trust score. Accepted formats: images and PDFs.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {healthTests.map(function(test, index) {
                return (
                  <HealthTestCard
                    key={index}
                    test={test}
                    isOwner={isOwner}
                    onUpload={handleHealthUpload}
                    uploading={uploading && uploadingType === test.testType}
                  />
                );
              })}
            </div>
          </div>

          {isOwner && (
            <div className="mb-8">
              <h2 
                className="text-3xl font-bold text-white mb-2 flex items-center gap-2"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                <Award className="w-8 h-8 text-[#C5A55A]" />
                Pedigree Verification
              </h2>
              
              {hasPedigree ? (
                <div className="bg-[#1E3A5F]/40 backdrop-blur-md border border-[#2ECC71]/30 rounded-xl p-6">
                  <div className="flex items-center gap-2 text-[#2ECC71] mb-3">
                    <span className="text-lg">{'\u2713'}</span>
                    <span className="font-medium">Pedigree verified from canecorsopedigree.com</span>
                  </div>
                  {pedigree.map(function(p, i) {
                    return (
                      <p key={i} className="text-slate-300 text-sm">
                        {p.position === 'sire' ? 'Sire' : 'Dam'}: <span className="text-white font-medium">{p.ancestor_name}</span>
                      </p>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-[#1E3A5F]/40 backdrop-blur-md border border-white/10 rounded-xl p-6">
                  <p className="text-slate-400 mb-4">
                    Enter your dog's ID from canecorsopedigree.com to verify lineage and earn trust points.
                  </p>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={pedigreeId}
                      onChange={function(e) { setPedigreeId(e.target.value); }}
                      placeholder="Enter Pedigree Database ID (e.g., 123456)"
                      className="flex-1 bg-[#0A1628] border border-white/20 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:border-[#C5A55A] focus:outline-none"
                    />
                    <Button
                      onClick={handleVerifyPedigree}
                      disabled={verifying}
                      className="bg-[#C5A55A] hover:bg-[#b8962d] text-[#0A1628] font-medium px-6"
                    >
                      {verifying ? 'Verifying...' : 'Verify'}
                    </Button>
                  </div>
                  
                  {verificationError && (
                    <p className="text-red-400 text-sm mt-3">{verificationError}</p>
                  )}
                  
                  {verificationResult && !saved && (
                    <div className="mt-4 p-4 bg-[#0A1628] rounded-lg border border-[#C5A55A]/30">
                      <h4 className="text-white font-medium mb-2">Verification Result:</h4>
                      <p className="text-slate-300 text-sm">Name: <span className="text-white">{verificationResult.name}</span></p>
                      {verificationResult.sire && (
                        <p className="text-slate-300 text-sm">Sire: <span className="text-white">{verificationResult.sire.name}</span></p>
                      )}
                      {verificationResult.dam && (
                        <p className="text-slate-300 text-sm">Dam: <span className="text-white">{verificationResult.dam.name}</span></p>
                      )}
                      {verificationResult.titles && (
                        <p className="text-slate-300 text-sm">Titles: <span className="text-white">{verificationResult.titles}</span></p>
                      )}
                      <Button
                        onClick={handleSaveVerification}
                        disabled={saving}
                        className="mt-3 bg-[#2ECC71] hover:bg-[#27AE60] text-white font-medium"
                      >
                        {saving ? 'Saving...' : 'Save to Profile'}
                      </Button>
                    </div>
                  )}
                  
                  {saved && (
                    <div className="mt-4 p-4 bg-[#2ECC71]/10 rounded-lg border border-[#2ECC71]/30">
                      <p className="text-[#2ECC71] font-medium">{'\u2713'} Pedigree saved and trust score updated!</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </Layout>
  );
};

export default DogProfile;
