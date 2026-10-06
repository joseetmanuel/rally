import { HttpClient } from '@angular/common/http';
import {
	transformRequestApi,
	transformRequestPatchApi,
	transformResponseApi
} from '@mappers/response-api/responsApi';
import { Response, ResponseApi } from '@models/response-api/ResponseApi';
import { MapperService } from '@services/mapper/mapper.service';
import { QueryStringBuilder } from '@utils/query-string-builder';
import { Observable, map } from 'rxjs';

export interface GenericApi<T> {
	getAll(): Observable<Response>;
	getById(id: number): Observable<Response>;
	search(filer: any): Observable<Response>;
	create(model: T): Observable<Response>;
	update(model: T, id: number): Observable<Response>;
	delete(status: number, id: number): Observable<Response>;
}

export class GenericApiClass<T, S> implements GenericApi<T> {
	constructor(
		public url: string,
		public http: HttpClient,
		public mapper: MapperService<T, S>
	) {}

	getAll(): Observable<Response> {
		return this.http
			.get<Response>(`${this.url}`)
			.pipe(map((x: Response) => transformResponseApi(x, this.mapper)));
	}

	getById(id: number): Observable<Response> {
		return this.http
			.get<Response>(`${this.url}/${id}`)
			.pipe(map((x: ResponseApi) => transformResponseApi(x, this.mapper)));
	}

	create(model: T): Observable<Response> {
		return this.http
			.post<Response>(`${this.url}`, transformRequestApi(model, this.mapper))
			.pipe(map((x: Response) => transformResponseApi(x, this.mapper)));
	}

	update(model: T, id: number): Observable<Response> {
		const _url = this.url + `/` + id;
		return this.http
			.put<Response>(_url, transformRequestApi(model, this.mapper))
			.pipe(map((x: Response) => transformResponseApi(x, this.mapper)));
	}

	delete(status: number, id: number): Observable<Response> {
		const _url = this.url + `/` + id;
		return this.http
			.patch<Response>(_url, transformRequestPatchApi(status, this.mapper))
			.pipe(map((x: Response) => transformResponseApi(x, this.mapper)));
	}

	search(filter: any): Observable<Response> {
		return this.http
			.get<Response>(
				`${this.url}?${QueryStringBuilder.BuildParametersFromSearch(filter)}`
			)
			.pipe(
				map((x: Response) => ({
					...x,
					data: this.mapper.transform(x.data.elements)
				}))
			);
	}
}
