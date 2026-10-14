export const AVATAR_TONES = [
  '#4A3418',
  '#1F3140',
  '#3A2438',
  '#223628',
  '#402626',
  '#2C2C3A',
  '#3A3320',
];

export const getInitials = (name?: string): string => {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const getTone = (nameOrId?: string): string => {
  if (!nameOrId) return AVATAR_TONES[0];
  let hash = 0;
  for (let i = 0; i < nameOrId.length; i++) {
    hash = nameOrId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_TONES.length;
  return AVATAR_TONES[index];
};

export interface UiUser {
  id: string;
  _id: string;
  name: string;
  username: string;
  handle: string;
  initials: string;
  tone: string;
  avatar?: string;
  bio?: string;
  location?: string;
}

export const formatUserForUi = (user?: {
  id?: string;
  _id?: string;
  name?: string;
  username?: string;
  avatar?: string;
  bio?: string;
  location?: string;
}): UiUser => {
  if (!user) {
    return {
      id: 'anonymous',
      _id: 'anonymous',
      name: 'Anonymous',
      username: 'user',
      handle: 'user',
      initials: 'AN',
      tone: AVATAR_TONES[0],
    };
  }

  const id = user.id || user._id || 'user';
  const name = user.name || 'Anonymous';
  const username = user.username || 'user';

  return {
    id,
    _id: id,
    name,
    username,
    handle: username,
    initials: getInitials(name),
    tone: user.avatar && user.avatar.startsWith('#') ? user.avatar : getTone(name || id),
    avatar: user.avatar || '',
    bio: user.bio || '',
    location: user.location || '',
  };
};
