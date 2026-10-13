import type { Activity, Notification, Review } from '../types/social';

export const activity: Activity[] = [
  {
    id: 'a1',
    userId: 'jonah',
    kind: 'review',
    filmId: '872585', // Oppenheimer
    rating: 5,
    text: 'A monumental achievement in cinematic biography. The auditory landscape and tension in the final act are completely overwhelming. Christopher Nolan operates at the absolute peak of his craft.',
    time: '2h',
    likes: 48,
    comments: 6,
  },
  {
    id: 'a2',
    userId: 'ines',
    kind: 'watched',
    filmId: '438631', // Dune
    rating: 4.5,
    time: '3h',
    likes: 19,
    comments: 2,
  },
  {
    id: 'a3',
    userId: 'hana',
    kind: 'review',
    filmId: '496243', // Parasite
    rating: 5,
    text: 'Every single frame is constructed with millimeter precision. Bong Joon-ho transitions from dark comedy to psychological horror without missing a single beat.',
    time: '5h',
    likes: 81,
    comments: 11,
  },
  {
    id: 'a4',
    userId: 'theo',
    kind: 'list',
    list: {
      title: 'Modern Masterpieces of the 2020s',
      filmIds: ['872585', '438631', '496243'],
      filmCount: 3,
    },
    time: '8h',
    likes: 112,
    comments: 14,
  },
  {
    id: 'a5',
    userId: 'leo',
    kind: 'review',
    filmId: '157336', // Interstellar
    rating: 4.5,
    text: 'Hans Zimmer’s pipe organ reverberates right through the ribs. Love as a physical dimension transcending time and space.',
    time: '12h',
    likes: 67,
    comments: 9,
  },
  {
    id: 'a6',
    userId: 'ada',
    kind: 'watched',
    filmId: '27205', // Inception
    rating: 4.5,
    rewatch: true,
    time: '1d',
    likes: 32,
    comments: 4,
  },
];

export const reviews: Review[] = [
  {
    id: 'r1',
    filmId: '872585',
    userId: 'hana',
    rating: 5,
    text: 'A masterpiece of dread and momentum. Watch it on the largest screen with the best sound system possible.',
    likes: 312,
    date: 'Oct 10',
  },
  {
    id: 'r2',
    filmId: '438631',
    userId: 'jonah',
    rating: 4.5,
    text: 'Grand sci-fi opera done right. Greig Fraser’s cinematography turns sand dunes into abstract art.',
    likes: 140,
    date: 'Oct 08',
  },
  {
    id: 'r3',
    filmId: '496243',
    userId: 'leo',
    rating: 5,
    text: 'Bong Joon-ho’s staircase sequence alone deserves an essay. Unforgettable cinema.',
    likes: 94,
    date: 'Oct 04',
  },
];

export const notifications: Notification[] = [
  { id: 'n1', userId: 'jonah', text: 'liked your review of Oppenheimer', filmId: '872585', time: '12m', unread: true },
  { id: 'n2', userId: 'ines', text: 'started following you', time: '1h', unread: true },
  { id: 'n3', userId: 'theo', text: 'added Dune to “Sci-Fi Visions”', filmId: '438631', time: '8h', unread: false },
  { id: 'n4', userId: 'hana', text: 'replied to your comment on Parasite', filmId: '496243', time: '1d', unread: false },
];
