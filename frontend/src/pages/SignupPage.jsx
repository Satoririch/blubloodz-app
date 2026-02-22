import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Shield, Mail, Lock, User, MapPin, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const SignupPage = () => {
  const navigate = useNavigate();
  const { userType } = useParams();
  const { signUp } = useAuth();
  const isBreeder = userType === 'breeder';
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    location: '',
    kennel_name: '',
  });
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await signUp(formData.email, formData.password, {
        full_name: formData.full_name,
        kennel_name: isBreeder ? formData.kennel_name : null,
        location: formData.location,
        role: isBreeder ? 'breeder' : 'buyer'
      });

      toast.success('Welcome to BluBloodz! Your account is ready.');
      navigate(isBreeder ? '/dashboard/breeder' : '/search');
    } catch (error) {
      toast.error(error.message || 'Failed to create account');
    } finally {
      setLoading(false);
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
              <Label htmlFor="full_name" className="text-white mb-2 block">
                Full Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="full_name"
                  name="full_name"
                  type="text"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="pl-10 bg-[#0A1628] border-white/10 focus:border-[#C5A55A] text-white"
                  required
                  data-testid="name-input"
                />
              </div>
            </div>
            
            {isBreeder && (
              <div>
                <Label htmlFor="kennel_name" className="text-white mb-2 block">
                  Kennel/Business Name (Optional)
                </Label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="kennel_name"
                    name="kennel_name"
                    type="text"
                    value={formData.kennel_name}
                    onChange={handleChange}
                    placeholder="Elite Kennels"
                    className="pl-10 bg-[#0A1628] border-white/10 focus:border-[#C5A55A] text-white"
                    data-testid="kennel-input"
                  />
                </div>
              </div>
            )}
            
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
                  minLength={6}
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
            
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#C5A55A] text-[#0A1628] hover:bg-[#D4B66A] font-medium gold-glow"
              data-testid="signup-submit-button"
            >
              {loading ? 'Creating account...' : 'Create Account'}
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