import { Section } from '@models/section/Section';

export interface Menu {
	items?: Section[];
}

export interface MenuItem {
	id: number;
	name: string;
	description: string;
	iconUrl: string;
	redirectUrl: string;
	modulo: string;
}

export interface MenuApi {
	idMenu: number;
	nombre: string;
	description: string;
	iconUrl: string;
	actionUrl: string;
	modulo: string;
}
