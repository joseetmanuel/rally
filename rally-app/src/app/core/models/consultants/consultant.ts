export interface Consultant {
  id?: number;
  full_name: string;
  participant_type: 'INTERNO' | 'EXTERNO';
  team_id: number;
  consulting_firm_id?: number | null;
  email?: string | null;
  teams_contact?: string | null;

  // related
  team?: { id: number; name: string } | null;
  consulting_firm?: { id: number; name: string } | null;
}
