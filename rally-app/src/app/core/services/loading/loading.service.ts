import { Injectable } from '@angular/core';
// SERVICES
import { NgxSpinnerService } from 'ngx-spinner';

@Injectable({
	providedIn: 'root'
})
export class LoadingService {
	private requests = 0;
	private priviousRequests = 0;
	private completed = 0;
	constructor(private spinner: NgxSpinnerService) {}

	private hideLoading() {
		if (this.requests === this.completed) {
			if (this.requests > this.priviousRequests) {
				this.priviousRequests = this.requests;
				setTimeout(() => this.hideLoading(), 1000);
			} else {
				this.spinner.hide();
				this.requests = 0;
				this.completed = 0;
				this.priviousRequests = 0;
			}
		}
	}

	show() {
		if (this.requests === 0) {
			this.spinner.show();
		}
		this.requests++;
	}

	hide() {
		this.completed++;
		this.hideLoading();
	}
}
