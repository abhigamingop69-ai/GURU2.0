import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Home, BookOpen, Tv, FileText, Settings, BookMarked } from 'lucide-react';
import { cn } from '../lib/utils';
import { useStore } from '../store/useStore';
import { useEffect } from 'react';

const navItems = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: BookOpen, label: 'Subjects', path: '/subjects' },
  { icon: Tv, label: 'Guru TV', path: '/tv' },
  { icon: FileText, label: 'Exams', path: '/exams' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export default function Layout() {
  const theme = useStore(state => state.theme);
  const location = useLocation();

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <div className="flex h-screen w-full bg-background text-foreground transition-colors duration-300">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card p-4">
        <div className="flex items-center gap-3 px-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center font-heading font-bold text-white text-xl">G</div>
          <h1 className="font-heading font-bold text-2xl tracking-tight text-primary">Guruba</h1>
        </div>
        
        <nav className="flex flex-col gap-2 flex-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 active:scale-[0.98]",
                isActive 
                  ? "bg-primary/10 text-primary font-semibold" 
                  : "text-foreground/70 hover:bg-card-foreground/5 hover:text-foreground"
              )}
            >
              <item.icon className={cn("w-5 h-5", location.pathname === item.path ? "text-primary" : "")} />
              <span className="font-medium text-sm">{item.label}</span>
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
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-border bg-card pb-safe px-2 z-50">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => cn(
                  "flex flex-col items-center justify-center w-full h-full gap-1 active:scale-95 transition-transform duration-100",
                  isActive ? "text-primary" : "text-foreground/60"
                )}
              >
                <item.icon className={cn("w-5 h-5 transition-transform duration-200", isActive && "scale-110")} />
                <span className={cn("text-[10px] font-medium transition-colors", isActive && "font-bold")}>{item.label}</span>
              </NavLink>
            )
          })}
        </div>
      </nav>
    </div>
  );
}
