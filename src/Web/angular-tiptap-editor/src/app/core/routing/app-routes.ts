export const AppRoutePaths = {
  home: '',
  auth: 'auth',
  editor: 'editor',
  login: 'login',
  register: 'register',
  alreadyAuthenticated: 'already-authenticated',
  unavailable: 'unavailable',
  notFound: '**',
} as const;

export const AppRouteUrls = {
  home: '/',
  editor: '/editor',
  authLogin: '/auth/login',
  authRegister: '/auth/register',
  authAlreadyAuthenticated: '/auth/already-authenticated',
  unavailable: '/unavailable',
} as const;
