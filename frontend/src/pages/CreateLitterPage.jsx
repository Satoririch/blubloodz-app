import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, ArrowRight, Package, Check } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const BREEDS = [
  'Cane Corso', 'French Bulldog', 'American Bully', 'Exotic Bully',
  'Doodle', 'Rottweiler', 'Doberman', 'Belgian Malinois',
  'German Shepherd', 'English Bulldog', 'Pitbull', 'Other'
];

const STATUSES = [
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'available', label: 'Available' },
  { value: 'sold', label: 'Sold' },
];

const CreateLitterPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [dogs, setDogs] = useState([]);
  const [dogsLoading, setDogsLoading] = useState(true);
  const [selectedSire, setSelectedSire] = useState(null);
  const [selectedDam, setSelectedDam] = useState(null);

  const [formData, setFormData] = useState({
    breed: '',
    expected_date: '',
    born_date: '',
    puppy_count: '',
    available_count: '',
    price_min: '',
    price_max: '',
    description: '',
    status: 'upcoming',
  });

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from('dogs')
        .select('id, registered_name, call_name, breed, sex, registration_number, trust_score, image_url')
        .eq('owner_id', user.id);
      setDogs(data || []);
      setDogsLoading(false);
    })();
  }, [user]);

  const maleDogs = dogs.filter(d => d.sex === 'male');
  const femaleDogs = dogs.filter(d => d.sex === 'female');

  const handleSireSelect = (dogId) => {
    const dog = dogs.find(d => d.id === dogId);
    setSelectedSire(dog);
    if (dog?.breed && !formData.breed) {
      setFormData(prev => ({ ...prev, breed: dog.breed }));
    }
  };

  const handleDamSelect = (dogId) => {
    const dog = dogs.find(d => d.id === dogId);
    setSelectedDam(dog);
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const set = (field) => (value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.breed) {
      toast.error('Please select a breed');
      return;
    }

    setLoading(true);

    // Check if both parents have registration numbers for papers_verified
    const papersVerified = !!(selectedSire?.registration_number && selectedDam?.registration_number);

    // Check if both parents have health records for health_checked
    let healthChecked = false;
    if (selectedSire && selectedDam) {
      const [{ data: sireHealth }, { data: damHealth }] = await Promise.all([
        supabase.from('health_records').select('id').eq('dog_id', selectedSire.id).limit(1),
        supabase.from('health_records').select('id').eq('dog_id', selectedDam.id).limit(1),
      ]);
      healthChecked = (sireHealth?.length > 0) && (damHealth?.length > 0);
    }

    const payload = {
      breeder_id: user.id,
      sire_id: selectedSire?.id || null,
      dam_id: selectedDam?.id || null,
      breed: formData.breed,
      expected_date: formData.expected_date || null,
      born_date: formData.born_date || null,
      puppy_count: formData.puppy_count ? parseInt(formData.puppy_count, 10) : null,
      available_count: formData.available_count ? parseInt(formData.available_count, 10) : null,
      price_min: formData.price_min ? parseFloat(formData.price_min) : null,
      price_max: formData.price_max ? parseFloat(formData.price_max) : null,
      description: formData.description || null,
      status: formData.status,
      papers_verified: papersVerified,
      health_checked: healthChecked,
    };

    try {
      const { data, error } = await supabase.from('litters').insert(payload).select().single();
      if (error) throw error;
      toast.success('Litter created successfully!');
      navigate(`/litter/${data.id}`);
    } catch (error) {
      console.error('Error creating litter:', error);
      toast.error(error.message || 'Failed to create litter');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'bg-[#0A1628] border-white/10 focus:border-[#C5A55A] text-white';
  const selectCls = 'bg-[#0A1628] border-white/10 text-white';

  const DogCard = ({ dog, selected, onSelect }) => (
    <div
      onClick={() => onSelect(dog.id)}
      className={`cursor-pointer p-4 rounded-xl border transition-all ${
        selected?.id === dog.id
          ? 'border-[#C5A55A] bg-[#C5A55A]/10'
          : 'border-white/10 bg-[#0A1628] hover:border-white/30'
      }`}
      data-testid={`dog-card-${dog.id}`}
    >
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-[#1E3A5F] flex items-center justify-center overflow-hidden">
          {dog.image_url ? (
            <img src={dog.image_url} alt={dog.registered_name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl font-bold text-[#C5A55A]">
              {dog.registered_name?.charAt(0) || '?'}
            </span>
          )}
        </div>
        <div className="flex-1">
          <h4 className="text-white font-semibold">{dog.call_name || dog.registered_name}</h4>
          <p className="text-slate-400 text-sm">{dog.breed}</p>
          {dog.registration_number && (
            <p className="text-xs text-[#2ECC71] mt-1">✓ Registered</p>
          )}
        </div>
        {selected?.id === dog.id && (
          <div className="w-8 h-8 rounded-full bg-[#C5A55A] flex items-center justify-center">
            <Check className="w-5 h-5 text-[#0A1628]" />
          </div>
        )}
      </div>
    </div>
  );

  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-8">
      {[1, 2, 3].map((s) => (
        <React.Fragment key={s}>
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
              step === s
                ? 'bg-[#C5A55A] text-[#0A1628]'
                : step > s
                ? 'bg-[#2ECC71] text-white'
                : 'bg-[#1E3A5F] text-slate-400'
            }`}
          >
            {step > s ? <Check className="w-5 h-5" /> : s}
          </div>
          {s < 3 && (
            <div className={`w-16 h-1 rounded ${step > s ? 'bg-[#2ECC71]' : 'bg-[#1E3A5F]'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <Layout>
      <div className="min-h-screen bg-[#0A1628] py-12 px-6" data-testid="create-litter-page">
        <div className="max-w-3xl mx-auto">
          <Button
            onClick={() => navigate('/dashboard/breeder')}
            variant="ghost"
            className="text-slate-300 hover:text-white mb-6"
            data-testid="back-button"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          <div className="mb-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-[#C5A55A]/20 flex items-center justify-center">
                <Package className="w-5 h-5 text-[#C5A55A]" />
              </div>
              <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                Create New Litter
              </h1>
            </div>
            <p className="text-slate-400">List your litter on BluBloodz marketplace</p>
          </div>

          <StepIndicator />

          <div className="bg-[#1E3A5F]/40 backdrop-blur-md border border-white/10 rounded-xl p-8">
            {/* Step 1: Select Sire */}
            {step === 1 && (
              <div data-testid="step-1">
                <h2 className="text-xl font-semibold text-[#C5A55A] mb-6">Step 1: Select Sire (Father)</h2>
                {dogsLoading ? (
                  <p className="text-slate-400">Loading your dogs...</p>
                ) : maleDogs.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-slate-400 mb-4">You haven't added any male dogs yet.</p>
                    <Button
                      onClick={() => navigate('/dog/add')}
                      className="bg-[#C5A55A] text-[#0A1628] hover:bg-[#D4B66A]"
                    >
                      Add a Dog First
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {maleDogs.map(dog => (
                      <DogCard key={dog.id} dog={dog} selected={selectedSire} onSelect={handleSireSelect} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Select Dam */}
            {step === 2 && (
              <div data-testid="step-2">
                <h2 className="text-xl font-semibold text-[#C5A55A] mb-6">Step 2: Select Dam (Mother)</h2>
                {femaleDogs.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-slate-400 mb-4">You haven't added any female dogs yet.</p>
                    <Button
                      onClick={() => navigate('/dog/add')}
                      className="bg-[#C5A55A] text-[#0A1628] hover:bg-[#D4B66A]"
                    >
                      Add a Dog First
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {femaleDogs.map(dog => (
                      <DogCard key={dog.id} dog={dog} selected={selectedDam} onSelect={handleDamSelect} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Litter Details */}
            {step === 3 && (
              <div data-testid="step-3" className="space-y-6">
                <h2 className="text-xl font-semibold text-[#C5A55A] mb-6">Step 3: Litter Details</h2>

                {/* Selected Parents Summary */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-[#0A1628] rounded-lg border border-white/10">
                  <div>
                    <p className="text-xs text-slate-400 uppercase mb-1">Sire</p>
                    <p className="text-white font-medium">{selectedSire?.registered_name || 'Not selected'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 uppercase mb-1">Dam</p>
                    <p className="text-white font-medium">{selectedDam?.registered_name || 'Not selected'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-white mb-2 block">Breed *</Label>
                    <Select value={formData.breed} onValueChange={set('breed')}>
                      <SelectTrigger className={selectCls} data-testid="breed-select">
                        <SelectValue placeholder="Select breed" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1E3A5F] border-white/10">
                        {BREEDS.map(b => (
                          <SelectItem key={b} value={b} className="text-white">{b}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-white mb-2 block">Status *</Label>
                    <Select value={formData.status} onValueChange={set('status')}>
                      <SelectTrigger className={selectCls} data-testid="status-select">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1E3A5F] border-white/10">
                        {STATUSES.map(s => (
                          <SelectItem key={s.value} value={s.value} className="text-white">{s.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-white mb-2 block">Born Date</Label>
                    <Input
                      type="date"
                      name="born_date"
                      value={formData.born_date}
                      onChange={handleChange}
                      className={inputCls}
                      data-testid="born-date-input"
                    />
                  </div>

                  <div>
                    <Label className="text-white mb-2 block">Expected Date</Label>
                    <Input
                      type="date"
                      name="expected_date"
                      value={formData.expected_date}
                      onChange={handleChange}
                      className={inputCls}
                      data-testid="expected-date-input"
                    />
                  </div>

                  <div>
                    <Label className="text-white mb-2 block">Puppy Count</Label>
                    <Input
                      type="number"
                      name="puppy_count"
                      value={formData.puppy_count}
                      onChange={handleChange}
                      min="0"
                      placeholder="e.g. 6"
                      className={inputCls}
                      data-testid="puppy-count-input"
                    />
                  </div>

                  <div>
                    <Label className="text-white mb-2 block">Available Count</Label>
                    <Input
                      type="number"
                      name="available_count"
                      value={formData.available_count}
                      onChange={handleChange}
                      min="0"
                      placeholder="e.g. 4"
                      className={inputCls}
                      data-testid="available-count-input"
                    />
                  </div>

                  <div>
                    <Label className="text-white mb-2 block">Price Min ($)</Label>
                    <Input
                      type="number"
                      name="price_min"
                      value={formData.price_min}
                      onChange={handleChange}
                      min="0"
                      placeholder="e.g. 2000"
                      className={inputCls}
                      data-testid="price-min-input"
                    />
                  </div>

                  <div>
                    <Label className="text-white mb-2 block">Price Max ($)</Label>
                    <Input
                      type="number"
                      name="price_max"
                      value={formData.price_max}
                      onChange={handleChange}
                      min="0"
                      placeholder="e.g. 3500"
                      className={inputCls}
                      data-testid="price-max-input"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-white mb-2 block">Description</Label>
                  <Textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Describe the litter, health testing, temperament, what's included..."
                    className={`${inputCls} resize-none`}
                    data-testid="description-input"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="mt-6 flex gap-4">
            {step > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(step - 1)}
                className="border-white/20 text-slate-300 hover:text-white"
                data-testid="prev-button"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
            )}
            
            <div className="flex-1" />

            {step < 3 ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={(step === 1 && !selectedSire) || (step === 2 && !selectedDam)}
                className="bg-[#C5A55A] text-[#0A1628] hover:bg-[#D4B66A]"
                data-testid="next-button"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={loading || !formData.breed}
                className="bg-[#2ECC71] text-white hover:bg-[#27AE60]"
                data-testid="submit-button"
              >
                {loading ? 'Creating...' : 'Create Litter'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CreateLitterPage;
