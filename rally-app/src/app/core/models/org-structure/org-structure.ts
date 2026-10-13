/**
 * Estructura jerárquica: CTO > Dirección > Subdirección > Gerencia > participantes.
 * Cada nivel se maneja por ID y tiene el nombre de la unidad (`name`) y el de quien la encabeza (`head_name`),
 * ambos editables. `head_consultant_id` enlaza (opcional) a esa persona cuando también participa en el Rally.
 */
export interface OrgUnit {
  id: number;
  name: string;
  head_name: string;
  head_consultant_id: number | null;
}

export interface Cto extends OrgUnit {}

export interface Direction extends OrgUnit {
  cto_id: number;
}

export interface Subdirection extends OrgUnit {
  direction_id: number;
  cto_id: number;
}

export interface Management extends OrgUnit {
  subdirection_id: number;
  direction_id: number;
  cto_id: number;
}

/** Nodos del árbol que devuelve GET /org-structure (los hijos viajan anidados) */
export interface ManagementNode extends Management {
  participants: number;
}
export interface SubdirectionNode extends Subdirection {
  managements: ManagementNode[];
}
export interface DirectionNode extends Direction {
  subdirections: SubdirectionNode[];
}
export interface CtoNode extends Cto {
  directions: DirectionNode[];
}

/** Niveles que se pueden editar; `url` es el recurso del backend */
export type OrgLevel = 'cto' | 'direction' | 'subdirection' | 'management';

export const ORG_LEVELS: { level: OrgLevel; url: string; label: string; plural: string }[] = [
  { level: 'cto', url: 'ctos', label: 'CTO', plural: 'CTOs' },
  { level: 'direction', url: 'directions', label: 'Dirección', plural: 'Direcciones' },
  { level: 'subdirection', url: 'subdirections', label: 'Subdirección', plural: 'Subdirecciones' },
  { level: 'management', url: 'managements', label: 'Gerencia', plural: 'Gerencias' }
];

/** Filtros del ranking por nivel (sólo los usa el administrador; el público ve todo mezclado) */
export interface OrgFilter {
  cto_id?: number | null;
  direction_id?: number | null;
  subdirection_id?: number | null;
  management_id?: number | null;
}
