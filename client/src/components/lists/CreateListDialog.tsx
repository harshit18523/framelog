import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2Icon, XIcon, ImageIcon, UsersIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useLibrary } from '../../contexts/LibraryContext';
import { Button } from '../ui/Button';
import { TextField } from '../ui/TextField';
import type { UserList } from '../../types/list';

type CreateListDialogProps = {
  open: boolean;
  onClose: () => void;
  initialData?: UserList | null;
  onSuccess?: (list: UserList) => void;
};

const ease = [0.23, 1, 0.32, 1] as const;
const MAX_DESC = 500;

export function CreateListDialog({
  open,
  onClose,
  initialData,
  onSuccess,
}: CreateListDialogProps) {
  const { createList, updateList } = useLibrary();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [isCollaborative, setIsCollaborative] = useState(false);
  const [error, setError] = useState<string>();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (initialData) {
      setName(initialData.name);
      setDescription(initialData.description || '');
      setCoverImage(initialData.coverImage || '');
      setIsCollaborative(Boolean(initialData.isCollaborative));
    } else {
      setName('');
      setDescription('');
      setCoverImage('');
      setIsCollaborative(false);
    }
    setError(undefined);
    setSaving(false);
  }, [open, initialData]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('List name is required');
      return;
    }

    setSaving(true);
    setError(undefined);

    try {
      if (initialData) {
        const updated = await updateList(initialData.id || initialData._id!, {
          name: name.trim(),
          description: description.trim(),
          coverImage: coverImage.trim(),
          isCollaborative,
        });
        toast.success('List updated');
        onSuccess?.(updated);
      } else {
        const created = await createList({
          name: name.trim(),
          description: description.trim(),
          coverImage: coverImage.trim(),
          isCollaborative,
        });
        toast.success('List created');
        onSuccess?.(created);
      }
      onClose();
    } catch (err: any) {
      console.error('[CreateListDialog] Error:', err);
      toast.error(err.message || 'Failed to save list');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-3 sm:items-center sm:p-6">
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease }}
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="list-dialog-title"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.26, ease }}
            className="relative flex max-h-[calc(100vh-24px)] w-full max-w-[540px] flex-col overflow-hidden rounded-[24px] bg-surface-raised/95 shadow-elevated ring-1 ring-line-strong backdrop-blur-2xl sm:max-h-[calc(100vh-48px)]"
          >
            {/* Top gold accent hairline */}
            <div
              aria-hidden
              className="absolute inset-x-0 top-0 z-20 h-px"
              style={{
                background:
                  'linear-gradient(90deg, transparent, rgba(245,166,35,0.9), transparent)',
              }}
            />

            {/* Header */}
            <div className="flex items-start justify-between border-b border-line px-6 py-5 sm:px-8">
              <div>
                <h2
                  id="list-dialog-title"
                  className="text-lg font-semibold text-fg"
                >
                  {initialData ? 'Edit list' : 'Create new list'}
                </h2>
                <p className="mt-0.5 text-xs text-fg-subtle">
                  Curate a selection of films around a theme, director, or marathon.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="grid h-8 w-8 place-items-center rounded-full bg-white/[0.04] text-fg-subtle ring-1 ring-inset ring-line transition-colors hover:bg-white/[0.08] hover:text-fg"
              >
                <XIcon size={16} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
              <TextField
                label="Name"
                placeholder="e.g. 70s Psychological Thrillers"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError(undefined);
                }}
                error={error}
                autoFocus
                required
              />

              <label className="block">
                <span className="mb-2 flex items-center justify-between text-[13px] font-medium text-fg-muted">
                  Description
                  <span
                    className={`text-xs tabular-nums ${
                      description.length > MAX_DESC - 30 ? 'text-gold' : 'text-fg-faint'
                    }`}
                  >
                    {description.length} / {MAX_DESC}
                  </span>
                </span>
                <textarea
                  value={description}
                  maxLength={MAX_DESC}
                  rows={3}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What is this list about? Add some context or ranking criteria..."
                  className="w-full resize-none rounded-xl bg-white/[0.04] px-4 py-3 text-[15px] leading-relaxed text-fg ring-1 ring-inset ring-line-strong placeholder:text-fg-faint transition-[box-shadow,background-color] duration-150 focus:bg-white/[0.06] focus:outline-none focus:ring-gold/60"
                />
              </label>

              <TextField
                label="Cover image URL (optional)"
                placeholder="https://..."
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                hint="Leave empty to use the poster of the first film in the list."
              />

              {/* Collaborative toggle */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => setIsCollaborative((v) => !v)}
                onKeyDown={(e) => e.key === 'Enter' && setIsCollaborative((v) => !v)}
                className="flex cursor-pointer items-start justify-between gap-4 rounded-xl bg-white/[0.03] p-4 ring-1 ring-inset ring-line transition-colors hover:bg-white/[0.06]"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gold/10 text-gold">
                    <UsersIcon size={15} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-fg">Collaborative list</p>
                    <p className="mt-0.5 text-xs text-fg-subtle leading-relaxed">
                      Invite friends to add and remove films together.
                    </p>
                  </div>
                </div>
                {/* Toggle pill */}
                <div
                  className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ${
                    isCollaborative ? 'bg-gold' : 'bg-white/10'
                  }`}
                >
                  <div
                    className={`absolute top-[3px] h-[18px] w-[18px] rounded-full bg-white shadow-sm transition-transform duration-200 ${
                      isCollaborative ? 'translate-x-[22px]' : 'translate-x-[3px]'
                    }`}
                  />
                </div>
              </div>

              {coverImage && (
                <div className="relative h-28 overflow-hidden rounded-xl ring-1 ring-line">
                  <img
                    src={coverImage}
                    alt="Cover preview"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <span className="absolute bottom-2 left-3 flex items-center gap-1.5 text-xs text-white/80">
                    <ImageIcon size={13} /> Cover preview
                  </span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-line">
                <Button variant="ghost" onClick={onClose} disabled={saving}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!name.trim() || saving}
                  className="min-w-[120px] bg-gold text-canvas hover:bg-gold-light font-semibold"
                >
                  {saving ? (
                    <Loader2Icon size={16} className="animate-spin" />
                  ) : initialData ? (
                    'Save changes'
                  ) : (
                    'Create list'
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default CreateListDialog;
