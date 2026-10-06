import { UserPermission } from './UserPermissions';

export interface LoginComparnet {
	bossPayrollNumber: string;
	payrollNumber: string;
	profile?: UserPermission;
	seatId: string;
	system: string;
	token: string;
	name: string;
}

export interface LoginComparnetApi {
	NominaJefe: string;
	nomina: string;
	PerfilId: number;
	Perfil: string;
	SedeId: string;
	Sistema: string;
	Token: string;
	nombre: string;
	tokenFirebase: string;
}

export interface LoginItem {
	name: string;
	positionDescription: string;
	user: string;
}
export interface LoginApi {
	name: string;
	positionDescription: string;
	user: string;
}

export interface sesionTokens{
	token: string;
	refreshToken: string;
}
