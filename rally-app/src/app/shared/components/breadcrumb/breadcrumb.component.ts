import { Component, OnDestroy, OnInit } from '@angular/core';
// RXJS
import { Subscription } from 'rxjs';
// SERVICES
import { BreadcrumbService } from '@services/breadcrumb/breadcrumb.service';
// MODELS
import { Breadcrumb } from '@models/breadcrumb/Breadcrumb';
import { SharedModule } from '@shared/shared.module';

@Component({
    selector: 'app-breadcrumb',
    templateUrl: './breadcrumb.component.html',
    styleUrls: ['./breadcrumb.component.scss'],
    imports: [SharedModule]
})
export class BreadcrumbComponent implements OnInit, OnDestroy {
	subscription = new Subscription();
	breadcrumbs: Breadcrumb[] = [];
	constructor(private breadcrumbService: BreadcrumbService) {}

	ngOnInit() {
		this.subscription.add(
			this.breadcrumbService.breadcrumbs$.subscribe(
				(x: Breadcrumb[]) => (this.breadcrumbs = x)
			)
		);
	}

	ngOnDestroy(): void {
		this.subscription.unsubscribe();
	}
}
