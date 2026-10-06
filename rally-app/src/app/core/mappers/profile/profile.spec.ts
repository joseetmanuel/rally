/* eslint-disable  */

import { TestBed } from '@angular/core/testing';
import { ProfileMapper } from './profile';
import { Profile, ProfileApi } from '@models/profile/Profile';

const objectFrom: ProfileApi = {
  status: 1,
  name: 'test',
  profileId: 1,
  systemId: 1,
};

const objectTo: Profile = {
  status: 1,
  name: 'test',
  profileId: 1,
  systemId: 1,
};

describe('UserPermissionMapper', () => {
  let mapper: ProfileMapper;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProfileMapper],
    });
  });

  beforeEach(() => {
    mapper = TestBed.inject(ProfileMapper);
  });

  /*it('should transform a ProfileItem into a ProfileCreateApi', () => {
		const dataMap = mapper.mapCreate(objectTo);
		expect(dataMap).toEqual(objectTo);
	});

	it('should transform a ProfileApi into a ProfileItem', () => {
		const dataMap = mapper.mapTo(objectFrom);
		expect(dataMap).toEqual(objectTo);
	});*/

  it('should map all fields from ProfileApi to Profile when all fields are present', () => {
    const mapperService = new ProfileMapper();
    const profileApi: ProfileApi = {
      profileId: 1,
      name: 'test',
      systemId: 123,
      status: 2,
    };
    const expectedProfile: Profile = {
      profileId: 1,
      name: 'test',
      systemId: 123,
      status: 2,
    };
    const result = mapperService.mapTo(profileApi);
    expect(result).toEqual(expectedProfile);
  });

  it('should map all fields from Profile to ProfileApi correctly', () => {
    const mapperService = new ProfileMapper();
    const profile: Profile = {
      profileId: 1,
      name: 'test',
      systemId: 123,
      status: 2,
    };
    const expectedProfileApi: ProfileApi = {
      profileId: 1,
      name: 'test',
      systemId: 123,
      status: 2,
    };
    const result = mapperService.mapCreate(profile);
    expect(result).toEqual(expectedProfileApi);
  });
});
