export interface Consultant {
  id?: number;
  full_name: string;
  participant_type: 'INTERNO' | 'EXTERNO';
  team_number: number;
  consulting_firm_name?: string | null;
  email?: string | null;
  teams_contact?: string | null;
}
