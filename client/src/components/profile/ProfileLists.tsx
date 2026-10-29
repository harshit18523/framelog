import React, { useState } from 'react';
import { LayersIcon, PlusIcon } from 'lucide-react';
import { useLibrary } from '../../contexts/LibraryContext';
import { Button } from '../ui/Button';
import { ListCard } from '../lists/ListCard';
import { CreateListDialog } from '../lists/CreateListDialog';

export function ProfileLists() {
  const { lists } = useLibrary();
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="space-y-6">
      {lists.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-fg-subtle">
            {lists.length} {lists.length === 1 ? 'list' : 'lists'} curated
          </p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setCreateOpen(true)}
            className="gap-1.5"
          >
            <PlusIcon size={14} /> New list
          </Button>
        </div>
      )}

      {lists.length === 0 ? (
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

      <CreateListDialog open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}

export default ProfileLists;