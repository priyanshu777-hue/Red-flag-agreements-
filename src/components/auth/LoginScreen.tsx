import React, { useState } from 'react';
import { Lock, Mail, Shield, Sparkles, ArrowRight, Check } from 'lucide-react';
import { RedFlagLogo } from '../common/RedFlagLogo';

interface LoginScreenProps {
  onLoginSuccess: (email: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('agreements@redflaghomes.in');
  const [password, setPassword] = useState('#Redflag@123');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    setTimeout(() => {
      if (
        email.trim().toLowerCase() === 'agreements@redflaghomes.in' &&
        password === '#Redflag@123'
      ) {
        setIsLoading(false);
        onLoginSuccess(email.trim());
      } else {
        setIsLoading(false);
        setError('Invalid email or password. Use agreements@redflaghomes.in / #Redflag@123');
      }
    }, 400);
  };

  const handleDemoFill = () => {
    setEmail('agreements@redflaghomes.in');
    setPassword('#Redflag@123');
    setError('');
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-center items-center p-4 relative font-sans selection:bg-red-600 selection:text-white">
      {/* Background Subtle Gradient Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-md bg-zinc-900/90 border border-zinc-800 rounded-3xl p-8 shadow-2xl space-y-6 relative z-10 backdrop-blur-xl">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <RedFlagLogo size="lg" className="justify-center" />
          <div className="space-y-1">
            <h1 className="text-xl font-extrabold text-white tracking-tight">
              Internal Sales & Agreement Portal
            </h1>
            <p className="text-xs text-zinc-400">
              Authorized Red Flag Homes Executive Portal
            </p>
          </div>
        </div>

        {/* Demo Credentials Quick Fill Badge */}
        <div
          onClick={handleDemoFill}
          className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-red-500/50 transition-colors cursor-pointer text-left text-xs space-y-1 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-red-400 flex items-center gap-1.5">
              <Shield className="w-3 h-3 text-red-500" /> Authorized Sign-In
            </span>
            <span className="text-[10px] text-zinc-500 group-hover:text-red-300 font-mono">
              Click to Auto-fill
            </span>
          </div>
          <div className="font-mono text-zinc-300">
            Email: <strong className="text-white">agreements@redflaghomes.in</strong>
          </div>
          <div className="font-mono text-zinc-300">
            Password: <strong className="text-red-400">#Redflag@123</strong>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Official Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="agreements@redflaghomes.in"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Account Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 font-mono"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-800/60 text-xs text-red-300 font-medium text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-red-700 via-red-600 to-red-500 hover:from-red-600 hover:to-red-400 text-white font-extrabold text-xs py-3.5 rounded-xl shadow-xl shadow-red-950/80 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            {isLoading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In to Executive Portal</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-zinc-800/80">
          <p className="text-[10px] text-zinc-500 font-mono">
            Red Flag Homes Network · Encrypted Session Management
          </p>
        </div>
      </div>
    </div>
  );
};
