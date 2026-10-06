/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@angular/core';
import { MenuApi, MenuItem } from '@models/menu/Menu';
import { MapperService } from '@services/mapper/mapper.service';

@Injectable({ providedIn: 'root' })
export class MenuMapper extends MapperService<MenuItem, MenuApi> {
	override mapCreate(entity: MenuItem): MenuApi {
		throw new Error('Method not implemented.');
	}
	mapTo(entity: MenuApi): MenuItem {
		return {
			id: entity.idMenu,
			name: entity.nombre,
			description: entity.description,
			iconUrl: entity.iconUrl,
			redirectUrl: entity.actionUrl,
			modulo: entity.modulo
		};
	}
	mapFrom(entity: MenuItem): MenuApi {
		return {
			idMenu: entity.id,
			actionUrl: entity.redirectUrl,
			description: entity.description,
			iconUrl: entity.iconUrl,
			modulo: entity.modulo,
			nombre: entity.name
		};
	}
}
