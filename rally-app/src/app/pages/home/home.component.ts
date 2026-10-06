import {
  Component,
  EnvironmentInjector,
  inject,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { AuthenticationService } from '@services/auth/authentication/authentication.service';
import { Subscription } from 'rxjs';
import { BackgroundComponent } from '../../shared/components/background/background.component';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [BackgroundComponent],
})
export class HomeComponent implements OnInit, OnDestroy {
  auth = inject(AuthenticationService);
  response$ = this.auth.validSesion();
  private readonly injector = inject(EnvironmentInjector);
  subscription = new Subscription();

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ngOnInit(): void {
    // this.subscription.add(
    // 	runInInjectionContext(this.injector, () => {
    // 		toSignal(this.response$);
    // 	})
    // );
  }
}
