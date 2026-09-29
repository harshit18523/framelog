import type { DiaryEntry } from '../types/film';
import type { FilmList } from '../types/social';

export const initialDiary: DiaryEntry[] = [
{
  id: 'd1',
  filmId: 'the-quiet-hours',
  date: '2026-09-27',
  rating: 4.5,
  liked: true,
  rewatch: false,
  review:
  'Watched it alone at 1am, which is the only correct way. Ingrid Vale’s face does more in a single close-up than most films manage in two hours.'
},
{ id: 'd2', filmId: 'nocturne-for-tokyo', date: '2026-09-24', rating: 4, liked: false, rewatch: false },
{ id: 'd3', filmId: 'low-orbit', date: '2026-09-21', rating: 4, liked: false, rewatch: true },
{
  id: 'd4',
  filmId: 'heatwave-1987',
  date: '2026-09-18',
  rating: 3.5,
  liked: false,
  rewatch: false,
  review: 'Sun-bleached and sweet. Slight, but the soundtrack carries it all the way to the deep end.'
},
{ id: 'd5', filmId: 'saint-agnes', date: '2026-09-14', rating: 4.5, liked: true, rewatch: false },
{ id: 'd6', filmId: 'nightfall-marrow', date: '2026-09-09', rating: 3, liked: false, rewatch: false },
{
  id: 'd7',
  filmId: 'velvet-static',
  date: '2026-09-03',
  rating: 4,
  liked: false,
  rewatch: false,
  review: 'Rosa Varga sings the final number in one unbroken take and the whole cinema forgot to breathe.'
},
{
  id: 'd8',
  filmId: 'the-long-field',
  date: '2026-08-29',
  rating: 5,
  liked: true,
  rewatch: false,
  review:
  'A western with the patience of a prayer. I walked out of the cinema and just stood on the pavement for a while.'
},
{ id: 'd9', filmId: 'undertow', date: '2026-08-22', rating: 4, liked: false, rewatch: false }];


export const initialWatchlist = ['glasshouse', 'paper-moons', 'salt-and-ember'];

export const initialLiked = ['the-quiet-hours', 'saint-agnes', 'the-long-field'];

export const profileLists: FilmList[] = [
{
  id: 'l1',
  title: 'Blue hour cinema',
  description: 'Films that live in the thin light between day and night.',
  filmIds: ['the-quiet-hours', 'nocturne-for-tokyo', 'low-orbit', 'undertow'],
  filmCount: 23,
  likes: 486
},
{
  id: 'l2',
  title: 'Candlelight & dread',
  description: 'Period pieces and folk horror for long autumn evenings.',
  filmIds: ['saint-agnes', 'nightfall-marrow', 'glasshouse', 'salt-and-ember'],
  filmCount: 17,
  likes: 302
},
{
  id: 'l3',
  title: 'Perfect Sunday afternoons',
  description: 'Warm, generous films to watch with the windows open.',
  filmIds: ['paper-moons', 'heatwave-1987', 'the-long-field', 'velvet-static'],
  filmCount: 31,
  likes: 219
},
{
  id: 'l4',
  title: '2026, ranked',
  description: 'Every new release I’ve seen this year, in order. Updated weekly.',
  filmIds: ['nocturne-for-tokyo', 'undertow', 'heatwave-1987', 'nightfall-marrow'],
  filmCount: 42,
  likes: 1204
}];