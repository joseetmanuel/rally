export interface Consultant {
  id?: number;
  full_name: string;
  participant_type: 'INTERNO' | 'EXTERNO';
  team_id: number;
  consulting_firm_id?: number | null;
  email?: string | null;
  teams_contact?: string | null;
  /** Gerencia a la que pertenece; de ahí se deducen subdirección, dirección y CTO (el servidor los devuelve) */
  management_id?: number | null;
  subdirection_id?: number | null;
  direction_id?: number | null;
  cto_id?: number | null;

  // related
  team?: { id: number; name: string } | null;
  consulting_firm?: { id: number; name: string } | null;
}
