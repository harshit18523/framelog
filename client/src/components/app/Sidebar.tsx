import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogOutIcon, PencilIcon, CheckIcon, XIcon, Loader2Icon } from 'lucide-react';
import { toast } from 'sonner';
import { useLibrary } from '../../contexts/LibraryContext';
import { useAuth } from '../../contexts/AuthContext';
import { appNavigation } from '../../data/navigation';
import { isNavActive } from '../../utils/navigation';
import { updateYearlyGoalApi } from '../../api/users.api';

export function Sidebar() {
  const { pathname, search } = useLocation();
  const { entries } = useLibrary();
  const { user, logout, updateUser } = useAuth();

  const currentYear = new Date().getFullYear();
  const yearlyGoal = user?.yearlyGoal && user.yearlyGoal > 0 ? user.yearlyGoal : 100;
  
  // Count entries for this year (or all entries if year not matching)
  const thisYear = entries.filter((e) => e.date?.startsWith(String(currentYear))).length || entries.length;
  const progress = Math.min(100, Math.round((thisYear / yearlyGoal) * 100));
  const remaining = Math.max(0, yearlyGoal - thisYear);

  // Edit goal state
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState(String(yearlyGoal));
  const [savingGoal, setSavingGoal] = useState(false);

  const handleSaveGoal = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const parsed = parseInt(goalInput.trim(), 10);
    if (isNaN(parsed) || parsed < 1) {
      toast.error('Please enter a goal of at least 1 film');
      return;
    }
    if (parsed > 10000) {
      toast.error('Goal cannot exceed 10,000 films');
      return;
    }

    setSavingGoal(true);
    try {
      const res = await updateYearlyGoalApi(parsed);
      updateUser({ yearlyGoal: res.yearlyGoal });
      toast.success(`Goal updated to ${res.yearlyGoal} films for ${currentYear}!`);
      setIsEditingGoal(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to update goal');
    } finally {
      setSavingGoal(false);
    }
  };

  return (
    <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-60 shrink-0 flex-col border-r border-line px-4 py-6 lg:flex">
      <nav aria-label="Primary">
        <ul className="space-y-0.5">
          {appNavigation.map((item) => {
            const active = isNavActive(item.id, pathname, search);
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <Link
                  to={item.to}
                  aria-current={active ? 'page' : undefined}
                  className={`flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 ${
                    active ? 'bg-white/[0.07] text-fg' : 'text-fg-subtle hover:bg-white/[0.04] hover:text-fg'
                  }`}
                >
                  <Icon size={18} strokeWidth={active ? 2.1 : 1.75} className={active ? 'text-gold' : ''} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mt-auto px-3">
        {/* Yearly Goal Section */}
        {isEditingGoal ? (
          <form onSubmit={handleSaveGoal} className="rounded-xl bg-white/[0.04] p-2.5 ring-1 ring-gold/40">
            <p className="text-[11px] font-medium text-fg-muted">{currentYear} film target:</p>
            <div className="mt-1.5 flex items-center gap-1.5">
              <input
                type="number"
                min={1}
                max={10000}
                autoFocus
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setIsEditingGoal(false);
                }}
                disabled={savingGoal}
                className="h-7 w-full rounded-lg bg-surface px-2 text-xs font-semibold tabular-nums text-fg ring-1 ring-line focus:outline-none focus:ring-gold/60"
              />
              <button
                type="submit"
                disabled={savingGoal}
                title="Save goal"
                className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-gold text-canvas hover:bg-gold-light transition-colors disabled:opacity-50"
              >
                {savingGoal ? <Loader2Icon size={13} className="animate-spin" /> : <CheckIcon size={13} />}
              </button>
              <button
                type="button"
                disabled={savingGoal}
                onClick={() => setIsEditingGoal(false)}
                title="Cancel"
                className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-fg-subtle hover:bg-white/[0.06] hover:text-fg transition-colors"
              >
                <XIcon size={13} />
              </button>
            </div>
          </form>
        ) : (
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <p className="text-xs text-fg-subtle">{currentYear} goal</p>
                <button
                  type="button"
                  onClick={() => {
                    setGoalInput(String(yearlyGoal));
                    setIsEditingGoal(true);
                  }}
                  title="Edit yearly film goal"
                  aria-label="Edit yearly film goal"
                  className="grid h-5 w-5 place-items-center rounded-md text-fg-subtle hover:bg-white/[0.08] hover:text-gold transition-colors"
                >
                  <PencilIcon size={11} />
                </button>
              </div>
              <p className="text-xs tabular-nums text-fg-muted">
                <span className="font-semibold text-fg">{thisYear}</span> / {yearlyGoal}
              </p>
            </div>
            <div
              className="mt-2.5 h-1 overflow-hidden rounded-full bg-white/[0.07]"
              role="progressbar"
              aria-label="Yearly film goal"
              aria-valuenow={thisYear}
              aria-valuemin={0}
              aria-valuemax={yearlyGoal}
            >
              <div
                className="h-full rounded-full bg-gold transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-2.5 text-xs leading-relaxed text-fg-faint">
              {remaining > 0 ? `${remaining} films to go — keep logging!` : 'Goal reached! 🎉 Fantastic watching!'}
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={logout}
          className="mt-6 flex h-9 w-full items-center gap-2.5 rounded-xl px-2.5 text-xs font-medium text-fg-subtle hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
        >
          <LogOutIcon size={15} />
          Sign out
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
