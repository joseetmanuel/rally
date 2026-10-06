/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@angular/core';
import { MapperService } from '@services/mapper/mapper.service';
import {
	UserPermission,
	UserPermissionApi
} from '@models/authentication/UserPermissions';
@Injectable({ providedIn: 'root' })
export class UserPermisionMapper extends MapperService<
	UserPermission,
	UserPermissionApi
> {
	mapTo(entity: UserPermissionApi): UserPermission {
		return {
			profileId: entity.perfilId,
			profile: entity.nombrePerfil,
			systemId: entity.sistemaId,
			system: entity.nombreSistema,
			userId: entity.usuarioId,
			user: entity.nombreUsuario
		};
	}

	mapFrom(entity: UserPermission): UserPermissionApi {
		return {
			perfilId: entity.profileId,
			nombrePerfil: entity.profile,
			sistemaId: entity.systemId,
			nombreSistema: entity.system,
			usuarioId: entity.userId,
			nombreUsuario: entity.user
		};
	}
	mapCreate(entity: UserPermission): UserPermissionApi {
		return {
			perfilId: entity.profileId,
			nombrePerfil: entity.profile,
			sistemaId: entity.systemId,
			nombreSistema: entity.system,
			usuarioId: entity.userId,
			nombreUsuario: entity.user
		};
	}
}
