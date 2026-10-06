import { TestBed } from '@angular/core/testing';

import { LocalStorageService } from './localstorage.service';

describe('LocalStorageService', () => {
	let service: LocalStorageService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(LocalStorageService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	it('should set item in local storage', () => {
		const key = 'testKey';
		const value = 'testValue';
		service.setItem(key, value);
		expect(localStorage.getItem(key)).toBe(value);
	});

	it('should get item from local storage', () => {
		const key = 'testKey';
		const value = 'testValue';
		localStorage.setItem(key, value);
		const result = service.getItem(key);
		expect(result).toBe(value);
	});

	it('should return empty string if item is not found in local storage', () => {
		const key = 'nonExistentKey';
		const result = service.getItem(key);
		expect(result).toBe('');
	});

	it('should set object in local storage', () => {
		const key = 'testKey';
		const value = { name: 'John', age: 30 };
		service.setObject(key, value);
		const result = JSON.parse(localStorage.getItem(key)!);
		expect(result).toEqual(value);
	});

	it('should get object from local storage', () => {
		const key = 'testKey';
		const value = { name: 'John', age: 30 };
		localStorage.setItem(key, JSON.stringify(value));
		const result = service.getObject(key);
		expect(result).toEqual(value);
	});

	it('should return null if object is not found in local storage', () => {
		const key = 'nonExistentKey';
		const result = service.getObject(key);
		expect(result).toBeNull();
	});

	it('should remove item from local storage', () => {
		const key = 'testKey';
		const value = 'testValue';
		localStorage.setItem(key, value);
		service.removeByKey(key);
		expect(localStorage.getItem(key)).toBeNull();
	});

	it('should clear all items from local storage', () => {
		localStorage.setItem('key1', 'value1');
		localStorage.setItem('key2', 'value2');
		service.removeAll();
		expect(localStorage.length).toBe(0);
	});
});
