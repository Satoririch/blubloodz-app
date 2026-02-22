import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Shield, Mail, Lock, User, MapPin, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const SignupPage = () => {
  const navigate = useNavigate();
  const { userType } = useParams();
  const isBreeder = userType === 'breeder';
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    location: '',
    breeds: ''
  });
  
  const handleSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem('mockUser', userType);
    localStorage.setItem('mockUserId', `${userType}-${Date.now()}`);
    localStorage.setItem('mockUserName', formData.name);
    
    if (isBreeder) {
      navigate('/dashboard/breeder');
    } else {
      navigate('/search');
    }
  };
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  return (
    <div className="min-h-screen bg-[#0A1628] flex items-center justify-center px-6 py-12" data-testid="signup-page">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <Shield className="w-10 h-10 text-[#C5A55A]" />
            <span className="text-3xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
              BluBloodz
            </span>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
            {isBreeder ? 'Join as a Breeder' : 'Join as a Buyer'}
          </h1>
          <p className="text-slate-400">
            {isBreeder 
              ? 'Get verified and showcase your health-tested dogs' 
              : 'Find verified breeders and healthy puppies'
            }
          </p>
        </div>
        
        <div className="bg-[#1E3A5F]/40 backdrop-blur-md border border-white/10 rounded-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="name" className="text-white mb-2 block">
                {isBreeder ? 'Kennel/Business Name' : 'Full Name'}
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder={isBreeder ? 'Elite Kennels' : 'John Doe'}
                  className="pl-10 bg-[#0A1628] border-white/10 focus:border-[#C5A55A] text-white"
                  required
                  data-testid="name-input"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="email" className="text-white mb-2 block">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  className="pl-10 bg-[#0A1628] border-white/10 focus:border-[#C5A55A] text-white"
                  required
                  data-testid="email-input"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="password" className="text-white mb-2 block">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="pl-10 bg-[#0A1628] border-white/10 focus:border-[#C5A55A] text-white"
                  required
                  data-testid="password-input"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="location" className="text-white mb-2 block">Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="location"
                  name="location"
                  type="text"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Austin, TX"
                  className="pl-10 bg-[#0A1628] border-white/10 focus:border-[#C5A55A] text-white"
                  required
                  data-testid="location-input"
                />
              </div>
            </div>
            
            {isBreeder && (
              <div>
                <Label htmlFor="breeds" className="text-white mb-2 block">Breeds You Work With</Label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="breeds"
                    name="breeds"
                    type="text"
                    value={formData.breeds}
                    onChange={handleChange}
                    placeholder="Cane Corso, French Bulldog"
                    className="pl-10 bg-[#0A1628] border-white/10 focus:border-[#C5A55A] text-white"
                    required
                    data-testid="breeds-input"
                  />
                </div>
              </div>
            )}
            
            <Button
              type="submit"
              className="w-full bg-[#C5A55A] text-[#0A1628] hover:bg-[#D4B66A] font-medium gold-glow"
              data-testid="signup-submit-button"
            >
              Create Account
            </Button>
          </form>
          
          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-center text-slate-400 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-[#C5A55A] hover:underline" data-testid="login-link">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;