export const AppRoutePaths = {
  home: '',
  auth: 'auth',
  editor: 'editor',
  login: 'login',
  register: 'register',
  notFound: '**',
} as const;

export const AppRouteUrls = {
  home: '/',
  editor: '/editor',
  authLogin: '/auth/login',
  authRegister: '/auth/register',
} as const;
