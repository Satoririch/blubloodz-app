import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Package } from 'lucide-react';
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

const FieldGroup = ({ label, required, children }) => (
  <div>
    <Label className="text-white mb-2 block">
      {label} {required && <span className="text-red-400">*</span>}
    </Label>
    {children}
  </div>
);

const AddLitterPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [maleDogs, setMaleDogs] = useState([]);
  const [femaleDogs, setFemaleDogs] = useState([]);
  const [dogsLoading, setDogsLoading] = useState(true);

  const [formData, setFormData] = useState({
    breed: '',
    sire_id: 'none',
    dam_id: 'none',
    expected_date: '',
    born_date: '',
    puppy_count: '',
    available_count: '',
    price_min: '',
    price_max: '',
    description: '',
    status: 'upcoming',
  });

  // Fetch breeder's own dogs for Sire/Dam dropdowns
  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: male }, { data: female }] = await Promise.all([
        supabase
          .from('dogs')
          .select('id, registered_name')
          .eq('owner_id', user.id)
          .eq('sex', 'male'),
        supabase
          .from('dogs')
          .select('id, registered_name')
          .eq('owner_id', user.id)
          .eq('sex', 'female'),
      ]);
      setMaleDogs(male || []);
      setFemaleDogs(female || []);
      setDogsLoading(false);
    })();
  }, [user]);

  const set = (field) => (value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.breed) {
      toast.error('Please select a breed');
      return;
    }
    if (!formData.status) {
      toast.error('Please select a status');
      return;
    }

    setLoading(true);

    const payload = {
      breeder_id: user.id,
      sire_id: formData.sire_id !== 'none' ? formData.sire_id : null,
      dam_id: formData.dam_id !== 'none' ? formData.dam_id : null,
      breed: formData.breed,
      expected_date: formData.expected_date || null,
      born_date: formData.born_date || null,
      puppy_count: formData.puppy_count ? parseInt(formData.puppy_count, 10) : null,
      available_count: formData.available_count ? parseInt(formData.available_count, 10) : null,
      price_min: formData.price_min ? parseFloat(formData.price_min) : null,
      price_max: formData.price_max ? parseFloat(formData.price_max) : null,
      description: formData.description || null,
      status: formData.status,
    };

    try {
      const { error } = await supabase.from('litters').insert(payload);
      if (error) throw error;
      toast.success('Litter added successfully!');
      navigate('/dashboard/breeder');
    } catch (error) {
      console.error('Error adding litter:', error);
      toast.error(error.message || 'Failed to add litter. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'bg-[#0A1628] border-white/10 focus:border-[#C5A55A] text-white';
  const selectCls = 'bg-[#0A1628] border-white/10 text-white';

  return (
    <Layout>
      <div className="min-h-screen bg-[#0A1628] py-12 px-6">
        <div className="max-w-3xl mx-auto">
          {/* Back button */}
          <Button
            onClick={() => navigate('/dashboard/breeder')}
            variant="ghost"
            className="text-slate-300 hover:text-white mb-6"
            data-testid="back-button"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-[#C5A55A]/20 flex items-center justify-center">
                <Package className="w-5 h-5 text-[#C5A55A]" />
              </div>
              <h1
                className="text-3xl font-bold text-white"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                Add New Litter
              </h1>
            </div>
            <p className="text-slate-400 ml-13">
              Fill in the litter details to list it on BluBloodz
            </p>
          </div>

          <form onSubmit={handleSubmit} data-testid="add-litter-form">
            <div className="bg-[#1E3A5F]/40 backdrop-blur-md border border-white/10 rounded-xl p-8 space-y-8">

              {/* ── Breed & Status ── */}
              <div>
                <h2 className="text-lg font-semibold text-[#C5A55A] mb-5 pb-2 border-b border-white/10">
                  Basic Information
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <FieldGroup label="Breed" required>
                    <Select value={formData.breed} onValueChange={set('breed')}>
                      <SelectTrigger className={selectCls} data-testid="breed-select">
                        <SelectValue placeholder="Select breed" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1E3A5F] border-white/10">
                        {BREEDS.map((b) => (
                          <SelectItem key={b} value={b} className="text-white">{b}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FieldGroup>

                  <FieldGroup label="Status" required>
                    <Select value={formData.status} onValueChange={set('status')}>
                      <SelectTrigger className={selectCls} data-testid="status-select">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1E3A5F] border-white/10">
                        {STATUSES.map((s) => (
                          <SelectItem key={s.value} value={s.value} className="text-white">{s.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FieldGroup>
                </div>
              </div>

              {/* ── Sire & Dam ── */}
              <div>
                <h2 className="text-lg font-semibold text-[#C5A55A] mb-5 pb-2 border-b border-white/10">
                  Parents
                </h2>
                {dogsLoading ? (
                  <p className="text-slate-400 text-sm">Loading your dogs...</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <FieldGroup label="Sire (Father)">
                      <Select value={formData.sire_id} onValueChange={set('sire_id')}>
                        <SelectTrigger className={selectCls} data-testid="sire-select">
                          <SelectValue placeholder={maleDogs.length ? 'Select sire' : 'No male dogs yet'} />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1E3A5F] border-white/10">
                          <SelectItem value="" className="text-slate-400">None</SelectItem>
                          {maleDogs.map((d) => (
                            <SelectItem key={d.id} value={d.id} className="text-white">
                              {d.registered_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {maleDogs.length === 0 && (
                        <p className="text-xs text-slate-500 mt-1">
                          Add a male dog first to select a sire.
                        </p>
                      )}
                    </FieldGroup>

                    <FieldGroup label="Dam (Mother)">
                      <Select value={formData.dam_id} onValueChange={set('dam_id')}>
                        <SelectTrigger className={selectCls} data-testid="dam-select">
                          <SelectValue placeholder={femaleDogs.length ? 'Select dam' : 'No female dogs yet'} />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1E3A5F] border-white/10">
                          <SelectItem value="" className="text-slate-400">None</SelectItem>
                          {femaleDogs.map((d) => (
                            <SelectItem key={d.id} value={d.id} className="text-white">
                              {d.registered_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {femaleDogs.length === 0 && (
                        <p className="text-xs text-slate-500 mt-1">
                          Add a female dog first to select a dam.
                        </p>
                      )}
                    </FieldGroup>
                  </div>
                )}
              </div>

              {/* ── Dates ── */}
              <div>
                <h2 className="text-lg font-semibold text-[#C5A55A] mb-5 pb-2 border-b border-white/10">
                  Dates
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <FieldGroup label="Expected Date">
                    <Input
                      type="date"
                      name="expected_date"
                      value={formData.expected_date}
                      onChange={handleChange}
                      className={inputCls}
                      data-testid="expected-date-input"
                    />
                  </FieldGroup>

                  <FieldGroup label="Born Date (if already born)">
                    <Input
                      type="date"
                      name="born_date"
                      value={formData.born_date}
                      onChange={handleChange}
                      className={inputCls}
                      data-testid="born-date-input"
                    />
                  </FieldGroup>
                </div>
              </div>

              {/* ── Counts ── */}
              <div>
                <h2 className="text-lg font-semibold text-[#C5A55A] mb-5 pb-2 border-b border-white/10">
                  Puppies
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <FieldGroup label="Total Puppy Count">
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
                  </FieldGroup>

                  <FieldGroup label="Available Count">
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
                  </FieldGroup>
                </div>
              </div>

              {/* ── Pricing ── */}
              <div>
                <h2 className="text-lg font-semibold text-[#C5A55A] mb-5 pb-2 border-b border-white/10">
                  Pricing
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <FieldGroup label="Price Min ($)">
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
                  </FieldGroup>

                  <FieldGroup label="Price Max ($)">
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
                  </FieldGroup>
                </div>
              </div>

              {/* ── Description ── */}
              <div>
                <h2 className="text-lg font-semibold text-[#C5A55A] mb-5 pb-2 border-b border-white/10">
                  Description
                </h2>
                <FieldGroup label="Litter Description">
                  <Textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Describe the litter, health testing, temperament, what's included..."
                    className={`${inputCls} resize-none`}
                    data-testid="description-input"
                  />
                </FieldGroup>
              </div>
            </div>

            {/* Submit */}
            <div className="mt-6 flex gap-4">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-[#C5A55A] text-[#0A1628] hover:bg-[#D4B66A] font-semibold py-3"
                data-testid="add-litter-submit-button"
              >
                {loading ? 'Adding Litter...' : 'Add Litter'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/dashboard/breeder')}
                className="border-white/20 text-slate-300 hover:text-white"
                data-testid="cancel-button"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default AddLitterPage;
