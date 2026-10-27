import React, { useEffect, useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2Icon, XIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { TextField } from '../ui/TextField';
import { AvatarEditor } from './AvatarEditor';
import { PhoneVerificationField } from './PhoneVerificationField';
import { isPhoneValidForCountry } from '../../utils/phone';
import { updateUserProfileApi, UserProfileData } from '../../api/users.api';
import { getAllCachedFilms } from '../../utils/films';

type EditProfileDialogProps = {
  open: boolean;
  onClose: () => void;
  profile?: UserProfileData | null;
  onProfileUpdated?: (updated: UserProfileData) => void;
};

interface ProfileFormState {
  name: string;
  username: string;
  bio: string;
  age: string;
  location: string;
  avatar: string;
  email: string;
  phone: string;
  phoneCountry: string;
}

type FormErrors = Partial<Record<keyof ProfileFormState, string>>;

const ease = [0.23, 1, 0.32, 1] as const;
const MAX_BIO = 160;

export function EditProfileDialog({
  open,
  onClose,
  profile,
  onProfileUpdated,
}: EditProfileDialogProps) {
  const { user: authUser, updateUser } = useAuth();

  // Combine authUser and profile to build initial state
  const initialData = useMemo<ProfileFormState>(() => {
    return {
      name: profile?.name || authUser?.name || '',
      username: profile?.username || authUser?.username || '',
      bio: profile?.bio || authUser?.bio || '',
      age: profile?.age !== undefined
        ? String(profile.age)
        : authUser?.age !== undefined
        ? String(authUser.age)
        : '',
      location: profile?.location || authUser?.location || '',
      avatar: profile?.avatar || authUser?.avatar || '',
      email: profile?.email || authUser?.email || '',
      phone: profile?.phone || authUser?.phone || '',
      phoneCountry: profile?.phoneCountry || authUser?.phoneCountry || 'IN',
    };
  }, [profile, authUser]);

  const [draft, setDraft] = useState<ProfileFormState>(initialData);
  // Keep track of the verified phone number string: `${country}${phone}`
  const initialVerifiedPhoneKey = useMemo(() => {
    const isInitiallyVerified = profile?.phoneVerified ?? authUser?.phoneVerified;
    if (isInitiallyVerified && initialData.phone) {
      return `${initialData.phoneCountry}${initialData.phone}`;
    }
    return '';
  }, [profile?.phoneVerified, authUser?.phoneVerified, initialData.phoneCountry, initialData.phone]);

  const [verifiedPhone, setVerifiedPhone] = useState<string>(initialVerifiedPhoneKey);
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);

  // Cached backdrop image
  const cachedFilms = getAllCachedFilms();
  const banner =
    cachedFilms.find((f) => f.backdrop)?.backdrop ||
    'https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?q=80&w=1200&auto=format&fit=crop';

  useEffect(() => {
    if (!open) return;
    setDraft(initialData);
    setVerifiedPhone(initialVerifiedPhoneKey);
    setErrors({});
    setSaving(false);
  }, [open, initialData, initialVerifiedPhoneKey]);

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

  const setField = <K extends keyof ProfileFormState>(key: K, value: ProfileFormState[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const isPhoneChanged = draft.phone !== initialData.phone || draft.phoneCountry !== initialData.phoneCountry;
  const isPhoneCurrentlyVerified = Boolean(
    draft.phone && verifiedPhone === `${draft.phoneCountry}${draft.phone}`
  );

  const dirty = JSON.stringify(draft) !== JSON.stringify(initialData);

  const handleSave = async () => {
    const nextErrors: FormErrors = {};

    if (!draft.name.trim()) {
      nextErrors.name = 'Your name cannot be empty.';
    }

    if (draft.username.trim().length < 3) {
      nextErrors.username = 'Usernames need at least 3 characters.';
    } else if (!/^[a-z0-9_]+$/.test(draft.username.trim())) {
      nextErrors.username = 'Username can only contain letters, numbers, and underscores.';
    }

    if (draft.age) {
      const parsedAge = Number(draft.age);
      if (isNaN(parsedAge) || parsedAge < 1 || parsedAge > 120) {
        nextErrors.age = 'Enter an age between 1 and 120.';
      }
    }

    if (!draft.email.trim() || !/^\S+@\S+\.\S+$/.test(draft.email.trim())) {
      nextErrors.email = 'Enter a valid email address.';
    }

    // Phone validation
    if (draft.phone.trim()) {
      const isValid = isPhoneValidForCountry(draft.phone, draft.phoneCountry);
      if (!isValid) {
        nextErrors.phone = `Enter a valid mobile number for ${draft.phoneCountry}.`;
      } else if (isPhoneChanged && !isPhoneCurrentlyVerified) {
        nextErrors.phone = 'Verify this number with a one-time code before saving.';
      }
    }

    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) {
      return;
    }

    setSaving(true);

    try {
      const updatedUser = await updateUserProfileApi({
        name: draft.name.trim(),
        username: draft.username.trim().toLowerCase(),
        bio: draft.bio.trim(),
        age: draft.age ? Number(draft.age) : undefined,
        location: draft.location.trim(),
        avatar: draft.avatar,
        email: draft.email.trim().toLowerCase(),
        phone: draft.phone.trim(),
        phoneCountry: draft.phoneCountry,
        phoneVerified: draft.phone.trim() ? isPhoneCurrentlyVerified : false,
      });

      // Update auth context
      updateUser({
        name: updatedUser.name,
        username: updatedUser.username,
        bio: updatedUser.bio,
        location: updatedUser.location,
        avatar: updatedUser.avatar,
        email: updatedUser.email,
        age: updatedUser.age,
        phone: updatedUser.phone,
        phoneCountry: updatedUser.phoneCountry,
        phoneVerified: updatedUser.phoneVerified,
      });

      // Update parent profile if callback provided
      if (onProfileUpdated && profile) {
        onProfileUpdated({
          ...profile,
          name: updatedUser.name,
          username: updatedUser.username,
          bio: updatedUser.bio,
          location: updatedUser.location,
          avatar: updatedUser.avatar,
          age: updatedUser.age,
          email: updatedUser.email,
          phone: updatedUser.phone,
          phoneCountry: updatedUser.phoneCountry,
          phoneVerified: updatedUser.phoneVerified,
        });
      }

      toast.success('Profile updated');
      onClose();
    } catch (err: any) {
      console.error('[EditProfileDialog] Save error:', err);
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const activeUserForAvatar = {
    name: draft.name || authUser?.name || 'User',
    initials: (draft.name || authUser?.name || 'U').slice(0, 2).toUpperCase(),
    tone: authUser?.tone || '#4A3418',
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-3 sm:items-center sm:p-6">
          <motion.div
            className="absolute inset-0 bg-black/65 backdrop-blur-sm"
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
            aria-labelledby="edit-profile-title"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.26, ease }}
            className="relative flex max-h-[calc(100vh-24px)] w-full max-w-[580px] flex-col overflow-hidden rounded-[28px] bg-surface-raised/95 shadow-elevated ring-1 ring-line-strong backdrop-blur-2xl sm:max-h-[calc(100vh-48px)]"
          >
            {/* Top gold accent hairline */}
            <div
              aria-hidden
              className="absolute inset-x-0 top-0 z-20 h-px"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(245,166,35,0.9), transparent)' }}
            />

            <div className="overflow-y-auto">
              <div className="relative h-36 overflow-hidden">
                {banner && <img src={banner} alt="" className="absolute inset-0 h-full w-full object-cover" />}
                <div className="absolute inset-0 bg-black/45" aria-hidden />
                <div
                  aria-hidden
                  className="absolute inset-0"
                  style={{
                    background:
                      'radial-gradient(120% 90% at 50% 100%, rgba(24,24,27,1) 18%, rgba(24,24,27,0.6) 50%, rgba(245,166,35,0.12) 100%)',
                  }}
                />
                <div className="relative flex items-start justify-between p-5">
                  <div>
                    <h2 id="edit-profile-title" className="text-[15px] font-semibold text-fg">
                      Edit profile
                    </h2>
                    <p className="mt-0.5 text-xs text-white/60">How you appear across FrameLog</p>
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close"
                    className="grid h-9 w-9 place-items-center rounded-full bg-black/40 text-fg ring-1 ring-inset ring-white/10 backdrop-blur-md transition-colors hover:bg-black/60"
                  >
                    <XIcon size={16} />
                  </button>
                </div>
              </div>

              <div className="relative -mt-16 px-6 sm:px-8">
                <AvatarEditor
                  user={activeUserForAvatar}
                  photo={draft.avatar}
                  onChange={(photo) => setField('avatar', photo || '')}
                />
              </div>

              <div className="space-y-9 px-6 pb-8 pt-8 sm:px-8">
                <fieldset className="space-y-5">
                  <legend className="mb-5 text-xs font-medium text-fg-subtle">Public profile</legend>
                  <TextField
                    label="Name"
                    autoComplete="name"
                    value={draft.name}
                    onChange={(e) => setField('name', e.target.value)}
                    error={errors.name}
                  />
                  <TextField
                    label="Username"
                    prefix="framelog.com/"
                    value={draft.username}
                    onChange={(e) =>
                      setField('username', e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))
                    }
                    error={errors.username}
                  />
                  <label className="block">
                    <span className="mb-2 flex items-center justify-between text-[13px] font-medium text-fg-muted">
                      Bio
                      <span
                        className={`text-xs tabular-nums ${
                          draft.bio.length > MAX_BIO - 20 ? 'text-gold' : 'text-fg-faint'
                        }`}
                      >
                        {draft.bio.length} / {MAX_BIO}
                      </span>
                    </span>
                    <textarea
                      value={draft.bio}
                      maxLength={MAX_BIO}
                      rows={3}
                      onChange={(e) => setField('bio', e.target.value)}
                      placeholder="Late-night screenings, slow cinema, and anything shot on 35mm..."
                      className="w-full resize-none rounded-xl bg-white/[0.04] px-4 py-3 text-[15px] leading-relaxed text-fg ring-1 ring-inset ring-line-strong placeholder:text-fg-faint transition-[box-shadow,background-color] duration-150 focus:bg-white/[0.06] focus:outline-none focus:ring-gold/60"
                    />
                  </label>
                  <div className="grid grid-cols-[110px_minmax(0,1fr)] gap-4">
                    <TextField
                      label="Age"
                      inputMode="numeric"
                      value={draft.age}
                      onChange={(e) => setField('age', e.target.value.replace(/\D/g, '').slice(0, 3))}
                      error={errors.age}
                    />
                    <TextField
                      label="Location"
                      value={draft.location}
                      onChange={(e) => setField('location', e.target.value)}
                    />
                  </div>
                </fieldset>

                <div className="h-px bg-line" aria-hidden />

                <fieldset className="space-y-5">
                  <legend className="mb-5 text-xs font-medium text-fg-subtle">Private contact details</legend>
                  <TextField
                    label="Email address"
                    type="email"
                    autoComplete="email"
                    value={draft.email}
                    onChange={(e) => setField('email', e.target.value)}
                    error={errors.email}
                  />
                  <PhoneVerificationField
                    country={draft.phoneCountry}
                    phone={draft.phone}
                    verified={isPhoneCurrentlyVerified}
                    error={errors.phone}
                    onCountryChange={(v) => setField('phoneCountry', v)}
                    onPhoneChange={(v) => setField('phone', v)}
                    onVerified={() => {
                      setVerifiedPhone(`${draft.phoneCountry}${draft.phone}`);
                      setErrors((prev) => ({ ...prev, phone: undefined }));
                      toast.success('Mobile number verified');
                    }}
                  />
                </fieldset>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-line bg-surface-raised/90 px-6 py-4 sm:px-8">
              <p className="hidden text-xs text-fg-faint sm:block">
                {dirty ? 'You have unsaved changes' : 'No changes yet'}
              </p>
              <div className="flex w-full gap-2 sm:w-auto">
                <Button variant="ghost" onClick={onClose} className="flex-1 sm:flex-none">
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={!dirty || saving || (isPhoneChanged && Boolean(draft.phone) && !isPhoneCurrentlyVerified)}
                  className="min-w-[140px] flex-1 sm:flex-none bg-gold text-canvas hover:bg-gold-light font-semibold"
                >
                  {saving ? <Loader2Icon size={16} className="animate-spin" /> : 'Save changes'}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default EditProfileDialog;
