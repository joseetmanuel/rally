import { Injectable } from '@angular/core';
import { Profile, ProfileApi } from '@models/profile/Profile';
import { MapperService } from '@services/mapper/mapper.service';

@Injectable({ providedIn: 'root' })
export class ProfileMapper extends MapperService<Profile, ProfileApi> {
  override mapTo(entity: ProfileApi): Profile {
    return {
      name: entity.name,
      systemId: entity.systemId,
      profileId: entity.profileId,
      status: entity.status,
    };
  }

  override mapCreate(entity: Profile): ProfileApi {
    return {
      name: entity.name,
      systemId: entity.systemId,
      profileId: entity.profileId,
      status: entity.status,
    };
  }
}
