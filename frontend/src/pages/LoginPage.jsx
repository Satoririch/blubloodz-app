import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Mail, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const LoginPage = () => {
  const navigate = useNavigate();
  const { signIn, profile } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const data = await signIn(email, password);
      toast.success('Successfully logged in!');
      
      // Redirect based on role from returned session
      const role = data?.user?.user_metadata?.role;
      navigate(role === 'buyer' ? '/search' : '/dashboard/breeder');
    } catch (error) {
      let msg = error.message || 'Failed to login';
      if (msg.includes('body stream') || msg.includes('already read')) {
        msg = 'Login failed. Please check your credentials and try again.';
      } else if (msg.toLowerCase().includes('email not confirmed')) {
        msg = 'Please confirm your email before logging in. Check your inbox.';
      }
      toast.error(msg);
    } finally {
      setLoading(false);
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
            
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#C5A55A] text-[#0A1628] hover:bg-[#D4B66A] font-medium gold-glow"
              data-testid="login-submit-button"
            >
              {loading ? 'Signing in...' : 'Sign In'}
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
        </div>
      </div>
    </div>
  );
};

export default LoginPage;