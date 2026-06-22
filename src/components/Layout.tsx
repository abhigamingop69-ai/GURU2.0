import { useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Home, BookOpen, Tv, FileText, Settings, BookMarked } from 'lucide-react';
import { cn } from '../lib/utils';
import { useStore } from '../store/useStore';

const navItems = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: BookOpen, label: 'Subjects', path: '/subjects' },
  { icon: Tv, label: 'Guru TV', path: '/tv' },
  { icon: FileText, label: 'Exams', path: '/exams' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export default function Layout() {
  const location = useLocation();
  const { user } = useStore();

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
    <div className="flex h-screen w-full bg-background text-foreground transition-colors duration-300">
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
              className={({ isActive }) => cn(
                "flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-200 active:scale-[0.95]",
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
      <main className="flex-1 w-full overflow-y-auto pb-20 md:pb-0 relative">
        <div className="max-w-screen-xl mx-auto min-h-full">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t-2 border-border bg-card pb-safe px-2 z-50">
        <div className="flex items-center justify-around h-16 pt-1 pb-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => cn(
                  "flex flex-col items-center justify-center flex-1 h-full gap-1 active:scale-[0.90] transition-all duration-300 rounded-2xl",
                  isActive ? "text-primary bg-primary/10" : "text-foreground/50 hover:bg-card-foreground/5"
                )}
              >
                <item.icon className={cn("w-6 h-6 transition-all duration-300", isActive && "scale-110 -translate-y-0.5")} fill={isActive ? "currentColor" : "none"} strokeWidth={isActive ? 2 : 2.5} />
                {isActive && <span className="text-[10px] font-bold uppercase tracking-wider transition-all duration-300">{item.label}</span>}
              </NavLink>
            )
          })}
        </div>
      </nav>
    </div>
  );
}
