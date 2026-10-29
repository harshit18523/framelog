import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeftIcon,
  PencilIcon,
  Trash2Icon,
  Loader2Icon,
  FilmIcon,
  CompassIcon,
  XIcon,
  UsersIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { AnimatePresence, motion } from 'framer-motion';
import { useLibrary } from '../contexts/LibraryContext';
import { useAuth } from '../contexts/AuthContext';
import { getListByIdApi } from '../api/lists.api';
import { Button } from '../components/ui/Button';
import { CreateListDialog } from '../components/lists/CreateListDialog';
import { ManageMembersModal } from '../components/lists/ManageMembersModal';
import type { UserList } from '../types/list';
import { getOwnerId } from '../types/list';

const ease = [0.23, 1, 0.32, 1] as const;

function MemberAvatars({ list }: { list: UserList }) {
  const members = list.members || [];
  if (!list.isCollaborative || members.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-2">
        {members.slice(0, 5).map((m, idx) => {
          const user = typeof m.user === 'object' ? m.user : null;
          const name = user?.username ?? 'U';
          const pic = user?.avatar || user?.profilePicture;
          return (
            <div
              key={idx}
              title={`@${name} · ${m.role}`}
              className="h-6 w-6 overflow-hidden rounded-full ring-1 ring-surface"
            >
              {pic ? (
                <img src={pic} alt={name} className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full w-full place-items-center bg-gold/20 text-[9px] font-bold text-gold">
                  {name[0]?.toUpperCase()}
                </div>
              )}
            </div>
          );
        })}
        {members.length > 5 && (
          <div className="grid h-6 w-6 place-items-center rounded-full bg-white/10 text-[9px] font-semibold text-fg-subtle ring-1 ring-surface">
            +{members.length - 5}
          </div>
        )}
      </div>
      <span className="text-xs text-fg-subtle">
        {members.length} editor{members.length !== 1 ? 's' : ''}
      </span>
    </div>
  );
}

