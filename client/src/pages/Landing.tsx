import React from 'react';
import { FeatureShowcase } from '../components/marketing/FeatureShowcase';
import { HeroSection } from '../components/marketing/HeroSection';
import { MarketingFooter } from '../components/marketing/MarketingFooter';
import { MarketingNav } from '../components/marketing/MarketingNav';
import { ButtonLink } from '../components/ui/Button';
import { getFilm } from '../utils/films';

export function Landing() {
  const closing = getFilm('the-long-field');

  return (
    <div className="min-h-screen w-full bg-canvas text-fg">
      <MarketingNav />
      <main>
        <HeroSection />
        <FeatureShowcase />

        <section id="join" aria-labelledby="join-title" className="scroll-mt-20 px-4 pb-24 sm:px-6">
          <div className="relative mx-auto max-w-[1200px] overflow-hidden rounded-3xl ring-1 ring-inset ring-line">
            {closing?.backdrop && <img src={closing.backdrop} alt="" className="absolute inset-0 h-full w-full object-cover" />}
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
    </div>);

}