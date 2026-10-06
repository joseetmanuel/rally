import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { PanelComponent } from '../panel/panel.component';

describe('PanelComponent', () => {
	let component: PanelComponent;
	let fixture: ComponentFixture<PanelComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [PanelComponent],
			providers: [provideRouter([])]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(PanelComponent);
		component = fixture.componentInstance;
		fixture.componentRef.setInput('panels', [{ icon: 'home', label: 'Inicio', text: 'Texto' }]);
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
