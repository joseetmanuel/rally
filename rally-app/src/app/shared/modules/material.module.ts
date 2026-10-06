import { NgModule } from '@angular/core';
// CDK
import { MatSliderModule } from '@angular/material/slider';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import {
	MAT_FORM_FIELD_DEFAULT_OPTIONS,
	MatFormFieldModule
} from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MAT_DATE_LOCALE, MatRippleModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatStepperModule } from '@angular/material/stepper';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
	MatPaginatorModule,
	MatPaginatorIntl
} from '@angular/material/paginator';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatRadioModule } from '@angular/material/radio';


// PAGINATE TO SPANISH
import { MatPaginatorIntlSpanish } from './MatPaginatorIntlSpanish';
import { MatTreeModule } from '@angular/material/tree';
const MATERIAL_MODULES = [
	MatSidenavModule,
	MatIconModule,
	MatSliderModule,
	MatToolbarModule,
	MatCardModule,
	MatFormFieldModule,
	MatInputModule,
	MatSelectModule,
	MatBadgeModule,
	MatButtonModule,
	MatDividerModule,
	MatGridListModule,
	MatMenuModule,
	MatListModule,
	MatRippleModule,
	MatDialogModule,
	MatStepperModule,
	MatCheckboxModule,
	MatTableModule,
	MatSortModule,
	MatDatepickerModule,
	MatNativeDateModule,
	MatSnackBarModule,
	MatProgressSpinnerModule,
	MatExpansionModule,
	MatTabsModule,
	MatTooltipModule,
	MatPaginatorModule,
	MatSlideToggleModule,
	MatTreeModule,
	MatRadioModule
];

@NgModule({
	declarations: [],
	imports: [MATERIAL_MODULES],
	exports: [MATERIAL_MODULES],
	providers: [
		{
			provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
			useValue: {
				floatLabel: 'always',
				appearance: 'outline'
			}
		},
		{ provide: MatPaginatorIntl, useClass: MatPaginatorIntlSpanish },
		{ provide: MAT_DATE_LOCALE, useValue: 'es-MX' }
	]
})
export class MaterialModule {}
