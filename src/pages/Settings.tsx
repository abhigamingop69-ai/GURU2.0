import { useStore } from '../store/useStore';
import { Stream } from '../types';
import { cn } from '../lib/utils';
import { Moon, User, BookOpen, Info, LogOut, X, PenTool, PlayCircle, Bell, FileDown } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { mockChapters, mockSubjects } from '../data/mockData';

export default function Settings() {
  const { user, theme, setTheme, updateUser, logout } = useStore();
  const [modalType, setModalType] = useState<'none' | 'terms' | 'privacy' | 'profile' | 'logout'>('none');
  const [editName, setEditName] = useState(user?.name || '');
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const handleToggleNotifications = async () => {
    if (!('Notification' in window)) {
      alert('This browser does not support desktop notifications');
      return;
    }

    if (user?.notificationsEnabled) {
      updateUser({ notificationsEnabled: false });
    } else {
      let perm = notificationPermission;
      if (perm === 'default') {
        perm = await Notification.requestPermission();
        setNotificationPermission(perm);
      }
      
      if (perm === 'granted') {
        updateUser({ notificationsEnabled: true, preferredStudyTime: user?.preferredStudyTime || '18:00' });
        // Optional: Send a test notification
        new Notification("You're all set!", {
          body: "We'll remind you to study at your preferred time.",
          icon: "/favicon.ico"
        });
      } else {
        alert("Please enable notifications in your browser settings to use this feature.");
      }
    }
  };

  const handleStudyTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateUser({ preferredStudyTime: e.target.value });
  };

  const handleLogout = () => {
    setModalType('logout');
  };

  const handleSaveProfile = () => {
    updateUser({ name: editName });
    setModalType('none');
  };

  const handleDownloadReport = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.text("Weekly Study Progress Report", 14, 20);
    
    doc.setFontSize(14);
    doc.text(`Student: ${user?.name || 'Unknown'}`, 14, 30);
    doc.text(`Stream: ${user?.stream || 'N/A'} - Grade: ${user?.grade || 'N/A'}`, 14, 38);
    doc.text(`Current Streak: ${user?.streakCount || 0} days`, 14, 46);
    
    // Chapters with progress > 0
    const inProgress = mockChapters.filter(c => c.progress > 0).sort((a, b) => b.progress - a.progress);
    
    const tableData = inProgress.map(ch => {
      const subj = mockSubjects.find(s => s.id === ch.subjectId);
      return [subj?.name || '-', ch.title, `${ch.progress}%`];
    });

    autoTable(doc, {
      startY: 55,
      head: [['Subject', 'Chapter', 'Progress']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [43, 108, 176] },
    });
    
    doc.save(`Study_Report_${user?.name?.replace(/\s+/g, '_') || 'Student'}.pdf`);
  };

  return (
    <div className="flex flex-col max-w-2xl mx-auto min-h-screen p-4 pt-6 gap-8 pb-24">
      <header>
        <h1 className="text-2xl font-heading font-bold mb-2">Settings</h1>
      </header>

      {/* Account Section */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold text-foreground/50 uppercase tracking-wider pl-4">Account</h2>
        <div className="card-duo overflow-hidden border-b-4">
          <div className="p-4 flex items-center gap-4 border-b-2 border-border">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary border-2 border-primary/20">
              <User className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg">{user?.name}</h3>
              <p className="text-sm text-foreground/60">{user?.email}</p>
            </div>
          </div>
          <button onClick={() => setModalType('profile')} className="w-full p-4 text-center font-bold text-primary hover:bg-card-foreground/5 transition-colors uppercase tracking-wide">
            Edit Profile
          </button>
        </div>
      </section>

      {/* Reports Section */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold text-foreground/50 uppercase tracking-wider pl-4">Reports</h2>
        <div className="card-duo overflow-hidden border-b-4">
          <button onClick={handleDownloadReport} className="w-full p-4 flex items-center justify-between text-left font-bold text-foreground hover:bg-card-foreground/5 transition-colors group">
            <div className="flex items-center gap-3">
              <FileDown className="w-6 h-6 text-primary" />
              <span>Download Weekly Progress Report</span>
            </div>
            <span className="text-xs uppercase tracking-wider text-primary font-bold">PDF</span>
          </button>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold text-foreground/50 uppercase tracking-wider pl-4">Achievements</h2>
        <div className="card-duo p-4 border-b-4 relative overflow-hidden">
          {(!user?.badges || user.badges.length === 0) ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-card-foreground/5 rounded-full flex items-center justify-center mx-auto mb-3">
                <PenTool className="w-8 h-8 text-foreground/20" />
              </div>
              <p className="font-bold text-foreground/60">No badges yet.</p>
              <p className="text-sm text-foreground/40 mt-1">Keep studying to earn your first badge!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {user.badges.map(badge => (
                <div key={badge.id} className="flex flex-col items-center p-3 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-primary text-white flex flex-col items-center justify-center shadow-sm mb-2 relative">
                    <span className="text-xl font-black">{badge.icon === 'Flame' ? '🔥' : badge.icon === 'Star' ? '⭐' : badge.icon === 'Trophy' ? '🏆' : '📚'}</span>
                  </div>
                  <h4 className="font-bold text-xs leading-tight mb-1">{badge.title}</h4>
                  <p className="text-[10px] text-foreground/50 font-medium">{badge.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Appearance Section */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold text-foreground/50 uppercase tracking-wider pl-4">Appearance</h2>
        <div className="card-duo overflow-hidden border-b-4">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Moon className="w-6 h-6 text-foreground/70" />
              <span className="font-bold">Dark Mode</span>
            </div>
            
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={cn(
                "relative w-14 h-8 rounded-full transition-colors duration-300 border-2",
                theme === 'dark' ? "bg-primary border-primary" : "bg-card border-border"
              )}
            >
              <div className={cn(
                "absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white transition-transform duration-300 shadow-sm",
                theme === 'dark' ? "translate-x-6" : "bg-foreground/20"
              )} />
            </button>
          </div>
        </div>
      </section>

      {/* Notifications Section */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold text-foreground/50 uppercase tracking-wider pl-4">Notifications</h2>
        <div className="card-duo overflow-hidden border-b-4">
          <div className="p-4 flex items-center justify-between border-b-2 border-border">
            <div className="flex items-center gap-3">
              <Bell className="w-6 h-6 text-foreground/70" />
              <span className="font-bold">Daily Study Reminder</span>
            </div>
            
            <button 
              onClick={handleToggleNotifications}
              className={cn(
                "relative w-14 h-8 rounded-full transition-colors duration-300 border-2",
                user?.notificationsEnabled ? "bg-primary border-primary" : "bg-card border-border"
              )}
            >
              <div className={cn(
                "absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white transition-transform duration-300 shadow-sm",
                user?.notificationsEnabled ? "translate-x-6" : "bg-foreground/20"
              )} />
            </button>
          </div>
          
          <div className={cn(
            "p-4 flex items-center justify-between transition-all overflow-hidden",
            user?.notificationsEnabled ? "max-h-24 opacity-100" : "max-h-0 opacity-0 py-0 border-transparent"
          )}>
            <span className="font-bold text-foreground/70 text-sm">Preferred Time</span>
            <input 
              type="time" 
              value={user?.preferredStudyTime || '18:00'}
              onChange={handleStudyTimeChange}
              className="bg-card border-2 border-border rounded-xl px-3 py-1 font-bold focus:outline-none focus:border-primary"
            />
          </div>
        </div>
      </section>

      {/* Content Preferences Section */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold text-foreground/50 uppercase tracking-wider pl-4">Content</h2>
        <div className="card-duo overflow-hidden p-4 border-b-4">
          <div className="flex items-center gap-3 mb-3">
            <BookOpen className="w-6 h-6 text-foreground/70" />
            <span className="font-bold">Academic Stream</span>
          </div>
          <select
            value={user?.stream || 'Computer Science'}
            onChange={(e) => updateUser({ stream: e.target.value as Stream })}
            className="w-full h-12 bg-background border-2 border-b-4 border-border rounded-2xl px-4 font-bold focus:outline-none focus:border-primary transition-all appearance-none"
          >
            <option value="Computer Science">Computer Science</option>
            <option value="Hotel Management">Hotel Management</option>
          </select>
        </div>
      </section>

      {/* About Section */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold text-foreground/50 uppercase tracking-wider pl-4">About</h2>
        <div className="card-duo overflow-hidden flex flex-col border-b-4">
          <div className="p-4 border-b-2 border-border flex items-center justify-between">
            <div className="flex items-center gap-3 text-foreground/70">
              <Info className="w-6 h-6" />
              <span className="font-bold text-foreground">App Version</span>
            </div>
            <span className="text-sm text-foreground/50 font-bold uppercase">1.2.0</span>
          </div>
          <div className="p-4 border-b-2 border-border flex items-center gap-4 bg-primary/5">
            <div className="flex items-center gap-3 text-primary shrink-0">
              <PenTool className="w-6 h-6" />
              <span className="font-bold">Developer</span>
            </div>
            <span className="text-[13px] text-primary font-black uppercase tracking-widest bg-primary/10 text-center truncate px-3 py-1 rounded-full border border-primary/20 ml-auto">AashishDevkota</span>
          </div>
          <button onClick={() => window.location.reload()} className="p-4 border-b-2 border-border font-bold hover:bg-card-foreground/5 transition-colors text-left flex justify-between items-center group">
            <div className="flex items-center gap-3">
              <span className="font-bold">Check for Updates</span>
            </div>
            <span className="text-xs uppercase tracking-wider text-primary font-bold">Refresh</span>
          </button>
          <button onClick={() => setModalType('terms')} className="p-4 border-b-2 border-border font-bold hover:bg-card-foreground/5 transition-colors text-left flex justify-between items-center group">
            Terms of Service
          </button>
          <button onClick={() => setModalType('privacy')} className="p-4 border-b-2 border-border font-bold hover:bg-card-foreground/5 transition-colors text-left flex justify-between items-center group">
            Privacy Policy
          </button>
          <a href="mailto:support@guruba.edu.np" className="p-4 font-bold hover:bg-card-foreground/5 transition-colors block text-left flex justify-between items-center group text-primary">
            Contact Support
          </a>
        </div>
      </section>

      {/* Logout */}
      <button 
        onClick={handleLogout}
        className="w-full mt-4 h-14 bg-background border-2 border-b-4 border-border text-error hover:bg-error/10 hover:border-error rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:translate-y-1 active:border-b-2"
      >
        <LogOut className="w-6 h-6 stroke-[2.5]" />
        LOG OUT
      </button>

      {/* Modals */}
      {modalType !== 'none' && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card-duo w-full max-w-sm flex flex-col p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-heading font-bold">
                {modalType === 'terms' ? 'Terms of Service' : 
                 modalType === 'privacy' ? 'Privacy Policy' : 
                 modalType === 'logout' ? 'Logging Out' : 'Edit Profile'}
              </h2>
              <button onClick={() => setModalType('none')} className="p-2.5 -mr-2 text-foreground/50 hover:bg-card-foreground/5 rounded-xl active:scale-95 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {modalType === 'profile' ? (
              <div className="py-4 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground/70 uppercase">Full Name</label>
                  <input 
                    type="text" 
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full h-12 bg-background border-2 border-b-4 border-border rounded-xl px-4 font-bold focus:outline-none focus:border-primary transition-all" 
                  />
                </div>
                <button onClick={handleSaveProfile} className="mt-4 btn-primary h-12 w-full">Save Changes</button>
              </div>
            ) : modalType === 'logout' ? (
              <div className="py-2 space-y-6 flex flex-col">
                <p className="font-bold text-foreground/80 text-lg">Are you sure you want to log out?</p>
                <div className="flex gap-3">
                  <button onClick={() => setModalType('none')} className="btn-outline flex-1 h-12">Cancel</button>
                  <button onClick={async () => {
                    await import('../lib/supabase').then(({ supabase }) => supabase.auth.signOut());
                    logout();
                  }} className="btn-primary bg-error border-error hover:bg-error/90 active:border-b-0 border-b-4 flex-1 h-12 text-white">Log Out</button>
                </div>
              </div>
            ) : (
              <>
                <div className="max-h-60 overflow-y-auto pr-2 no-scrollbar border-b-2 border-t-2 border-border py-4 font-bold text-sm text-foreground/70 space-y-3">
                  <p>Welcome to Guruba. By using this service, you agree to our standard guidelines and regulations.</p>
                  <p>1. Do your daily streak. Guruba likes streaks.</p>
                  <p>2. Study hard and aim for top marks.</p>
                  <p>3. Have fun and keep learning.</p>
                </div>
                <button onClick={() => setModalType('none')} className="mt-6 btn-primary h-12 w-full">Got it</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
