import { useStore } from '../store/useStore';
import { Stream } from '../types';
import { cn } from '../lib/utils';
import { Moon, User, BookOpen, Info, LogOut } from 'lucide-react';

export default function Settings() {
  const { user, theme, setTheme, updateUser, logout } = useStore();

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      logout();
    }
  };

  return (
    <div className="flex flex-col max-w-2xl mx-auto min-h-screen p-4 pt-6 gap-8 pb-24">
      <header>
        <h1 className="text-2xl font-heading font-bold mb-2">Settings</h1>
      </header>

      {/* Account Section (Read-only as per PRD info + Edit link mock) */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold text-foreground/50 uppercase tracking-wider pl-1">Account</h2>
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="p-4 flex items-center gap-4 border-b border-border">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
              <User className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg">{user?.name}</h3>
              <p className="text-sm text-foreground/60">{user?.email}</p>
            </div>
          </div>
          <button className="w-full p-4 text-left font-semibold text-primary hover:bg-card-foreground/5 transition-colors">
            Edit Profile
          </button>
        </div>
      </section>

      {/* Appearance Section */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold text-foreground/50 uppercase tracking-wider pl-1">Appearance</h2>
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Moon className="w-5 h-5 text-foreground/70" />
              <span className="font-medium">Dark Mode</span>
            </div>
            
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={cn(
                "relative w-12 h-7 rounded-full transition-colors duration-300",
                theme === 'dark' ? "bg-primary" : "bg-border"
              )}
            >
              <div className={cn(
                "absolute top-1 left-1 w-5 h-5 rounded-full bg-white transition-transform duration-300 shadow",
                theme === 'dark' && "translate-x-5"
              )} />
            </button>
          </div>
        </div>
      </section>

      {/* Content Preferences Section */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold text-foreground/50 uppercase tracking-wider pl-1">Content</h2>
        <div className="bg-card rounded-2xl border border-border overflow-hidden p-4">
          <div className="flex items-center gap-3 mb-3">
            <BookOpen className="w-5 h-5 text-foreground/70" />
            <span className="font-medium">Academic Stream</span>
          </div>
          <select
            value={user?.stream || 'Computer Science'}
            onChange={(e) => updateUser({ stream: e.target.value as Stream })}
            className="w-full h-12 bg-background border border-border rounded-xl px-4 font-medium focus:outline-none focus:border-primary transition-colors"
          >
            <option value="Computer Science">Computer Science</option>
            <option value="Hotel Management">Hotel Management</option>
          </select>
        </div>
      </section>

      {/* About Section */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold text-foreground/50 uppercase tracking-wider pl-1">About</h2>
        <div className="bg-card rounded-2xl border border-border overflow-hidden flex flex-col">
          <div className="p-4 border-b border-border flex items-center justify-between hover:bg-card-foreground/5 cursor-pointer">
            <div className="flex items-center gap-3">
              <Info className="w-5 h-5 text-foreground/70" />
              <span className="font-medium">App Version</span>
            </div>
            <span className="text-sm text-foreground/50 font-bold">1.0.0</span>
          </div>
           <a href="#terms" className="p-4 border-b border-border font-medium hover:bg-card-foreground/5 transition-colors block">
            Terms of Service
          </a>
          <a href="#privacy" className="p-4 border-b border-border font-medium hover:bg-card-foreground/5 transition-colors block">
            Privacy Policy
          </a>
          <a href="mailto:support@guruba.edu.np" className="p-4 font-medium hover:bg-card-foreground/5 transition-colors block">
            Contact Support
          </a>
        </div>
      </section>

      {/* Logout */}
      <button 
        onClick={handleLogout}
        className="w-full mt-4 h-14 bg-background border-2 border-border text-error hover:bg-error/10 hover:border-error/20 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
      >
        <LogOut className="w-5 h-5" />
        Log Out
      </button>
    </div>
  );
}
