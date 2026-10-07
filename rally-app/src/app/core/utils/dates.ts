export const MONTH_NAMES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre',
  'Octubre', 'Noviembre', 'Diciembre'];

/** "2026-02-19" -> "19 feb" (sin pasar por Date para evitar corrimientos de zona horaria) */
export function shortDate(iso: string): string {
  const [, month, day] = iso.split('-').map(Number);
  return `${day} ${MONTH_NAMES[month - 1].substring(0, 3).toLowerCase()}`;
}
