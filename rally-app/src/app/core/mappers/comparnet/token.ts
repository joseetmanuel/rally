/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@angular/core';
import { LoginApi, LoginItem, sesionTokens } from '@models/authentication/LoginComparrnet';
import { MapperService } from '@services/mapper/mapper.service';
@Injectable({ providedIn: 'root' })
export class TokensMapper extends MapperService<sesionTokens, sesionTokens> {
	mapFrom(entity: sesionTokens): sesionTokens {
		return {
			token: entity.token,
			refreshToken: entity.refreshToken,
			
		};
	}
	mapTo(entity: sesionTokens): sesionTokens {
		return {
            token: entity.token||"",
			refreshToken: entity.refreshToken||"",
			
		};
	}
	mapCreate(entity: sesionTokens) {
		return {
            token: entity.token,
			refreshToken: entity.refreshToken,
			
		};
	}
}
