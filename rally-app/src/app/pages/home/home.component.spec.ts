import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeComponent } from './home.component';
import { AuthenticationService } from '@services/auth/authentication/authentication.service';
import { HttpClientModule } from '@angular/common/http';
import { KEYS_STORAGE } from '@constants/KeysStorage';
import { LocalStorageService } from '@services/storage/localstorage/localstorage.service';

describe(HomeComponent.name, () => {
	let component: HomeComponent;
	let mockLocalStorageService:any;

    beforeEach(async () => {

        mockLocalStorageService ={
            getObject:jest.fn().mockImplementation((key) =>{
                if(key == KEYS_STORAGE.config){
                    return { apiUrl:""}
                }
                return null
            })
        }
        await TestBed.configureTestingModule({
            imports: [HttpClientModule,HomeComponent], // Importa el módulo aquí
            declarations: [],
            providers: [AuthenticationService,
                {provide:LocalStorageService,useValue:mockLocalStorageService}
            ] // Incluye el servicio aquí si no está incluido en el componente
        }).compileComponents();

		fixture = TestBed.createComponent(HomeComponent);
		component = fixture.componentInstance;
		fixture.autoDetectChanges();
	});
    let fixture: ComponentFixture<HomeComponent>;

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
