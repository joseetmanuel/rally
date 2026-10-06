import { TestBed } from '@angular/core/testing';
import { MenuApi, MenuItem } from '@models/menu/Menu';
import { MenuMapper } from './menu';

const objectTo: MenuItem = {
  id: 1,
  name: 'test',
  description: 'test',
  iconUrl: 'test',
  redirectUrl: 'test',
  modulo: 'test',
};

const objectFrom: MenuApi = {
  idMenu: 1,
  actionUrl: 'test',
  description: 'test',
  iconUrl: 'test',
  modulo: 'test',
  nombre: 'test',
};

describe('UserPermissionMapper', () => {
  let mapper: MenuMapper;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MenuMapper],
    });
  });

  beforeEach(() => {
    mapper = TestBed.inject(MenuMapper);
  });

  it('should transform a MenuApi into a MenuItem', () => {
    const dataMap = mapper.mapTo(objectFrom);
    expect(dataMap).toEqual(objectTo);
  });

  it('should transform a MenuItem into a MenuApi', () => {
    const dataMap = mapper.mapFrom(objectTo);
    expect(dataMap).toEqual(objectFrom);
  });
});
