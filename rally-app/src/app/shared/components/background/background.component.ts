import { Component, input } from '@angular/core';
import { KEYS_STORAGE } from '@constants/KeysStorage';

import { LocalStorageService } from '@services/storage/localstorage/localstorage.service';

import { SharedModule } from '@shared/shared.module';

@Component({
  selector: 'app-background',
  templateUrl: './background.component.html',
  styleUrls: ['./background.component.scss'],
  imports: [SharedModule],
})
export class BackgroundComponent {
  version = '';
  authView = input.required<boolean>();
  type = input.required<string>();

  constructor(private local: LocalStorageService) {
    this.version = local.getObject(KEYS_STORAGE.config)
      ? local.getObject(KEYS_STORAGE.config).version
      : '0.0';
  }
}
