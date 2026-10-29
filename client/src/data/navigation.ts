import {
  BookOpenIcon,
  CompassIcon,
  HomeIcon,
  LayersIcon,
  MessageSquareIcon,
  UserRoundIcon,
} from 'lucide-react';

export const appNavigation = [
  { id: 'home', label: 'Home', to: '/app', icon: HomeIcon },
  { id: 'discover', label: 'Discover', to: '/app/discover', icon: CompassIcon },
  { id: 'diary', label: 'Diary', to: '/app/diary', icon: BookOpenIcon },
  { id: 'chats', label: 'Chats', to: '/app/chats', icon: MessageSquareIcon },
  { id: 'lists', label: 'Lists', to: '/app/lists', icon: LayersIcon },
  { id: 'profile', label: 'Profile', to: '/app/profile', icon: UserRoundIcon },
] as const;