import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Icon from '../components/atoms/Icon';
import { authService } from '../services/auth.service';
import { useAuth } from '../context/AuthContext';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const data = await authService.register(email, password, name);
      // Registration only returns userId and tokens. 
      // We log in with these data.
      login(data.accessToken, { id: data.userId, email, name });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-background flex flex-col justify-center items-center p-6 selection:bg-primary-fixed selection:text-primary relative overflow-hidden animate-fade-in">
      
      {/* Abstract Background Emitters */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary-container/10 blur-[140px] animate-pulse"></div>
        <div className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] rounded-full bg-secondary-container/10 blur-[140px] animate-pulse delay-700"></div>
      </div>

      <main className="w-full max-w-[460px] animate-in fade-in slide-in-from-bottom-8 duration-700 pt-10 pb-20">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-12">
          <div className="w-16 h-16 bg-primary-container rounded-[2rem] flex items-center justify-center mb-8 shadow-2xl shadow-primary-container/30 transform -rotate-6 transition-transform hover:rotate-0 cursor-default">
            <Icon name="person_add" fill className="text-white text-[32px]" />
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-on-surface mb-2">Join Dialogue</h1>
          <p className="text-on-surface-variant font-bold text-sm tracking-wide opacity-80 uppercase tracking-widest">Connect with the world.</p>
        </div>

        {/* Auth Card */}
        <div className="bg-surface-container-lowest rounded-[3rem] p-12 shadow-[0_32px_64px_rgba(0,0,0,0.06)] border border-outline-variant/10 relative">
          <h2 className="text-2xl font-black text-on-surface mb-10 tracking-tight">Create account</h2>
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="p-4 bg-error-container text-on-error-container rounded-2xl text-xs font-black uppercase tracking-widest animate-shake">
                {error}
              </div>
            )}

            {/* Name Field */}
            <div className="space-y-2">
              <label className="block text-xs font-black text-on-surface-variant uppercase tracking-[0.2em] ml-2" htmlFor="name">Full Name</label>
              <div className="relative group">
                <input 
                  id="name"
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required
                  className="w-full h-16 px-6 bg-surface-container-highest border-none rounded-2xl text-on-surface font-bold placeholder:text-on-surface-variant/40 focus:ring-4 focus:ring-primary/10 transition-all duration-300 outline-none"
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-xs font-black text-on-surface-variant uppercase tracking-[0.2em] ml-2" htmlFor="email">Email Address</label>
              <div className="relative group">
                <input 
                  id="email"
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  className="w-full h-16 px-6 bg-surface-container-highest border-none rounded-2xl text-on-surface font-bold placeholder:text-on-surface-variant/40 focus:ring-4 focus:ring-primary/10 transition-all duration-300 outline-none"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="block text-xs font-black text-on-surface-variant uppercase tracking-[0.2em] ml-2" htmlFor="password">Password</label>
              <div className="relative group">
                <input 
                  id="password"
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full h-16 px-6 bg-surface-container-highest border-none rounded-2xl text-on-surface font-bold placeholder:text-on-surface-variant/40 focus:ring-4 focus:ring-primary/10 transition-all duration-300 outline-none"
                />
              </div>
            </div>

            {/* Submit Action */}
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full h-16 bg-primary-container text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 transition-all duration-200 flex items-center justify-center gap-3 mt-6"
            >
              <span>{isLoading ? 'Creating Account...' : 'Sign Up'}</span>
              {!isLoading && <Icon name="arrow_forward" className="text-[20px]" />}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-outline-variant/30"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-[0.2em] font-black">
              <span className="px-6 bg-surface-container-lowest text-on-surface-variant/60">Or join with</span>
            </div>
          </div>

          {/* Social Provider */}
          <button className="w-full h-16 bg-surface-container-low hover:bg-surface-container-high text-on-surface font-black rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 group border border-outline-variant/10">
            <svg className="w-6 h-6 transform group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span>Google Account</span>
          </button>
        </div>

        {/* Footer Links */}
        <p className="mt-10 text-center text-sm text-on-surface-variant font-bold opacity-80">
          Already have an account? 
          <Link to="/login" className="text-primary font-black hover:underline decoration-2 underline-offset-4 ml-2 transition-all">Log In</Link>
        </p>

        {/* Legal Links */}
        <div className="mt-16 flex justify-center gap-10">
          <a href="#" className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.2em] hover:text-primary transition-colors">Privacy</a>
          <a href="#" className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.2em] hover:text-primary transition-colors">Terms</a>
          <a href="#" className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.2em] hover:text-primary transition-colors">Contact</a>
        </div>
      </main>
    </div>
  );
};

export default Register;
