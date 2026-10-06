/* eslint-disable @angular-eslint/no-empty-lifecycle-method */
import { Component, input } from '@angular/core';
import { Panel } from '@models/base/panel/Panel';
import { SharedModule } from '@shared/shared.module';

@Component({
  selector: 'app-panel',
  templateUrl: './panel.component.html',
  styleUrls: ['./panel.component.scss'],
  imports: [SharedModule],
})
export class PanelComponent {
  panels = input.required<Panel[]>();
}
