import { PAGE_OPTIONS } from './PageOptions';

describe('PageOptions', () => {
	it('should call pageOptios true', () => {
		const page = PAGE_OPTIONS;
		expect(page).toEqual([5, 10, 20, 50, 100, 200]);
	});
});
