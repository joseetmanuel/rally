import { TestBed } from '@angular/core/testing';
import { ComparnetMapper } from './comparnet';
import { LoginApi, LoginItem } from '@models/authentication/LoginComparrnet';

const objectTo: LoginItem = {
	name: 'test',
    positionDescription:"",
	user: 'test'
};

const objectFrom: LoginApi = {
	name: 'test',
    positionDescription:"",
	user: 'test'
};

describe('UserPermissionMapper', () => {
	let mapper: ComparnetMapper;
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [ComparnetMapper]
		});
	});

	beforeEach(() => {
		mapper = TestBed.inject(ComparnetMapper);
	});

	it('should mapFrom(entity: LoginItem) transform a LoginItem into a LoginApi', () => {
		const dataMap = mapper.mapTo(objectFrom);
		expect(dataMap).toEqual(objectTo);
	});

	it('should mapTo(entity: LoginApi) transform a LoginApi into a LoginItem', () => {
		const dataMap = mapper.mapFrom(objectTo);
		expect(dataMap).toEqual(objectFrom);
	});
});
