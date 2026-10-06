/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@angular/core';
import { Section, SectionApi } from '@models/section/Section';
import { MapperService } from '@services/mapper/mapper.service';

@Injectable({ providedIn: 'root' })
export class SectionMapper extends MapperService<Section, SectionApi> {
	mapFrom(x: Section): SectionApi {
		return {
			systemId: x.systemId,
			name: x.name,
			rute: x.route,
			order: x.order,
			inMenu: x.inMenu,
			sectionFatherId: x.sectionFatherId,
			typeSectionId: x.typeSectionId
		};
	}

	mapTo(x: SectionApi): Section {
		return {
			id: x.sectionId,
			systemId: x.systemId,
			name: x.name,
			route: x.rute,
			order: x.order,
			inMenu: x.inMenu,
			sectionFatherId: x.sectionFatherId,
			typeSectionId: x.typeSectionId,
			status: !!x.status,
			expanded: true,
			children: (x.sonSections || []).map((child) => this.mapTo(child))
		};
	}

	mapCreate(x: Section): SectionApi {
		return {
			systemId: x.systemId,
			name: x.name,
			rute: x.route,
			order: x.order,
			inMenu: x.inMenu ? 1 : 0,
			sectionFatherId: x.sectionFatherId,
			typeSectionId: x.typeSectionId
		};
	}

	mapFromToggleStatus(x: Section): { status: number; systemId: number } {
		return { status: !x.status ? 1 : 0, systemId: x.systemId };
	}
}
