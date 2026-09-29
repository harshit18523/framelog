import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { FilmActionPanel } from '../components/film/FilmActionPanel';
import { FilmCredits } from '../components/film/FilmCredits';
import { FilmReviews } from '../components/film/FilmReviews';
import { Poster } from '../components/film/Poster';
import { RatingHistogram } from '../components/film/RatingHistogram';
import { ButtonLink } from '../components/ui/Button';
import { SectionHeader } from '../components/ui/SectionHeader';
import { films } from '../data/films';
import { formatRuntime, getFilm } from '../utils/films';

export function FilmDetail() {
  const { id } = useParams();
  const film = getFilm(id);

  if (!film) {
    return (
      <div className="grid min-h-[60vh] place-items-center px-6 text-center">
        <div>
          <p className="text-2xl font-semibold tracking-title">This reel is missing</p>
          <p className="mt-2 text-sm text-fg-subtle">We couldn’t find that film. It may have been removed.</p>
          <ButtonLink to="/app/discover" variant="secondary" className="mt-6">
            Browse films
          </ButtonLink>
        </div>
      </div>);

  }

  const related = films.filter((f) => f.id !== film.id && f.genres.some((g) => film.genres.includes(g)));
  const moreLikeThis = [...related, ...films.filter((f) => f.id !== film.id && !related.includes(f))].slice(0, 6);

  return (
    <article>
      <div className="relative h-[44vh] min-h-[320px] w-full overflow-hidden lg:h-[62vh] lg:max-h-[640px]">
        {film.backdrop ?
        <img src={film.backdrop} alt="" className="backdrop-fade h-full w-full object-cover object-center" /> :

        <img
          src={film.poster}
          alt=""
          className="backdrop-fade h-full w-full scale-110 object-cover object-[center_30%] opacity-70 blur-2xl" />

        }
        <div className="absolute inset-0 bg-canvas/30" aria-hidden />
      </div>

      <div className="relative mx-auto -mt-44 max-w-[1240px] px-4 sm:px-6 lg:-mt-64 lg:px-12">
        <div className="grid gap-10 md:grid-cols-[220px_minmax(0,1fr)] lg:grid-cols-[240px_minmax(0,1fr)_300px] lg:gap-12">
          <div className="w-44 md:w-full">
            <Poster film={film} linked={false} eager className="[&>span]:shadow-elevated" />
          </div>

          <div className="min-w-0 md:pt-28 lg:pt-36">
            <p className="text-sm text-fg-muted">
              {film.year} <span className="px-1.5 text-fg-faint">·</span> {formatRuntime(film.runtime)}
              <span className="px-1.5 text-fg-faint">·</span> {film.genres.join(', ')}
            </p>
            <h1 className="mt-3 text-[40px] font-semibold leading-[1.02] tracking-display sm:text-[56px] lg:text-[64px]">
              {film.title}
            </h1>
            <p className="mt-4 text-[15px] text-fg-muted">
              Directed by <span className="font-medium text-fg">{film.director}</span>
            </p>

            <p className="mt-10 text-lg font-medium italic text-fg">{film.tagline}</p>
            <p className="mt-3 max-w-[60ch] text-base leading-[1.75] text-fg-muted">{film.synopsis}</p>

            <div className="mt-8 flex flex-wrap gap-2">
              {film.genres.map((genre) =>
              <Link
                key={genre}
                to={`/app/discover?genre=${encodeURIComponent(genre)}`}
                className="rounded-full bg-white/[0.05] px-3.5 py-1.5 text-xs font-medium text-fg-muted ring-1 ring-inset ring-line transition-colors duration-150 hover:bg-white/[0.09] hover:text-fg">
                
                  {genre}
                </Link>
              )}
            </div>

            <div className="mt-14">
              <FilmCredits film={film} />
            </div>
          </div>

          <div className="space-y-8 md:col-span-2 lg:col-span-1 lg:pt-36">
            <FilmActionPanel film={film} />
            <RatingHistogram film={film} />
          </div>
        </div>

        <div className="mt-20 grid gap-16 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-12 lg:pl-[288px]">
          <FilmReviews film={film} />
        </div>

        <section aria-labelledby="similar-heading" className="mt-20">
          <SectionHeader id="similar-heading" title="More like this" description={`If ${film.title} stayed with you`} />
          <ul className="grid grid-cols-3 gap-4 sm:grid-cols-4 sm:gap-5 lg:grid-cols-6">
            {moreLikeThis.map((f) =>
            <li key={f.id}>
                <Poster film={f} />
              </li>
            )}
          </ul>
        </section>
      </div>
    </article>);

}