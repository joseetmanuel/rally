/* eslint-disable  */

import { TestBed } from '@angular/core/testing';
import { SectionMapper } from './section';
import { Section, SectionApi } from '@models/section/Section';

const objectFrom: Section = {
  id: 1,
  systemId: 1,
  name: 'string',
  route: 'string',
  order: 1,
  inMenu: 1,
  sectionFatherId: 0,
  typeSectionId: 1,
  status: true,
};

const objectTo: SectionApi = {
  sectionId: 1,
  systemId: 1,
  name: 'string',
  rute: 'string',
  order: 1,
  inMenu: 1,
  sectionFatherId: 1,
  typeSectionId: 1,
  status: 1,
};

const objectToChildrens: SectionApi = {
  sectionId: 1,
  systemId: 1,
  name: 'string',
  rute: 'string',
  order: 1,
  inMenu: 1,
  sectionFatherId: 1,
  typeSectionId: 1,
  status: 1,
  sonSections: [
    {
      sectionId: 1,
      systemId: 1,
      name: 'string',
      rute: 'string',
      order: 1,
      inMenu: 1,
      sectionFatherId: 1,
      typeSectionId: 1,
      status: 1,
    },
  ],
};

describe('UserPermissionMapper', () => {
  let mapper: SectionMapper;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SectionMapper],
    });
  });

  beforeEach(() => {
    mapper = TestBed.inject(SectionMapper);
  });

  it('should call mapTo', () => {
    const dataMap = mapper.mapTo(objectTo);
    // expect(dataMap).toEqual(objectFrom);
  });

  it('should cal mapFrom', () => {
    const dataMap = mapper.mapFrom(objectFrom);
    // expect(dataMap).toEqual(objectTo);
  });

  it('should call mapTo objectToChildrens', () => {
    const dataMap = mapper.mapTo(objectToChildrens);
  });
  it('should call mapCreate', () => {
    const dataMap = mapper.mapCreate(objectFrom);
  });
  it('should call mapFromToggleStatus', () => {
    const dataMap = mapper.mapFromToggleStatus(objectFrom);
  });
});
