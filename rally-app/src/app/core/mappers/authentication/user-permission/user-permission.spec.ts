import { TestBed } from '@angular/core/testing';
import {
	UserPermission,
	UserPermissionApi
} from '@models/authentication/UserPermissions';
import { UserPermisionMapper } from './user-permission';

const objectFrom: UserPermissionApi = {
	perfilId: 1,
	nombrePerfil: 'test',
	sistemaId: 1,
	nombreSistema: 'test',
	usuarioId: 1,
	nombreUsuario: 'test'
};

const objectTo: UserPermission = {
	profileId: 1,
	profile: 'test',
	systemId: 1,
	system: 'test',
	userId: 1,
	user: 'test'
};

describe('UserPermissionMapper', () => {
	let mapper: UserPermisionMapper;
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [UserPermisionMapper]
		});
	});

	beforeEach(() => {
		mapper = TestBed.inject(UserPermisionMapper);
	});

	it('should transform a UserPermissionApi into a UserPermission', () => {
		const dataMap = mapper.mapTo(objectFrom);
		expect(dataMap).toEqual(objectTo);
	});

	it('should transform a UserPermission into a UserPermissionApi', () => {
		const dataMap = mapper.mapFrom(objectTo);
		expect(dataMap).toEqual(objectFrom);
	});
});
