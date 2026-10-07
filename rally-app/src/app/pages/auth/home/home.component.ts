import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SharedModule } from '@shared/shared.module';
import { BackgroundComponent } from '../../../shared/components/background/background.component';
import { DisclaimerComponent } from '../../../shared/components/disclaimer/disclaimer.component';

@Component({
  selector: 'app-auth-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [SharedModule, BackgroundComponent, DisclaimerComponent],
})
export class AuthHomeComponent {
  constructor(private router: Router) {}

  goToHome() {
    this.router.navigate(['/app/home']);
  }
}
