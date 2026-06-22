import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { Grade, Stream } from '../types';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [grade, setGrade] = useState<Grade>(11);
  const [stream, setStream] = useState<Stream>('Computer Science');
  
  const login = useStore(state => state.login);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock Auth
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    login('mock-jwt-token', {
      id: 'u1',
      name: isLogin ? 'Student' : name || 'Student',
      email,
      grade,
      stream,
      streakCount: 2,
      lastActiveDate: yesterdayStr,
      badges: [
        {
          id: 'b1',
          title: 'Early Bird',
          description: 'Started your learning journey',
          icon: 'Star',
          dateEarned: yesterdayStr
        }
      ]
    });
    navigate('/welcome', { replace: true });
  };

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col p-6 items-center justify-center overflow-y-auto overflow-x-hidden relative">
      <div className="absolute inset-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />
      
      <div className="w-full flex justify-center mb-6 relative z-10">
        <div className="w-24 h-24 md:w-32 md:h-32 bg-card rounded-full shadow-lg flex items-center justify-center p-4">
          <img src="https://i.ibb.co/VYyZWwpp/Untitled-project-Photoroom.png" alt="Guruba Logo" className="w-full h-full object-contain drop-shadow-md" />
        </div>
      </div>
      <div className="w-full max-w-sm bg-card/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-6 space-y-6 border border-white/20 relative z-10">
        
        <div className="flex bg-background rounded-full p-1 relative">
          <div className={cn(
            "absolute inset-y-1 w-[calc(50%-4px)] bg-primary rounded-full transition-transform duration-300 z-0",
            !isLogin && "translate-x-full"
          )} />
          <button
            onClick={() => setIsLogin(true)}
            className={cn("flex-1 h-10 font-bold z-10 transition-colors", isLogin ? "text-white" : "text-foreground/60")}
          >
            Log In
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={cn("flex-1 h-10 font-bold z-10 transition-colors", !isLogin ? "text-white" : "text-foreground/60")}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-foreground/70 uppercase">Full Name</label>
              <input
                type="text"
                placeholder="Aarav Sharma"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full h-12 bg-background border border-border rounded-xl px-4 focus:outline-none focus:border-primary transition-colors"
                required
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-foreground/70 uppercase">Email Address</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full h-12 bg-background border border-border rounded-xl px-4 focus:outline-none focus:border-primary transition-colors"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-foreground/70 uppercase">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full h-12 bg-background border border-border rounded-xl px-4 focus:outline-none focus:border-primary transition-colors"
              required
            />
          </div>

          {!isLogin && (
            <>
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground/70 uppercase">Grade</label>
                <div className="flex gap-2">
                  {[11, 12].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGrade(g as Grade)}
                      className={cn(
                        "flex-1 h-12 font-bold rounded-2xl transition-all border-2 border-b-4 active:border-b-2 active:translate-y-[2px]",
                        grade === g ? "border-primary bg-primary/10 text-primary" : "border-border text-foreground/60"
                      )}
                    >
                      Grade {g}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground/70 uppercase">Stream</label>
                <select
                  value={stream}
                  onChange={(e) => setStream(e.target.value as Stream)}
                  className="w-full h-12 bg-background border border-border rounded-xl px-4 focus:outline-none focus:border-primary transition-colors"
                >
                  <option value="Computer Science">Computer Science</option>
                  <option value="Hotel Management">Hotel Management</option>
                </select>
              </div>
            </>
          )}

          {isLogin && (
            <div className="flex justify-end">
              <button type="button" className="text-sm font-semibold text-accent hover:underline">
                Forgot Password?
              </button>
            </div>
          )}

          <button
            type="submit"
            className="w-full h-14 mt-6 btn-primary text-lg"
          >
            {isLogin ? "Log In" : "Sign Up"}
          </button>
        </form>

      </div>
    </div>
  );
}
