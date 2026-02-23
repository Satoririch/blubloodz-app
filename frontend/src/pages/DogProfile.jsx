import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import HealthTestCard from '@/components/HealthTestCard';
import { ArrowLeft, Award, Calendar, Weight, FileText } from 'lucide-react';
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
      
      // Fetch pedigree
      const { data: pedigreeData, error: pedigreeError } = await supabase
        .from('pedigrees')
        .select('*')
        .eq('dog_id', dogId)
        .single();
      
      if (!pedigreeError && pedigreeData) {
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
              
              {badge && (
                <div className="mb-6">
                  <span 
                    className="inline-block px-4 py-2 rounded-full text-lg font-semibold border-2"
                    style={{ 
                      color: badge.color, 
                      borderColor: badge.color,
                      backgroundColor: badge.color + '20'
                    }}
                  >
                    {badge.text}
                  </span>
                </div>
              )}
              
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {healthTests.map((test, index) => (
                <HealthTestCard key={index} test={test} />
              ))}
            </div>
          </div>
          
          {pedigree && (
            <div>
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
                    {pedigree.sire_name && (
                      <div className="bg-[#0A1628] rounded-xl p-6 border border-white/10">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-3 h-3 rounded-full bg-[#3498DB]"></div>
                          <span className="text-sm text-slate-400 uppercase tracking-wider">Sire</span>
                        </div>
                        <h4 className="font-semibold text-white text-lg mb-1">{pedigree.sire_name}</h4>
                        {pedigree.sire_registration && (
                          <p className="text-xs text-slate-400">{pedigree.sire_registration}</p>
                        )}
                      </div>
                    )}
                    
                    {pedigree.dam_name && (
                      <div className="bg-[#0A1628] rounded-xl p-6 border border-white/10">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-3 h-3 rounded-full bg-[#E91E63]"></div>
                          <span className="text-sm text-slate-400 uppercase tracking-wider">Dam</span>
                        </div>
                        <h4 className="font-semibold text-white text-lg mb-1">{pedigree.dam_name}</h4>
                        {pedigree.dam_registration && (
                          <p className="text-xs text-slate-400">{pedigree.dam_registration}</p>
                        )}
                      </div>
                    )}
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
