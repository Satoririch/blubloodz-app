import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const AddDogPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    registered_name: '',
    call_name: '',
    breed: '',
    sex: '',
    dob: '',
    color: '',
    weight: '',
    height: '',
    registration_number: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    console.log('Submitting dog data...', {
      user_id: user?.id,
      formData
    });

    const { data, error } = await supabase
      .from('dogs')
      .insert({
        owner_id: user.id,
        registered_name: formData.registered_name,
        call_name: formData.call_name || null,
        breed: formData.breed,
        sex: formData.sex,
        dob: formData.dob || null,
        color: formData.color || null,
        weight: formData.weight ? Number(formData.weight) : null,
        height: formData.height ? Number(formData.height) : null,
        registration_number: formData.registration_number || null
      })
      .select()
      .single();

    console.log('Supabase response:', { data, error });

    setLoading(false);

    if (error) {
      console.error('Supabase error details:', error);
      alert('Error adding dog: ' + error.message);
      return;
    }

    toast.success('Dog added successfully!');
    navigate('/dog/' + data.id);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <Layout>
      <div className="min-h-screen bg-[#0A1628] py-12 px-6">
        <div className="max-w-3xl mx-auto">
          <Button
            onClick={() => navigate(-1)}
            variant="ghost"
            className="text-slate-300 hover:text-white mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <h1 
            className="text-4xl font-bold text-white mb-8"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Add a Dog
          </h1>

          <div className="bg-[#1E3A5F]/40 backdrop-blur-md border border-white/10 rounded-xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="registered_name" className="text-white mb-2 block">
                    Registered Name <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="registered_name"
                    name="registered_name"
                    value={formData.registered_name}
                    onChange={handleChange}
                    className="bg-[#0A1628] border-white/10 focus:border-[#C5A55A] text-white"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="call_name" className="text-white mb-2 block">Call Name</Label>
                  <Input
                    id="call_name"
                    name="call_name"
                    value={formData.call_name}
                    onChange={handleChange}
                    className="bg-[#0A1628] border-white/10 focus:border-[#C5A55A] text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="breed" className="text-white mb-2 block">
                    Breed <span className="text-red-400">*</span>
                  </Label>
                  <Select
                    value={formData.breed}
                    onValueChange={(value) => setFormData({ ...formData, breed: value })}
                    required
                  >
                    <SelectTrigger className="bg-[#0A1628] border-white/10 text-white">
                      <SelectValue placeholder="Select breed" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1E3A5F] border-white/10">
                      <SelectItem value="Cane Corso" className="text-white">Cane Corso</SelectItem>
                      <SelectItem value="French Bulldog" className="text-white">French Bulldog</SelectItem>
                      <SelectItem value="American Bully" className="text-white">American Bully</SelectItem>
                      <SelectItem value="Exotic Bully" className="text-white">Exotic Bully</SelectItem>
                      <SelectItem value="Doodle" className="text-white">Doodle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="sex" className="text-white mb-2 block">
                    Sex <span className="text-red-400">*</span>
                  </Label>
                  <Select
                    value={formData.sex}
                    onValueChange={(value) => setFormData({ ...formData, sex: value })}
                    required
                  >
                    <SelectTrigger className="bg-[#0A1628] border-white/10 text-white">
                      <SelectValue placeholder="Select sex" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1E3A5F] border-white/10">
                      <SelectItem value="Male" className="text-white">Male</SelectItem>
                      <SelectItem value="Female" className="text-white">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="dob" className="text-white mb-2 block">Date of Birth</Label>
                  <Input
                    id="dob"
                    name="dob"
                    type="date"
                    value={formData.dob}
                    onChange={handleChange}
                    className="bg-[#0A1628] border-white/10 focus:border-[#C5A55A] text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="color" className="text-white mb-2 block">Color</Label>
                  <Input
                    id="color"
                    name="color"
                    value={formData.color}
                    onChange={handleChange}
                    className="bg-[#0A1628] border-white/10 focus:border-[#C5A55A] text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="weight" className="text-white mb-2 block">Weight (lbs)</Label>
                  <Input
                    id="weight"
                    name="weight"
                    type="number"
                    step="0.1"
                    value={formData.weight}
                    onChange={handleChange}
                    className="bg-[#0A1628] border-white/10 focus:border-[#C5A55A] text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="height" className="text-white mb-2 block">Height (inches)</Label>
                  <Input
                    id="height"
                    name="height"
                    type="number"
                    step="0.1"
                    value={formData.height}
                    onChange={handleChange}
                    className="bg-[#0A1628] border-white/10 focus:border-[#C5A55A] text-white"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="registration_number" className="text-white mb-2 block">
                    Registration Number
                  </Label>
                  <Input
                    id="registration_number"
                    name="registration_number"
                    value={formData.registration_number}
                    onChange={handleChange}
                    className="bg-[#0A1628] border-white/10 focus:border-[#C5A55A] text-white"
                    placeholder="AKC-WS78945612"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-[#C5A55A] text-[#0A1628] hover:bg-[#D4B66A] gold-glow"
                >
                  {loading ? 'Adding Dog...' : 'Add Dog'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                  className="border-white/10 text-slate-300"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AddDogPage;
