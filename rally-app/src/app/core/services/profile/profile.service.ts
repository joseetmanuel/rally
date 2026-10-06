/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ResponseApi, Response } from '@models/response-api/ResponseApi';
import { Profile, ProfileApi } from '@models/profile/Profile';
import { Observable, map } from 'rxjs';
import { LocalStorageService } from '@services/storage/localstorage/localstorage.service';
import { KEYS_STORAGE } from '@constants/KeysStorage';
import { transformResponseApi } from '@mappers/response-api/responsApi';

import { GenericApiClass } from '@services/generic/generic.service';
import { ProfileMapper } from '@mappers/profile/profile';

@Injectable({ providedIn: 'root' })
export class  ProfileService extends GenericApiClass<Profile, ProfileApi> {
	private host = '';
	constructor(
		http: HttpClient,
		mapper: ProfileMapper,
		local: LocalStorageService
	) {
		super(
			`${
				local.getObject(KEYS_STORAGE.config)
					? local.getObject(KEYS_STORAGE.config).apiUrl
					: ''
			}Catalogs/Profile`,
			http,
			mapper
		);

		this.host = local.getObject(KEYS_STORAGE.config)?.apiUrl || '';
	}

	/*getAll(): Observable<Response> {
		return this.http
			.get<ResponseApi>('/assets/json/systems-profiles.json')
			.pipe(
				map((x: ResponseApi) => ({
					message: x.data.message,
					data: x.data.elements as Profile[],
					success: true
				}))
			);
	}*/

	getAllBySystem(systemId: number): Observable<Response> {
		return this.http
			.get<ResponseApi>('/assets/json/systems-profiles.json')
			.pipe(
				map((x: ResponseApi) => {
					const profiles = (x.data.elements as Profile[]).filter(
						(u) => u.systemId === systemId
					);
					return {
						message: x.data.message,
						data: profiles,
						success: true
					};
				})
			);
	}
	getSystemProfiles(systemId: number) {
		const url = `${this.host}Catalogs/Profiles/${systemId}`;
		return this.http
			.get<Response>(url)
			.pipe(map((x: ResponseApi) => transformResponseApi(x, this.mapper)));
	}

	
}
