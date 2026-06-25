import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Grade, Stream } from '../types';

interface AppState {
  user: User | null;
  sessionToken: string | null;
  onboardingComplete: boolean;
  theme: 'light' | 'dark';
  selectedGrade: Grade | null;
  
  // Actions
  login: (token: string, user: User) => void;
  logout: () => void;
  completeOnboarding: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setSelectedGrade: (grade: Grade) => void;
  updateUser: (data: Partial<User>) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      sessionToken: null,
      onboardingComplete: false,
      theme: 'dark',
      selectedGrade: null,

      login: (token, user) => set({ sessionToken: token, user, selectedGrade: user.grade }),
      logout: () => set({ sessionToken: null, user: null }),
      completeOnboarding: () => set({ onboardingComplete: true }),
      setTheme: (theme) => set({ theme }),
      setSelectedGrade: (selectedGrade) => set({ selectedGrade }),
      updateUser: (data) => set((state) => ({ user: state.user ? { ...state.user, ...data } : null })),
    }),
    {
      name: 'guruba-storage',
    }
  )
);
