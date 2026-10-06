import { TestBed } from '@angular/core/testing';

import { SessionStorageService } from './sessionstorage.service';

describe('SessionstorageService', () => {
	let service: SessionStorageService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(SessionStorageService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	it('should set item in session storage', () => {
		const key = 'testKey';
		const value = 'testValue';
		service.setItem(key, value);
		expect(sessionStorage.getItem(key)).toBe(value);
	});

	it('should get item from session storage', () => {
		const key = 'testKey';
		const value = 'testValue';
		sessionStorage.setItem(key, value);
		const result = service.getItem(key);
		expect(result).toBe(value);
	});

	it('should return empty string if item is not found in session storage', () => {
		const key = 'nonExistentKey';
		const result = service.getItem(key);
		expect(result).toBe('');
	});

	it('should set object in session storage', () => {
		const key = 'testKey';
		const value = { name: 'John', age: 30 };
		service.setObject(key, value);
		const result = JSON.parse(sessionStorage.getItem(key)!);
		expect(result).toEqual(value);
	});

	it('should get object from session storage', () => {
		const key = 'testKey';
		const value = { name: 'John', age: 30 };
		sessionStorage.setItem(key, JSON.stringify(value));
		const result = service.getObject(key);
		expect(result).toEqual(value);
	});

	it('should return null if object is not found in session storage', () => {
		const key = 'nonExistentKey';
		const result = service.getObject(key);
		expect(result).toBeNull();
	});

	it('should remove item from session storage', () => {
		const key = 'testKey';
		const value = 'testValue';
		sessionStorage.setItem(key, value);
		service.removeByKey(key);
		expect(sessionStorage.getItem(key)).toBeNull();
	});

	it('should clear all items from session storage', () => {
		sessionStorage.setItem('key1', 'value1');
		sessionStorage.setItem('key2', 'value2');
		service.removeAll();
		expect(sessionStorage.length).toBe(0);
	});
});
