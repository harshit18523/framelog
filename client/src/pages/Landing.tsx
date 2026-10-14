import React from 'react';
import { Navigate } from 'react-router-dom';
import { FeatureShowcase } from '../components/marketing/FeatureShowcase';
import { HeroSection } from '../components/marketing/HeroSection';
import { MarketingFooter } from '../components/marketing/MarketingFooter';
import { MarketingNav } from '../components/marketing/MarketingNav';
import { ButtonLink } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';

export function Landing() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null;
  if (isAuthenticated) {
    return <Navigate to="/app" replace />;
  }

  const backdropUrl =
    'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?auto=format&fit=crop&w=1600&q=80';

  return (
    <div className="min-h-screen w-full bg-canvas text-fg">
      <MarketingNav />
      <main>
        <HeroSection />
        <FeatureShowcase />

        <section id="join" aria-labelledby="join-title" className="scroll-mt-20 px-4 pb-24 sm:px-6">
          <div className="relative mx-auto max-w-[1200px] overflow-hidden rounded-3xl ring-1 ring-inset ring-line">
            <img src={backdropUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-black/60" aria-hidden />
            <div className="relative flex min-h-[460px] flex-col items-center justify-center px-6 py-20 text-center">
              <h2 id="join-title" className="max-w-2xl text-[40px] font-semibold leading-[1.02] tracking-display sm:text-[64px]">
                The lights are going down.
              </h2>
              <p className="mt-5 max-w-md text-lg text-white/80">
                Free forever for your diary, reviews and lists. FrameLog Pro from $4 a month.
              </p>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <ButtonLink to="/register" size="lg">
                  Create your free account
                </ButtonLink>
                <ButtonLink to="/login" variant="secondary" size="lg" className="bg-black/30 backdrop-blur-md">
                  Sign in
                </ButtonLink>
              </div>
            </div>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}

export default Landing;
