import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
	providedIn: 'root'
})
export class AlertService {
	app = 'Auditoria';
	constructor(private notifyService: ToastrService) {}

	showSuccesAlert(message: string) {
		try {
			this.notifyService.success(message);
		} catch (error) {
			console.log(error);
		}
	}

	showInfoAlert(message: string) {
		try {
			this.notifyService.info(message);
		} catch (error) {
			console.log(error);
		}
	}

	showErrorAlert(message: string) {
		try {
			this.notifyService.error(message);
		} catch (error) {
			console.log(error);
		}
	}

	showWarningAlert(message: string) {
		try {
			this.notifyService.warning(message);
		} catch (error) {
			console.log(error);
		}
	}
}
