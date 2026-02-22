import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, CheckCircle2, TrendingUp, Users, ArrowRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import TrustScoreGauge from '@/components/TrustScoreGauge';

const LandingPage = () => {
  const navigate = useNavigate();
  
  const features = [
    {
      icon: Shield,
      title: 'Verified Health Testing',
      description: 'Every breeder\'s health claims are cross-verified with OFA and DNA databases',
      color: '#2ECC71'
    },
    {
      icon: TrendingUp,
      title: 'Trust Score System',
      description: 'Transparent 0-100 rating based on health testing, pedigree, and breeder history',
      color: '#C5A55A'
    },
    {
      icon: Users,
      title: 'Verified Breeders Only',
      description: 'Premium breeders committed to transparency and genetic health',
      color: '#3498DB'
    },
    {
      icon: Star,
      title: 'Real Buyer Reviews',
      description: 'Authentic reviews from verified puppy buyers',
      color: '#F1C40F'
    }
  ];
  
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };
  
  return (
    <div className="min-h-screen bg-[#0A1628]" data-testid="landing-page">
      <header className="fixed top-0 left-0 right-0 z-50 glass-morphism">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-8 h-8 text-[#C5A55A]" />
            <span className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
              BluBloodz
            </span>
          </div>
          <Button
            onClick={() => navigate('/login')}
            variant="ghost"
            className="text-slate-300 hover:text-white"
            data-testid="login-button-header"
          >
            Login
          </Button>
        </div>
      </header>
      
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1688482308921-76d1645cd15a?crop=entropy&cs=srgb&fm=jpg&q=85')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        <div className="absolute inset-0 hero-gradient" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div 
            className="text-center max-w-4xl mx-auto mb-16"
            {...fadeInUp}
          >
            <h1 
              className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
              style={{ fontFamily: 'Playfair Display, serif' }}
              data-testid="hero-heading"
            >
              Trust Before You Buy.
              <br />
              <span className="text-[#C5A55A]">Verify Before You Breed.</span>
            </h1>
            <p className="text-xl text-slate-300 mb-10 leading-relaxed">
              The first marketplace where every health claim is verified. Connect with elite breeders who prove their dogs are health-tested and pedigree-confirmed.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                onClick={() => navigate('/signup/breeder')}
                size="lg"
                className="bg-[#C5A55A] text-[#0A1628] hover:bg-[#D4B66A] font-medium gold-glow text-lg px-8 py-6"
                data-testid="cta-breeder-button"
              >
                I'm a Breeder
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                onClick={() => navigate('/signup/buyer')}
                size="lg"
                variant="outline"
                className="border-2 border-[#C5A55A] text-[#C5A55A] hover:bg-[#C5A55A] hover:text-[#0A1628] font-medium text-lg px-8 py-6"
                data-testid="cta-buyer-button"
              >
                I'm a Buyer
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </motion.div>
          
          <motion.div 
            className="flex justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="bg-[#1E3A5F]/40 backdrop-blur-md border border-white/10 rounded-2xl p-8">
              <TrustScoreGauge score={94} size="large" showBreakdown={true} />
              <p className="text-center text-slate-400 text-sm mt-4">Hover to see breakdown</p>
            </div>
          </motion.div>
        </div>
      </section>
      
      <section className="py-20 px-6 bg-gradient-to-b from-[#0A1628] to-[#1E3A5F]/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 
              className="text-4xl md:text-5xl font-bold text-white mb-4"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Why BluBloodz?
            </h2>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
              The only platform that verifies health claims with real data, not just breeder promises
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  className="bg-[#1E3A5F]/40 backdrop-blur-md border border-white/10 rounded-xl p-6 hover:border-[#C5A55A]/50 transition-all card-hover group"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  data-testid={`feature-card-${index}`}
                >
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: `${feature.color}20` }}
                  >
                    <Icon className="w-6 h-6" style={{ color: feature.color }} />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-slate-300 text-sm leading-relaxed">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
      
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 
              className="text-4xl md:text-5xl font-bold text-white mb-4"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              How It Works
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Breeders Submit Health Data',
                description: 'Breeders upload OFA, DNA, and pedigree documentation for verification'
              },
              {
                step: '02',
                title: 'We Verify Everything',
                description: 'Our system cross-checks with official databases to confirm authenticity'
              },
              {
                step: '03',
                title: 'Trust Score Generated',
                description: 'Transparent 0-100 score based on verified data, not marketing claims'
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                className="relative"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <div className="text-8xl font-bold text-[#C5A55A]/10 absolute -top-8 -left-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                  {step.step}
                </div>
                <div className="relative bg-[#1E3A5F]/40 backdrop-blur-md border border-white/10 rounded-xl p-6">
                  <h3 className="text-2xl font-semibold text-white mb-3">{step.title}</h3>
                  <p className="text-slate-300 leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      <section className="py-20 px-6 bg-gradient-to-b from-[#0A1628] to-[#1E3A5F]/30">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 
              className="text-4xl md:text-5xl font-bold text-white mb-6"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Ready to Join?
            </h2>
            <p className="text-xl text-slate-300 mb-10">
              Whether you're a breeder looking to prove your reputation or a buyer seeking verified puppies, start here.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => navigate('/signup/breeder')}
                size="lg"
                className="bg-[#C5A55A] text-[#0A1628] hover:bg-[#D4B66A] font-medium gold-glow text-lg px-8 py-6"
                data-testid="cta-breeder-button-footer"
              >
                Get Verified as Breeder
              </Button>
              <Button
                onClick={() => navigate('/signup/buyer')}
                size="lg"
                variant="outline"
                className="border-2 border-[#C5A55A] text-[#C5A55A] hover:bg-[#C5A55A] hover:text-[#0A1628] font-medium text-lg px-8 py-6"
                data-testid="cta-buyer-button-footer"
              >
                Find Your Puppy
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
      
      <footer className="bg-[#1E3A5F]/20 border-t border-white/10 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-[#C5A55A]" />
            <span className="text-xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
              BluBloodz
            </span>
          </div>
          <p className="text-sm text-slate-400">
            © 2024 BluBloodz. Trust Before You Buy. Verify Before You Breed.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;