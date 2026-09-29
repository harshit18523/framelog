export type FeatureVisualKind = 'track' | 'review' | 'discover' | 'connect';

export const features: {
  id: FeatureVisualKind;
  name: string;
  title: string;
  body: string;
}[] = [
{
  id: 'track',
  name: 'Track',
  title: 'A diary that remembers every screening.',
  body: 'Log a film in seconds — the date, the rating, the rewatch, the person beside you. Years from now, your diary reads like a memoir told in films.'
},
{
  id: 'review',
  name: 'Review',
  title: 'Reviews worth reading.',
  body: 'Write as much or as little as the film deserves. Half-star ratings, spoiler shields, and typography that treats your words with the respect they deserve.'
},
{
  id: 'discover',
  name: 'Discover',
  title: 'Recommendations with taste.',
  body: 'No algorithmic noise. Find your next favourite through the people whose taste you trust, and a quiet engine that learns what actually moves you.'
},
{
  id: 'connect',
  name: 'Connect',
  title: 'Film is better shared.',
  body: 'Follow friends, critics and cinephiles. See what they’re watching tonight — and argue about it over coffee tomorrow.'
}];


export const footerColumns = [
{ title: 'Product', links: ['Diary', 'Lists', 'Discover', 'FrameLog Pro', 'Apps'] },
{ title: 'Community', links: ['Members', 'Journal', 'Film clubs', 'Guidelines'] },
{ title: 'Company', links: ['About', 'Careers', 'Press', 'Contact'] }];