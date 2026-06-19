import { Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/useStore';
import { useEffect } from 'react';
import Layout from './components/Layout';
import Onboarding from './pages/Onboarding';
import Auth from './pages/Auth';
import Home from './pages/Home';
import Subjects from './pages/Subjects';
import ChapterList from './pages/ChapterList';
import ChapterDetail from './pages/ChapterDetail';
import GuruTV from './pages/GuruTV';
import ExamAssets from './pages/ExamAssets';
import Settings from './pages/Settings';
import Welcome from './pages/Welcome';
import ChessGame from './pages/ChessGame';

export default function App() {
  const { sessionToken, onboardingComplete, theme } = useStore();

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  if (!onboardingComplete) {
    return <Onboarding />;
  }

  if (!sessionToken) {
    return <Auth />;
  }

  return (
    <Routes>
      <Route path="/welcome" element={<Welcome />} />
      <Route path="/chess" element={<ChessGame />} />
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/subjects" element={<Subjects />} />
        <Route path="/subjects/:subjectId" element={<ChapterList />} />
        <Route path="/subjects/:subjectId/chapter/:chapterId" element={<ChapterDetail />} />
        <Route path="/tv" element={<GuruTV />} />
        <Route path="/exams" element={<ExamAssets />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
