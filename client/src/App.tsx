import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AppShell } from './components/app/AppShell';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { ScrollToTop } from './components/ScrollToTop';
import { AuthProvider } from './contexts/AuthContext';
import { LibraryProvider } from './contexts/LibraryContext';
import { Chats } from './pages/Chats';
import { Diary } from './pages/Diary';
import { Discover } from './pages/Discover';
import { FilmDetail } from './pages/FilmDetail';
import { Home } from './pages/Home';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Profile } from './pages/Profile';
import { Register } from './pages/Register';
import Testing from './pages/Testing';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LibraryProvider>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/testing" element={<Testing />} />

            {/* Authenticated Application Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/app" element={<AppShell />}>
                <Route index element={<Home />} />
                <Route path="discover" element={<Discover />} />
                <Route path="diary" element={<Diary />} />
                <Route path="chats" element={<Chats />} />
                <Route path="profile" element={<Profile />} />
                <Route path="profile/:id" element={<Profile />} />
                <Route path="film/:id" element={<FilmDetail />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster
            theme="dark"
            position="bottom-center"
            toastOptions={{
              style: {
                background: 'rgba(24, 24, 27, 0.92)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#FAFAFA',
                borderRadius: '14px',
              },
            }}
          />
        </LibraryProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
