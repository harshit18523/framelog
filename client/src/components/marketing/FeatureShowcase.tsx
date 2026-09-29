import React from 'react';
import { features } from '../../data/marketing';
import { FeatureVisual } from './FeatureVisual';

export function FeatureShowcase() {
  return (
    <section id="features" aria-labelledby="features-title" className="mx-auto max-w-[1200px] scroll-mt-20 px-6 py-28 lg:py-40">
      <h2 id="features-title" className="max-w-3xl text-[40px] font-semibold leading-[1.05] tracking-display sm:text-[56px]">
        Everything a film lover needs.
        <span className="block text-fg-faint">Nothing they don’t.</span>
      </h2>

      <div className="mt-24 space-y-28 lg:mt-32 lg:space-y-40">
        {features.map((feature, i) =>
        <div
          key={feature.id}
          id={feature.id === 'connect' ? 'community' : undefined}
          className="grid scroll-mt-24 items-center gap-12 lg:grid-cols-2 lg:gap-24">
          
            <div className={i % 2 === 1 ? 'lg:order-2' : ''}>
              <p className="text-sm font-medium text-gold">{feature.name}</p>
              <h3 className="mt-4 text-[32px] font-semibold leading-[1.1] tracking-display sm:text-[40px]">{feature.title}</h3>
              <p className="mt-5 max-w-md text-[17px] leading-relaxed text-fg-muted">{feature.body}</p>
            </div>
            <FeatureVisual kind={feature.id} />
          </div>
        )}
      </div>
    </section>);

}