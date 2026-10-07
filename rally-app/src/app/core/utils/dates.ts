export const MONTH_NAMES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre',
  'Octubre', 'Noviembre', 'Diciembre'];

/** "2026-02-19" -> "19 feb" (sin pasar por Date para evitar corrimientos de zona horaria) */
export function shortDate(iso: string): string {
  const [, month, day] = iso.split('-').map(Number);
  return `${day} ${MONTH_NAMES[month - 1].substring(0, 3).toLowerCase()}`;
}

/** "2026-12-15" -> "15 dic 2026" */
export function mediumDate(iso: string): string {
  return `${shortDate(iso)} ${iso.split('-')[0]}`;
}

/** "2026-12-15" -> "15 de diciembre de 2026" */
export function longDate(iso: string): string {
  const [year, month, day] = iso.split('-').map(Number);
  return `${day} de ${MONTH_NAMES[month - 1].toLowerCase()} de ${year}`;
}

/** Fecha local de hoy como AAAA-MM-DD (el formato de un input type=date) */
export function todayIso(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
