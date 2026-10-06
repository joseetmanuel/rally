/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@angular/core';
import { LoginApi, LoginItem } from '@models/authentication/LoginComparrnet';
import { MapperService } from '@services/mapper/mapper.service';
@Injectable({ providedIn: 'root' })
export class ComparnetMapper extends MapperService<LoginItem, LoginApi> {
	mapFrom(entity: LoginItem): LoginApi {
		return {
			name: entity.name,
			positionDescription: entity.positionDescription,
			user: entity.user
		};
	}
	mapTo(entity: LoginApi): LoginItem {
		return {
			name: entity.name,
			positionDescription: entity.positionDescription,
			user: entity.user
		};
	}
	mapCreate(entity: LoginItem) {
		return {
			name: entity.name,
			positionDescription: entity.positionDescription,
			//token: entity.token,
			//refreshToken: entity.refreshToken,
			//systemId: entity.systemId,
			user: entity.user
		};
	}
}
