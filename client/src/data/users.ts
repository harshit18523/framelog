import type { User } from '../types/social';

export const currentUser: User = {
  id: 'maya',
  name: 'Maya Lindqvist',
  handle: 'maya',
  initials: 'ML',
  tone: '#4A3418',
  bio: 'Late-night screenings, slow cinema, and anything shot on 35mm. Writing about films the way other people write letters.',
  location: 'Stockholm',
};

export const users: User[] = [
  currentUser,
  { id: 'jonah', name: 'Jonah Park', handle: 'jonahp', initials: 'JP', tone: '#1F3140' },
  { id: 'ines', name: 'Inês Duarte', handle: 'inesd', initials: 'ID', tone: '#3A2438' },
  { id: 'theo', name: 'Theo Okafor', handle: 'theo', initials: 'TO', tone: '#223628' },
  { id: 'hana', name: 'Hana Mori', handle: 'hanamori', initials: 'HM', tone: '#402626' },
  { id: 'leo', name: 'Leo Castellanos', handle: 'leoc', initials: 'LC', tone: '#2C2C3A' },
  { id: 'ada', name: 'Ada Whitfield', handle: 'adaw', initials: 'AW', tone: '#3A3320' },
];

export const profileStats = {
  filmsWatched: 0,
  thisYear: 0,
  yearlyGoal: 100,
  lists: 4,
  averageRating: 0,
  followers: 24,
  following: 12,
};
