import React from 'react';
import { Link } from 'react-router-dom';
import { LayersIcon, UsersIcon } from 'lucide-react';
import type { UserList } from '../../types/list';

type ListCardProps = {
  list: UserList;
};

export function ListCard({ list }: ListCardProps) {
  const listId = list.id || list._id;
  const filmCount = list.films?.length || 0;
  const previewFilms = (list.films || []).slice(0, 5);
  const members = list.members || [];
  const isCollab = list.isCollaborative;

  return (
    <Link
      to={`/app/lists/${listId}`}
      className="group flex flex-col overflow-hidden rounded-2xl bg-surface/60 p-4 ring-1 ring-inset ring-line transition-all duration-200 ease-cinema hover:-translate-y-1 hover:bg-surface-raised hover:ring-gold/30 hover:shadow-elevated"
    >
      {/* Visual Preview / Poster Stack */}
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-canvas/60 ring-1 ring-white/5">
        {list.coverImage ? (
          <img
            src={list.coverImage}
            alt={list.name}
            className="h-full w-full object-cover transition-transform duration-300 ease-cinema group-hover:scale-105"
          />
        ) : previewFilms.length > 0 ? (
          <div className="grid h-full w-full grid-cols-5 gap-1 bg-black/40 p-1">
            {previewFilms.map((film, idx) => (
              <div
                key={film.filmId + idx}
                className="relative h-full overflow-hidden rounded-md bg-canvas ring-1 ring-white/10"
              >
                {film.posterPath ? (
                  <img
                    src={film.posterPath}
                    alt={film.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="grid h-full w-full place-items-center bg-white/[0.04] text-[10px] text-fg-subtle">
                    {film.title.slice(0, 2)}
                  </div>
                )}
              </div>
            ))}
            {/* Fill empty spots if less than 5 */}
            {Array.from({ length: 5 - previewFilms.length }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="h-full rounded-md bg-white/[0.02] ring-1 ring-white/[0.04]"
              />
            ))}
          </div>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-fg-subtle">
            <LayersIcon size={28} className="text-white/20" />
            <span className="text-xs text-fg-faint">Empty list</span>
          </div>
        )}

        {/* Film count badge */}
        <span className="absolute bottom-2.5 right-2.5 rounded-md bg-black/75 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-white backdrop-blur-md ring-1 ring-white/10">
          {filmCount} {filmCount === 1 ? 'film' : 'films'}
        </span>

        {/* Collaborative badge */}
        {isCollab && (
          <span className="absolute left-2.5 top-2.5 flex items-center gap-1 rounded-md bg-gold/90 px-2 py-0.5 text-[10px] font-semibold text-canvas backdrop-blur-md">
            <UsersIcon size={10} />
            Collab
          </span>
        )}
      </div>

      {/* Info */}
      <div className="mt-4 flex flex-1 flex-col">
        <h3 className="text-base font-semibold text-fg transition-colors group-hover:text-gold">
          {list.name}
        </h3>
        {list.description && (
          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-fg-subtle">
            {list.description}
          </p>
        )}

        {/* Member avatars for collaborative lists */}
        {isCollab && members.length > 0 && (
          <div className="mt-3 flex items-center gap-2">
            <div className="flex -space-x-2">
              {members.slice(0, 4).map((m, idx) => {
                const user = typeof m.user === 'object' ? m.user : null;
                const name = user?.username ?? 'U';
                const pic = user?.avatar || user?.profilePicture;
                return (
                  <div
                    key={idx}
                    title={`@${name}`}
                    className="h-5 w-5 overflow-hidden rounded-full ring-1 ring-canvas"
                  >
                    {pic ? (
                      <img src={pic} alt={name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="grid h-full w-full place-items-center bg-gold/20 text-[8px] font-bold text-gold">
                        {name[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>
                );
              })}
              {members.length > 4 && (
                <div className="grid h-5 w-5 place-items-center rounded-full bg-white/10 text-[8px] font-semibold text-fg-subtle ring-1 ring-canvas">
                  +{members.length - 4}
                </div>
              )}
            </div>
            <span className="text-[11px] text-fg-faint">
              {members.length} editor{members.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}

export default ListCard;
