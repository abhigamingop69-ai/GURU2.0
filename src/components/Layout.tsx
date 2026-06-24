import { useEffect, useState } from 'react';
import { Outlet, NavLink as RouterNavLink, useLocation } from 'react-router-dom';
import { Home, BookOpen, Tv, FileText, Settings, BookMarked, Menu, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { useStore } from '../store/useStore';
import { motion } from 'motion/react';

const navItems = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: BookOpen, label: 'Subjects', path: '/subjects' },
  { icon: Tv, label: 'Guru TV', path: '/tv' },
  { icon: FileText, label: 'Exams', path: '/exams' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

const NavLink = motion.create(RouterNavLink);

export default function Layout() {
  const location = useLocation();
  const { user } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!user?.notificationsEnabled || !('Notification' in window) || Notification.permission !== 'granted') return;

    const [prefHour, prefMin] = (user.preferredStudyTime || '18:00').split(':').map(Number);
    
    // Check every minute
    const interval = setInterval(() => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMin = now.getMinutes();
      const currentDateString = now.toISOString().split('T')[0];
      const lastNotifiedDate = localStorage.getItem('lastStudyNotificationDate');

      if (currentHour === prefHour && currentMin === prefMin && lastNotifiedDate !== currentDateString) {
        new Notification("Time to Study! 📚", {
          body: "It's your preferred study time. Keep up your daily streak on Guruba!",
          icon: "https://i.ibb.co/VYyZWwpp/Untitled-project-Photoroom.png" // Guruba Logo
        });
        localStorage.setItem('lastStudyNotificationDate', currentDateString);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [user?.notificationsEnabled, user?.preferredStudyTime]);

  return (
    <div className="flex h-[100dvh] w-full bg-background text-foreground transition-colors duration-300 pt-[env(safe-area-inset-top)]">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card p-4">
        <div className="flex items-center px-2 mb-8 mt-2">
          <img src="https://i.ibb.co/VYyZWwpp/Untitled-project-Photoroom.png" alt="Guruba Logo" className="h-20 object-contain" />
        </div>
        
        <nav className="flex flex-col gap-2 flex-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className={({ isActive }) => cn(
                "flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-200",
                isActive 
                  ? "bg-primary/10 text-primary border-2 border-primary/20 dark:bg-primary/20 dark:border-primary/30" 
                  : "text-foreground/70 hover:bg-card-foreground/5 hover:text-foreground border-2 border-transparent"
              )}
            >
              <item.icon className="w-7 h-7" fill={location.pathname === item.path ? "currentColor" : "none"} strokeWidth={location.pathname === item.path ? 2 : 2.5} />
              <span className="font-bold text-sm tracking-wide uppercase">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 w-full overflow-y-auto relative flex flex-col">
        {/* Mobile Top Header */}
        <div className="md:hidden flex items-center justify-between p-4 bg-card border-b border-border sticky top-0 z-40 relative">
          <img src="https://i.ibb.co/VYyZWwpp/Untitled-project-Photoroom.png" alt="Guruba Logo" className="h-8 object-contain relative z-10" />
          
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-0">
            <img src="https://i.ibb.co/Pv139k1Y/Untitled-project-Photoroom.png" alt="Guruba Text" className="h-[80px] object-contain" />
          </div>

          <button 
            onClick={() => setMobileMenuOpen(true)}
            className="p-2.5 hover:bg-card-foreground/5 rounded-full active:scale-95 transition-transform min-w-[44px] min-h-[44px] flex items-center justify-center relative z-10"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        <div className="max-w-screen-xl mx-auto min-h-full w-full">
          <Outlet />
        </div>
      </main>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <aside className={cn(
        "md:hidden fixed top-0 bottom-0 right-0 w-64 bg-card border-l border-border z-50 p-4 pt-[max(1rem,env(safe-area-inset-top))] flex flex-col transition-transform duration-300 ease-in-out",
        mobileMenuOpen ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="flex items-center justify-between px-2 mb-8 mt-2">
          <span className="font-heading font-bold text-lg">Menu</span>
          <button 
            onClick={() => setMobileMenuOpen(false)}
            className="p-2.5 hover:bg-card-foreground/5 rounded-full active:scale-95 transition-transform min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <nav className="flex flex-col gap-2 flex-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                "flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-200",
                isActive 
                  ? "bg-primary/10 text-primary border-2 border-primary/20" 
                  : "text-foreground/70 hover:bg-card-foreground/5 hover:text-foreground border-2 border-transparent"
              )}
            >
              <item.icon className="w-7 h-7" fill={location.pathname === item.path ? "currentColor" : "none"} strokeWidth={location.pathname === item.path ? 2 : 2.5} />
              <span className="font-bold text-sm tracking-wide uppercase">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </div>
  );
}
