/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Section {
	id?: number;
	systemId: number;
	name: string;
	route: string;
	order: number;
	inMenu: number;
	sectionFatherId?: any;
	typeSectionId: number;
	status: boolean;
	children?: Section[];
	expanded?: boolean;
	isNodeRoot?: boolean;
}

export interface SectionApi {
	sectionId?: number;
	systemId: number;
	name: string;
	rute: string;
	order: number;
	inMenu: number;
	sectionFatherId?: any;
	typeSectionId: number;
	status?: number;
	createDate?: string;
	lastUpdate?: any;
	sonSections?: SectionApi[];
}
