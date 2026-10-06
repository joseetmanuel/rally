export interface AppUser {
	userName: string;
	password: any;
}

export interface AppUserApi {
	userName: string;
	password: any;
}
export interface User {
	userName: string;
	name: string;
	lastName: string;
	motherLastName: string;
	positionId: number;
	positionDescription: string;
	areaId: number;
	areaDescription: string;
	companyId: number;
	companyDescription: string;
	accountNumber?: string;
	userTypeId: number;
}

export interface UserApi {
	nombreUsuario: string;
	nombre: string;
	apellidoPaterno: string;
	apellidoMaterno: string;
	posicionId: number;
	descripcionPosicion: string;
	areaId: number;
	descripcionArea: string;
	empresaId: number;
	descripcionEmpresa: string;
	tipoUsuario: number;
}
export interface ExternalUserApi {
	userName: string;
	name: string;
	lastName: string;
	secondLastName: string;
	email: string;
	chiefAccountNumber: number;
	hireDate: string;
	leavingDate?: any;
}

export interface UserDirectory {
	userName: string;
	accountNumber: string;
	name: string;
	lastName: string;
	secondLastName: string;
	birthDate: string;
	corporateEmail: string;
}

export interface ExternalUserDirectory {
	id?: number;
	userName: string;
	accountNumber: string;
	name: string;
	lastName: string;
	secondLastName: string;
	birthDate: string;
	corporateEmail: string;
	chiefAccountNumber: string;
	hireDate: string;
	userTypeId: number;
	status: number;
}

export interface UserReportApi {
	userName: string;
	profileName: string;
	systemName: string;
	estatus: number;
	nameOfUser: string;
	userType: string;
}

export interface UserReport {
	usuario: string;
	perfil: string;
	sistema: string;
	estatus: number;
	nombre: string;
	posicion: string;
}
