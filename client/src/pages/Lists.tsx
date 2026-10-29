import React, { useState } from 'react';
import { LayersIcon, PlusIcon, Loader2Icon } from 'lucide-react';
import { useLibrary } from '../contexts/LibraryContext';
import { Button } from '../components/ui/Button';
import { ListCard } from '../components/lists/ListCard';
import { CreateListDialog } from '../components/lists/CreateListDialog';

export function Lists() {
  const { lists, listsLoading } = useLibrary();
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 lg:px-12 lg:py-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-display sm:text-4xl">Lists</h1>
          <p className="mt-1 text-sm text-fg-subtle">
            Curate lists of your favourite films, marathons, or themes to share with other cinephiles.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setCreateOpen(true)}
          className="gap-1.5 self-start sm:self-auto bg-gold text-canvas hover:bg-gold-light font-semibold"
        >
          <PlusIcon size={16} />
          Create new list
        </Button>
      </div>

      {/* Content */}
      <div className="mt-8">
        {listsLoading && lists.length === 0 ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2Icon size={24} className="animate-spin text-gold" />
          </div>
        ) : lists.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line-strong px-6 py-20 text-center">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/[0.04] text-gold ring-1 ring-line">
              <LayersIcon size={26} />
            </div>
            <h3 className="mt-4 text-base font-semibold text-fg">No lists created yet</h3>
            <p className="mt-1.5 max-w-sm text-sm text-fg-subtle">
              Curate lists of your favourite films, marathons, or themes to share with other cinephiles.
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setCreateOpen(true)}
              className="mt-6 gap-1.5 bg-gold text-canvas hover:bg-gold-light font-semibold"
            >
              <PlusIcon size={15} />
              Create your first list
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {lists.map((list) => (
              <ListCard key={list.id || list._id} list={list} />
            ))}
          </div>
        )}
      </div>

      <CreateListDialog open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}

export default Lists;
