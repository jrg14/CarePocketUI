export const usersApiEndpoints = {
  login: '/api/v1/auth/jwt/login',
  logout: '/api/v1/auth/jwt/logout',
  register: '/api/v1/auth/register',
  me: '/api/v1/users/me',
  ledgerSummary: '/api/v1/ledgers/summary',
} as const;
