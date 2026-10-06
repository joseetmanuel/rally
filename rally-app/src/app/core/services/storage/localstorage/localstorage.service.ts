/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';

@Injectable({
	providedIn: 'root'
})
export class LocalStorageService {
	setItem(key: string, value: string) {
		localStorage.setItem(key, value);
	}

	getItem(key: string): string {
		return localStorage.getItem(key) || '';
	}

	setObject(key: string, value: any) {
		localStorage.setItem(key, JSON.stringify(value));
	}

	getObject(key: string) {
		const object = localStorage.getItem(key);
		return object ? JSON.parse(object) : null;
	}

	removeByKey(key: string) {
		localStorage.removeItem(key);
	}

	removeAll() {
		localStorage.clear();
	}
}
