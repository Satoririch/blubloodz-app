import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Mail, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { mockBreeders } from '@/mockData';

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    
    if (email === 'breeder@test.com' && password === 'password') {
      localStorage.setItem('mockUser', 'breeder');
      localStorage.setItem('mockUserId', 'breeder-1');
      localStorage.setItem('mockUserName', mockBreeders[0].name);
      navigate('/dashboard/breeder');
    } else if (email === 'buyer@test.com' && password === 'password') {
      localStorage.setItem('mockUser', 'buyer');
      localStorage.setItem('mockUserId', 'buyer-1');
      localStorage.setItem('mockUserName', 'John Buyer');
      navigate('/search');
    } else {
      setError('Invalid credentials. Try breeder@test.com / buyer@test.com with password: password');
    }
  };
  
  return (
    <div className="min-h-screen bg-[#0A1628] flex items-center justify-center px-6" data-testid="login-page">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <Shield className="w-10 h-10 text-[#C5A55A]" />
            <span className="text-3xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
              BluBloodz
            </span>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
            Welcome Back
          </h1>
          <p className="text-slate-400">Sign in to your account to continue</p>
        </div>
        
        <div className="bg-[#1E3A5F]/40 backdrop-blur-md border border-white/10 rounded-xl p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <Label htmlFor="email" className="text-white mb-2 block">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 bg-[#0A1628] border-white/10 focus:border-[#C5A55A] text-white"
                  required
                  data-testid="password-input"
                />
              </div>
            </div>
            
            {error && (
              <div className="bg-[#E74C3C]/20 border border-[#E74C3C]/30 rounded-lg p-3 text-sm text-[#E74C3C]" data-testid="error-message">
                {error}
              </div>
            )}
            
            <Button
              type="submit"
              className="w-full bg-[#C5A55A] text-[#0A1628] hover:bg-[#D4B66A] font-medium gold-glow"
              data-testid="login-submit-button"
            >
              Sign In
            </Button>
          </form>
          
          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-center text-slate-400 text-sm">
              Don't have an account?{' '}
              <Link to="/signup/breeder" className="text-[#C5A55A] hover:underline" data-testid="signup-link">
                Sign up as Breeder
              </Link>
              {' or '}
              <Link to="/signup/buyer" className="text-[#C5A55A] hover:underline">
                Buyer
              </Link>
            </p>
          </div>
          
          <div className="mt-4 p-4 bg-[#0A1628] rounded-lg">
            <p className="text-xs text-slate-400 mb-2">Demo Credentials:</p>
            <p className="text-xs text-slate-300">Breeder: breeder@test.com / password</p>
            <p className="text-xs text-slate-300">Buyer: buyer@test.com / password</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;