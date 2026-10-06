import { TestBed } from '@angular/core/testing';

import { LoadingService } from './loading.service';
import { NgxSpinnerService } from 'ngx-spinner';

const SpinnerMock = {
	show: jest.fn(),
	hide: jest.fn()
};

describe('LoadingService', () => {
	let loading: LoadingService;
	let spinner: NgxSpinnerService;
	beforeEach(async () => {
		TestBed.configureTestingModule({
			providers: [
				LoadingService,
				{ provide: NgxSpinnerService, useValue: SpinnerMock }
			]
		});
		loading = TestBed.inject(LoadingService);
		spinner = TestBed.inject(NgxSpinnerService);
	});

	it('should call hideLoading else case', () => {
		loading.show();
		loading.show();
		loading.show();
		loading.show();
		loading.hide();
		loading.hide();
		loading.hide();
	});

	it('should hideLoading() reset loading', () => {
		jest.spyOn(spinner, 'hide');
		loading['requests'] = 1;
		loading['completed'] = 1;
		loading['priviousRequests'] = 1;
		loading['hideLoading']();
		expect(spinner.hide).toHaveBeenCalled();
		expect(loading['requests']).toBe(0);
		expect(loading['completed']).toBe(0);
		expect(loading['priviousRequests']).toBe(0);
	});
});
