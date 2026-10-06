import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LocalStorageService } from '@services/storage/localstorage/localstorage.service';
import { KEYS_STORAGE } from '@constants/KeysStorage';
import { Observable, map } from 'rxjs';
import { Response, ResponseApi } from '@models/response-api/ResponseApi';
import { SectionMapper } from '@mappers/section/section';
import { Section } from '@models/section/Section';
import {
	transformRequestApi,
	transformResponseApi
} from '@mappers/response-api/responsApi';

@Injectable({
	providedIn: 'root'
})
export class SectionService {
	private host = '';
	public url = '';

	constructor(
		private http: HttpClient,
		public mapper: SectionMapper,
		private localStorage: LocalStorageService
	) {
		this.host = this.localStorage.getObject(KEYS_STORAGE.config)?.apiUrl || '';
		this.url = `${this.host}Catalogs/Sections`;
	}

	getByParentId(parentId: number): Observable<Response> {
		const url = `${this.url}/${parentId}`;
		return this.http
			.get<Response>(url)
			.pipe(map((x: ResponseApi) => transformResponseApi(x, this.mapper)));
	}

	getTreeByParentId(parentId: number): Observable<Response> {
		const url = `${this.host}Catalogs/SectionsTree/${parentId}`;
		return this.http
			.get<Response>(url)
			.pipe(map((x: ResponseApi) => transformResponseApi(x, this.mapper)));
	}

	add(section: Section) {
		const data = transformRequestApi(section, this.mapper);
		return this.http.post(this.url, data);
	}

	update(section: Section) {
		const data = transformRequestApi(section, this.mapper);
		const url = `${this.url}/${section.id}`;
		return this.http.put(url, data);
	}

	getSectionProfilesTree() {
		const url = `${this.host}Catalogs/SectionProfilesTree`;
		return this.http
			.get<Response>(url)
			.pipe(map((x: ResponseApi) => transformResponseApi(x, this.mapper)));
	}
	getSectionProfilesTreeStatic() {
		const url = `./assets/api/menu.json`;
		return this.http
			.get<Response>(url)
			.pipe(map((x: ResponseApi) => transformResponseApi(x, this.mapper)));
	}

	delete(section: Section) {
		const element = this.mapper.mapFromToggleStatus(section);
		const url = `${this.url}/${section.id}`;
		return this.http.patch(url, { data: { element } });
	}
}
