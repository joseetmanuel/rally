/**
 * Rostros de los participantes (recortados, sin fondo) para el avatar del ranking y del detalle.
 *
 * Cada archivo vive en `assets/imgs/faces/<nombre-normalizado>.webp`, donde el nombre es el nombre completo del
 * participante sin acentos, en minúsculas y con guiones. Quien no está en esta lista conserva sus iniciales.
 * Al dar de alta a alguien con foto: agregar el archivo y su nombre normalizado aquí.
 */
export const FACE_SLUGS: ReadonlySet<string> = new Set([
  'alfredo-cuevas-barrera',
  'angel-cesar-gasca-martinez',
  'angel-ramon-gomez-bahena',
  'antonio-hernandez-neri',
  'brayan-efrain-del-angel-martinez',
  'carlos-guadalupe-de-la-cruz',
  'david-hernandez-madrigal',
  'david-ortiz-de-jesus',
  'emmanuel-garcia-barron',
  'guillermo-moguel-mandujano',
  'jorge-luis-diaz-albarran',
  'jose-etmanuel-hernandez-rejon',
  'laura-castillo-cedillo',
  'laura-elisa-rico-gutierrez',
  'luis-angel-castro-ruiz',
  'luis-leonardo-escobar-paredes',
  'marco-uriel-quintero-diaz',
  'miguel-anguel-amezcua-rincon',
  'misael-garcia-martinez',
  'mishel-alexis-rubio-mora',
  'sarahi-tun-rosas',
  'silvino-martinez-soto',
  'victor-manuel-salas-estrada'
]);

/** "Ángel César Gasca" -> "angel-cesar-gasca" */
export function nameSlug(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Ruta del rostro del participante, o null si no hay foto (se muestran las iniciales) */
export function facePhoto(fullName: string | null | undefined): string | null {
  if (!fullName) return null;
  const slug = nameSlug(fullName);
  return FACE_SLUGS.has(slug) ? `assets/imgs/faces/${slug}.webp` : null;
}
