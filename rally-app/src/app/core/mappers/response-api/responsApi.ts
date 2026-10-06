/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ResponseApi, Response } from '@models/response-api/ResponseApi';
import { MapperService } from '@services/mapper/mapper.service';

export const transformResponseApi = (
	data: ResponseApi,
	mapper: MapperService<any, any>
): Response => {
	const res: Response = {
		data:
			data.data.elements || data.data.element
				? mapper.transform(data.data.elements || data.data.element)
				: undefined,
		success: true,
		message: data.data.message
	};
	return res;
};

export const transformRequestApi = (
	data: any,
	mapper: MapperService<any, any>
): ResponseApi => {
	const req: ResponseApi = {
		data: {
			element: mapper.transformCreate(data),
			elements: [],
			message: ''
		}
	};
	return req;
};

export const transformRequestPatchApi = (
	data: number,
	mapper: MapperService<any, any>
): ResponseApi => {
	const req: ResponseApi = {
		data: { element: { status: data }, elements: [], message: '' }
	};
	return req;
};

// ts-disabled
export const mapResponseApi = (payload: ResponseApi, mapper: any): Response => {
	const { element, elements, message } = payload.data;
	const data = element ? mapper(element) : mapper(elements);
	return { data, success: true, message };
};

export const mapRequestApi = (data: any, mapper: any): ResponseApi => {
	const req: ResponseApi = {
		data: {
			element: mapper(data),
			elements: [],
			message: ''
		}
	};
	return req;
};
