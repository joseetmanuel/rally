import { TestBed } from '@angular/core/testing';
import { SectionService } from './section.service';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { ResponseApi } from '@models/response-api/ResponseApi';
import { of } from 'rxjs';
import { transformResponseApi } from '@mappers/response-api/responsApi';
import { Section } from '@models/section/Section';

describe('ProfileService', () => {
	let sectionService: SectionService;
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [SectionService, HttpClient, HttpHandler]
		});
	});
	beforeEach(() => {
		sectionService = TestBed.inject(SectionService);
	});
	it('should be created', () => {
		expect(sectionService).toBeTruthy();
	});
	it('should return getByParentId', () => {
		const parentId = 1;
		const response: ResponseApi = {
			data: { elements: [{ id: 1, name: 'Section 1' }], message: '' }
		};
		const postSpy = jest
			.spyOn(sectionService['http'], 'get')
			.mockReturnValue(of(response));
		sectionService.getByParentId(parentId).subscribe((response) => {
			expect(postSpy).toHaveBeenCalledWith(
				sectionService.url,
				transformResponseApi(response, sectionService.mapper)
			);
		});
	});
	it('should return getTreeByParentId', () => {
		const parentId = 1;
		const response: ResponseApi = {
			data: { elements: [{ id: 1, name: 'Section 1' }], message: '' }
		};
		const postSpy = jest
			.spyOn(sectionService['http'], 'get')
			.mockReturnValue(of(response));
		sectionService.getTreeByParentId(parentId).subscribe((response) => {
			expect(postSpy).toHaveBeenCalledWith(
				sectionService.url,
				transformResponseApi(response, sectionService.mapper)
			);
		});
	});
	it('should return getSectionProfilesTree', () => {
		const response: ResponseApi = {
			data: { elements: [{ id: 1, name: 'Section 1' }], message: '' }
		};
		const postSpy = jest
			.spyOn(sectionService['http'], 'get')
			.mockReturnValue(of(response));
		sectionService.getSectionProfilesTree().subscribe((response) => {
			expect(postSpy).toHaveBeenCalledWith(
				sectionService.url,
				transformResponseApi(response, sectionService.mapper)
			);
		});
	});
	it('should return delete', () => {
		const seccion: Section = {
			id: 1,
			inMenu: 1,
			name: '',
			order: 1,
			route: '',
			status: true,
			systemId: 1,
			typeSectionId: 1
		};

		jest.spyOn(sectionService['http'], 'get').mockReturnValue(of());
		sectionService.delete(seccion);
	});
});