export function ListDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { lists, deleteList, removeFilmFromList } = useLibrary();
  const { user: currentUser } = useAuth();

  const [list, setList] = useState<UserList | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [membersOpen, setMembersOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [removingFilmId, setRemovingFilmId] = useState<string | null>(null);

  const currentUserId = currentUser?.id || currentUser?._id || '';

  // Determine if the current user is the owner
  const isOwner = list
    ? getOwnerId(list) === currentUserId
    : false;

  // Determine if user is an editor (owner or member with editor role)
  const isEditor = isOwner ||
    (list?.members || []).some(
      (m) => (typeof m.user === 'object' ? m.user._id : m.user) === currentUserId &&
        m.role === 'editor'
    );

  // Load list by ID
  useEffect(() => {
    let isMounted = true;
    if (!id) return;

    // Check if available in library context first
    const fromContext = lists.find((l) => (l.id || l._id) === id);
    if (fromContext) {
      setList(fromContext);
      setLoading(false);
    }

    const fetchDetail = async () => {
      try {
        const data = await getListByIdApi(id);
        if (isMounted) {
          setList(data);
        }
      } catch (err: any) {
        console.error('[ListDetail] Failed to load list:', err);
        if (!fromContext && isMounted) {
          toast.error(err.message || 'Could not find list');
          navigate('/app/lists', { replace: true });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDetail();

    return () => {
      isMounted = false;
    };
  }, [id, lists, navigate]);

  const handleDelete = async () => {
    if (!id) return;
    setDeleting(true);
    try {
      await deleteList(id);
      toast.success('List deleted');
      navigate('/app/lists', { replace: true });
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete list');
      setDeleting(false);
      setDeleteConfirmOpen(false);
    }
  };

  const handleRemoveFilm = async (filmId: string, filmTitle: string) => {
    if (!id) return;
    setRemovingFilmId(filmId);
    try {
      const updated = await removeFilmFromList(id, filmId);
      setList(updated);
      toast.success(`Removed ${filmTitle} from list`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove film');
    } finally {
      setRemovingFilmId(null);
    }
  };

  const banner = useMemo(() => {
    if (list?.coverImage) return list.coverImage;
    const firstWithPoster = list?.films?.find((f) => f.posterPath);
    return firstWithPoster?.posterPath || null;
  }, [list]);

  if (loading && !list) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2Icon size={24} className="animate-spin text-gold" />
      </div>
    );
  }

  if (!list) {
    return null;
  }

  const films = list.films || [];

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 lg:px-12 lg:py-12">
      {/* Back button */}
      <Link
        to="/app/lists"
        className="inline-flex items-center gap-2 text-xs font-medium text-fg-subtle transition-colors hover:text-fg"
      >
        <ArrowLeftIcon size={14} /> Back to lists
      </Link>

      {/* Hero Header */}
      <div className="relative mt-6 overflow-hidden rounded-2xl bg-surface/60 p-6 sm:p-10 ring-1 ring-line">
        {banner && (
          <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <img
              src={banner}
              alt=""
              className="h-full w-full object-cover opacity-15 blur-2xl"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent" />
          </div>
        )}

        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="max-w-2xl">
            {/* List type badge */}
            <span
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${
                list.isCollaborative
                  ? 'bg-gold/15 text-gold'
                  : 'bg-white/[0.08] text-fg-subtle'
              }`}
            >
              {list.isCollaborative ? (
                <>
                  <UsersIcon size={11} /> Collaborative List
                </>
              ) : (
                'Personal List'
              )}
            </span>

            <h1 className="mt-3 text-3xl font-semibold tracking-display sm:text-4xl text-fg">
              {list.name}
            </h1>
            {list.description && (
              <p className="mt-3 text-[15px] leading-relaxed text-fg-muted whitespace-pre-line">
                {list.description}
              </p>
            )}
            <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-fg-subtle">
              <span className="font-medium text-fg">
                {films.length} {films.length === 1 ? 'film' : 'films'}
              </span>
              <span>·</span>
              <span>
                Updated {new Date(list.updatedAt || list.createdAt).toLocaleDateString()}
              </span>

              {/* Member avatars inline */}
              {list.isCollaborative && list.members.length > 0 && (
                <>
                  <span>·</span>
                  <MemberAvatars list={list} />
                </>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2 self-start">
            {/* Manage Members button — owner only, collab lists */}
            {isOwner && list.isCollaborative && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setMembersOpen(true)}
                className="gap-1.5"
              >
                <UsersIcon size={14} /> Members
              </Button>
            )}

            {/* Edit — owner only */}
            {isOwner && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setEditOpen(true)}
                className="gap-1.5"
              >
                <PencilIcon size={14} /> Edit list
              </Button>
            )}

            {/* Delete — owner only */}
            {isOwner && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setDeleteConfirmOpen(true)}
                className="gap-1.5 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/20"
              >
                <Trash2Icon size={14} /> Delete
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Films Section */}
      <div className="mt-10">
        <h2 className="text-base font-semibold text-fg">Films in this list</h2>

        {films.length === 0 ? (
          <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-line-strong px-6 py-20 text-center">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/[0.04] text-gold ring-1 ring-line">
              <FilmIcon size={26} />
            </div>
            <h3 className="mt-4 text-base font-semibold text-fg">No films in this list yet</h3>
            <p className="mt-1.5 max-w-sm text-sm text-fg-subtle">
              Discover films and add them to this list using the &quot;Add to list&quot; button on any movie page.
            </p>
            <Link
              to="/app/discover"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-gold px-4 py-2 text-xs font-semibold text-canvas hover:bg-gold-light"
            >
              <CompassIcon size={14} />
              Discover films
            </Link>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 sm:gap-6">
            {films.map((item) => {
              // Resolve who added this film (for collaborative lists)
              const addedByUser =
                item.addedBy && typeof item.addedBy === 'object'
                  ? (item.addedBy as any)
                  : null;

              return (
                <div key={item.filmId} className="group relative flex flex-col">
                  <Link
                    to={`/app/film/${item.filmId}`}
                    className="relative aspect-[2/3] w-full overflow-hidden rounded-xl bg-canvas ring-1 ring-white/10 transition-transform duration-200 ease-cinema group-hover:scale-105 group-hover:shadow-elevated"
                  >
                    {item.posterPath ? (
                      <img
                        src={item.posterPath}
                        alt={item.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="grid h-full w-full place-items-center bg-white/[0.04] p-2 text-center text-xs font-medium text-fg-subtle">
                        {item.title}
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity duration-150 group-hover:opacity-100" />

                    {/* Added by avatar (collab lists only) */}
                    {list.isCollaborative && addedByUser && (
                      <div
                        title={`Added by @${addedByUser.username}`}
                        className="absolute bottom-2 left-2 h-5 w-5 overflow-hidden rounded-full ring-1 ring-white/20 opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        {addedByUser.avatar || addedByUser.profilePicture ? (
                          <img
                            src={addedByUser.avatar || addedByUser.profilePicture}
                            alt={addedByUser.username}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="grid h-full w-full place-items-center bg-gold/30 text-[8px] font-bold text-gold">
                            {addedByUser.username?.[0]?.toUpperCase()}
                          </div>
                        )}
                      </div>
                    )}
                  </Link>

                  {/* Remove button — only for editors */}
                  {isEditor && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleRemoveFilm(item.filmId, item.title);
                      }}
                      disabled={removingFilmId === item.filmId}
                      title="Remove from list"
                      className="absolute right-2 top-2 z-10 grid h-7 w-7 place-items-center rounded-full bg-black/80 text-white/70 backdrop-blur-md opacity-0 ring-1 ring-white/10 transition-all hover:bg-rose-500 hover:text-white group-hover:opacity-100 disabled:opacity-50"
                    >
                      {removingFilmId === item.filmId ? (
                        <Loader2Icon size={13} className="animate-spin" />
                      ) : (
                        <XIcon size={14} />
                      )}
                    </button>
                  )}

                  <div className="mt-2 min-w-0">
                    <Link
                      to={`/app/film/${item.filmId}`}
                      className="block truncate text-xs font-medium text-fg transition-colors hover:text-gold"
                    >
                      {item.title}
                    </Link>
                    {item.year && (
                      <p className="text-[11px] text-fg-subtle">{item.year}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit List Dialog */}
      <CreateListDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        initialData={list}
        onSuccess={(updated) => setList(updated)}
      />

      {/* Manage Members Modal */}
      {list.isCollaborative && (
        <ManageMembersModal
          open={membersOpen}
          onClose={() => setMembersOpen(false)}
          list={list}
          currentUserId={currentUserId}
          onListUpdated={(updated) => setList(updated)}
        />
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              className="absolute inset-0 bg-black/75 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease }}
              onClick={() => !deleting && setDeleteConfirmOpen(false)}
              aria-hidden
            />
            <motion.div
              role="alertdialog"
              aria-modal="true"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, ease }}
              className="relative w-full max-w-md overflow-hidden rounded-2xl bg-surface-raised p-6 shadow-elevated ring-1 ring-line-strong"
            >
              <h3 className="text-lg font-semibold text-fg">Delete &quot;{list.name}&quot;?</h3>
              <p className="mt-2 text-sm text-fg-subtle leading-relaxed">
                Are you sure you want to delete this list? This action cannot be undone. All films in this list will be unlisted.
              </p>
              <div className="mt-6 flex items-center justify-end gap-3">
                <Button
                  variant="ghost"
                  onClick={() => setDeleteConfirmOpen(false)}
                  disabled={deleting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="bg-rose-500 hover:bg-rose-600 text-white font-medium"
                >
                  {deleting ? <Loader2Icon size={16} className="animate-spin" /> : 'Delete list'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ListDetail;
