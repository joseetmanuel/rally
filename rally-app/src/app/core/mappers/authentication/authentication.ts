/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@angular/core';
import { Response } from '@models/response-api/ResponseApi';
import { MapperService } from '@services/mapper/mapper.service';
import { ComparnetMapper } from '@mappers/comparnet/comparnet';
import { LoginApi, sesionTokens } from '@models/authentication/LoginComparrnet';
import { UserPermisionMapper } from './user-permission/user-permission';
import { UserPermissionApi } from '@models/authentication/UserPermissions';
import { TokensMapper } from '@mappers/comparnet/token';
@Injectable({ providedIn: 'root' })
export class AuthenticationMapper extends MapperService<any, any> {
	mapTo(entity: any) {
		// TODO:
	}
	mapFrom(entity: any) {
		// TODO:
	}
	mapCreate(entity: any) {
		// TODO:
	}

	toAutenticacion(x: any): Response {
		const user = new ComparnetMapper().mapTo(x.data.element as LoginApi);
		const token = new TokensMapper().mapTo(x.data.element as sesionTokens);
		
		return { data:{user:user,token:token}, message: '', success: true };
	}

	toVerifyUserInDirectory(x: any): Response {
		const { perfil, mensaje } = x[0];
		const data = new UserPermisionMapper().mapTo(perfil as UserPermissionApi);
		return { data, message: '', success: true };
	}
}
