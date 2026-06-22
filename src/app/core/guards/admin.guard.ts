import { inject, Injector } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, firstValueFrom } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const firebaseAuth = inject(Auth);
  const injector = inject(Injector);
  const router = inject(Router);
  await firebaseAuth.authStateReady();
  await firstValueFrom(toObservable(auth.loading, { injector }).pipe(filter(l => !l)));
  if (auth.isAdmin()) return true;
  return router.createUrlTree(['/']);
};
