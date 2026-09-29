import type { Activity, Notification, Review } from '../types/social';

export const activity: Activity[] = [
{
  id: 'a1',
  userId: 'jonah',
  kind: 'review',
  filmId: 'the-long-field',
  rating: 4.5,
  text: 'Calder shoots the prairie like it’s holding its breath. Two and a half hours and I would have stayed for four. The final ride into the dusk is the most quietly devastating shot I’ve seen this year — no score, just wind through the wheat and Clara Weston’s face doing everything.',
  time: '2h',
  likes: 48,
  comments: 6
},
{
  id: 'a2',
  userId: 'ines',
  kind: 'watched',
  filmId: 'low-orbit',
  rating: 4,
  time: '3h',
  likes: 9,
  comments: 0
},
{
  id: 'a3',
  userId: 'hana',
  kind: 'review',
  filmId: 'nocturne-for-tokyo',
  rating: 4,
  text: 'Every frame is wet. Hayashi understands that neon is a kind of loneliness. The plot loosens in the third act but the mood never does.',
  time: '5h',
  likes: 31,
  comments: 3
},
{
  id: 'a4',
  userId: 'theo',
  kind: 'list',
  list: {
    title: 'Films that feel like November',
    filmIds: ['the-quiet-hours', 'undertow', 'nightfall-marrow', 'saint-agnes', 'salt-and-ember'],
    filmCount: 14
  },
  time: '8h',
  likes: 112,
  comments: 14
},
{
  id: 'a5',
  userId: 'leo',
  kind: 'review',
  filmId: 'glasshouse',
  rating: 3,
  text: 'Gorgeous production design, thin as the glass it’s named after. Anand is a director to watch; this script wasn’t worth her.',
  time: '12h',
  likes: 17,
  comments: 9
},
{
  id: 'a6',
  userId: 'ada',
  kind: 'watched',
  filmId: 'paper-moons',
  rating: 4.5,
  rewatch: true,
  time: '1d',
  likes: 12,
  comments: 1
},
{
  id: 'a7',
  userId: 'ines',
  kind: 'review',
  filmId: 'saint-agnes',
  rating: 5,
  text: 'A candle-lit fever dream. I haven’t stopped thinking about the last ten minutes — the way Hollis lets the silence do all the talking, the way the camera refuses to look away from Eleanor Pryce. Masterpiece, and I don’t use that word lightly.',
  time: '1d',
  likes: 204,
  comments: 22
}];


export const reviews: Review[] = [
{
  id: 'r1',
  filmId: 'the-quiet-hours',
  userId: 'hana',
  rating: 5,
  text: 'I have never felt so seen by a film about someone who is almost never seen. Solberg lets whole scenes play out in reflections on the window glass. Watch it alone, late, with the lights off.',
  likes: 312,
  date: 'Sep 26'
},
{
  id: 'r2',
  filmId: 'the-quiet-hours',
  userId: 'jonah',
  rating: 4,
  text: 'The sound design is the real lead. Every conversation drifting up from the street feels like a short film of its own. Slightly too long, entirely worth it.',
  likes: 87,
  date: 'Sep 21'
},
{
  id: 'r3',
  filmId: 'the-quiet-hours',
  userId: 'leo',
  rating: 4.5,
  text: 'Ingrid Vale is extraordinary. A performance built almost entirely out of listening.',
  likes: 54,
  date: 'Sep 12'
},
{
  id: 'r4',
  filmId: 'the-long-field',
  userId: 'jonah',
  rating: 4.5,
  text: 'Calder shoots the prairie like it’s holding its breath. The final ride into the dusk is the most quietly devastating shot I’ve seen this year.',
  likes: 48,
  date: 'Sep 29'
},
{
  id: 'r5',
  filmId: 'the-long-field',
  userId: 'ada',
  rating: 5,
  text: 'A western with the patience of a prayer. Paulo Serrano’s golden-hour photography deserves every award going.',
  likes: 140,
  date: 'Sep 18'
},
{
  id: 'r6',
  filmId: 'nocturne-for-tokyo',
  userId: 'hana',
  rating: 4,
  text: 'Every frame is wet. Hayashi understands that neon is a kind of loneliness.',
  likes: 31,
  date: 'Sep 29'
},
{
  id: 'r7',
  filmId: 'saint-agnes',
  userId: 'ines',
  rating: 5,
  text: 'A candle-lit fever dream. The way Hollis lets the silence do all the talking. Masterpiece.',
  likes: 204,
  date: 'Sep 28'
}];


export const notifications: Notification[] = [
{ id: 'n1', userId: 'jonah', text: 'liked your review of The Quiet Hours', filmId: 'the-quiet-hours', time: '12m', unread: true },
{ id: 'n2', userId: 'ines', text: 'started following you', time: '1h', unread: true },
{ id: 'n3', userId: 'theo', text: 'added Undertow to “Films that feel like November”', filmId: 'undertow', time: '8h', unread: false },
{ id: 'n4', userId: 'hana', text: 'replied to your comment on Nocturne for Tokyo', filmId: 'nocturne-for-tokyo', time: '1d', unread: false }];