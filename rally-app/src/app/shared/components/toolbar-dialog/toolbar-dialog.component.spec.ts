/* tslint:disable:no-unused-variable */
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ToolbarDialogComponent } from '../toolbar-dialog/toolbar-dialog.component';

describe('ToolbarDialogComponent', () => {
	let component: ToolbarDialogComponent;
	let fixture: ComponentFixture<ToolbarDialogComponent>;

	beforeEach(waitForAsync(() => {
		TestBed.configureTestingModule({
			imports: [ToolbarDialogComponent]
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(ToolbarDialogComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
	it('should', () => {
		component.closeDialog();
	});
});
