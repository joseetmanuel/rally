import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ADMIN_ONLY_NOTICE } from '@constants/AdminOnlyPaths';
import { AdminSessionService } from '@services/admin-session/admin-session.service';

/**
 * Protege las pantallas de administrador (Consultores y catálogos): el perfil público vuelve al inicio con un aviso.
 * La seguridad real la impone el backend; esto evita llegar a una pantalla vacía por escribir la dirección a mano.
 */
export const adminGuard: CanActivateFn = () => {
  const admin = inject(AdminSessionService);
  if (admin.isAdmin()) return true;
  admin.notify(ADMIN_ONLY_NOTICE);
  return inject(Router).createUrlTree(['/app/home']);
};
