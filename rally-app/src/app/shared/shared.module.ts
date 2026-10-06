// ANGULAR
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DragDropModule } from '@angular/cdk/drag-drop';
// MODULOS LIBS
import { MaterialModule } from './modules/material.module';
import { NgxSpinnerModule } from 'ngx-spinner';
import { PermissionInputDirective } from '@directives/inputs.directive';

const MODULES_ANGULAR = [
	CommonModule,
	FormsModule,
	ReactiveFormsModule,
	RouterModule,
	DragDropModule
];
const MODULES_LIBS = [MaterialModule, NgxSpinnerModule];
const PIPES = [PermissionInputDirective];
@NgModule({
	imports: [...MODULES_ANGULAR, ...MODULES_LIBS, ...PIPES],
	exports: [...MODULES_ANGULAR, ...MODULES_LIBS, ...PIPES],
	providers: []
})
export class SharedModule {}
