import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { environment } from '../../../../environments/environment';

import { usersApiEndpoints } from './users-api-endpoints';
import { AuthService } from './users-auth.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const authService = inject(AuthService);
  const token = authService.token();
  const apiBaseUrl = environment.apiBaseUrl.replace(/\/$/, '');

  if (!token || request.headers.has('Authorization') || !request.url.startsWith(apiBaseUrl)) {
    return next(request);
  }

  if (
    request.url.endsWith(usersApiEndpoints.login) ||
    request.url.endsWith(usersApiEndpoints.register) ||
    request.url.endsWith(usersApiEndpoints.logout)
  ) {
    return next(request);
  }

  return next(
    request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    }),
  );
};
