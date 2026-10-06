/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
@Injectable({
	providedIn: 'root'
})
export class SessionStorageService {
	setItem(key: string, value: string) {
		sessionStorage.setItem(key, value);
	}

	getItem(key: string): string {
		return sessionStorage.getItem(key) || '';
	}

	setObject(key: string, value: any) {
		sessionStorage.setItem(key, JSON.stringify(value));
	}

	getObject(key: string) {
		const object = sessionStorage.getItem(key);
		return object ? JSON.parse(object) : null;
	}

	removeByKey(key: string) {
		sessionStorage.removeItem(key);
	}

	removeAll() {
		sessionStorage.clear();
	}
}
