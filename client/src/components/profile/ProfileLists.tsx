import React from 'react';
import { LayersIcon, PlusIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../ui/Button';

export function ProfileLists() {
  const handleCreateList = () => {
    toast.info('Lists feature is coming soon!');
  };

  return (
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
        onClick={handleCreateList}
        className="mt-6 gap-1.5"
      >
        <PlusIcon size={15} />
        Create your first list
      </Button>
    </div>
  );
}

export default ProfileLists;