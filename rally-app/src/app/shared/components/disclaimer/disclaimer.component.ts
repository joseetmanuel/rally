import { Component, input } from '@angular/core';
import { RALLY_DISCLAIMER } from '@constants/Disclaimer';

/** Aviso legal de la dinámica. `light` lo muestra en blanco, para fondos oscuros (pantalla de bienvenida). */
@Component({
  selector: 'app-disclaimer',
  standalone: true,
  template: `<p class="disclaimer" [class.disclaimer--light]="light()" role="note">{{ text }}</p>`,
  styles: [`
    :host { display: block; }
    .disclaimer {
      max-width: 880px;
      margin: 0 auto;
      padding: 20px 16px 24px;
      text-align: center;
      font-size: 0.75rem;
      line-height: 1.5;
      color: #5e6a71;
    }
    .disclaimer--light { color: rgba(255, 255, 255, 0.82); padding-top: 0; }
  `]
})
export class DisclaimerComponent {
  readonly light = input(false);
  readonly text = RALLY_DISCLAIMER;
}
