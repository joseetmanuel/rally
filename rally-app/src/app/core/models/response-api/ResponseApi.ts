/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Response {
	data: any;
	message: string;
	success: boolean;
}

export interface ResponseApi {
	data: { elements: any[]; element?: any; message: string };
}
