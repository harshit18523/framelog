export function isNavActive(id: string, pathname: string, search: string): boolean {
  const tab = new URLSearchParams(search).get('tab');
  switch (id) {
    case 'home':
      return pathname === '/app' || pathname === '/app/';
    case 'discover':
      return pathname.startsWith('/app/discover');
    case 'diary':
      return pathname.startsWith('/app/diary');
    case 'chats':
      return pathname.startsWith('/app/chats');
    case 'lists':
      return pathname.startsWith('/app/profile') && tab === 'lists';
    case 'profile':
      return pathname.startsWith('/app/profile') && tab !== 'lists';
    default:
      return false;
  }
}