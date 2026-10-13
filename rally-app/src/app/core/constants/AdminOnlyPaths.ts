/**
 * Pantallas sólo para el perfil administrador (Consultores y todos los catálogos).
 * Es lo mismo que el backend protege en lectura (ver ADMIN_ONLY_READ en rally-back/auth.py).
 */
export const ADMIN_ONLY_SECTIONS = ['consultants', 'teams', 'consulting-firms', 'certification-types', 'certifications', 'org-structure'];

export const ADMIN_ONLY_NOTICE = 'Esta sección es solo para el perfil administrador. Inicia sesión para entrar.';

/** ¿Esta URL ("/app/consultants", "/app/teams?x=1"...) es una pantalla de administrador? */
export function isAdminOnlyUrl(url: string): boolean {
  const [path] = url.split(/[?#]/);
  const [, app, section] = path.split('/');
  return app === 'app' && ADMIN_ONLY_SECTIONS.includes(section);
}
