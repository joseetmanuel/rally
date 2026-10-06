/* eslint-disable @angular-eslint/no-output-native */
import { Component, input, output } from '@angular/core';
import { SharedModule } from '@shared/shared.module';

@Component({
  selector: 'app-toolbar-dialog',
  templateUrl: './toolbar-dialog.component.html',
  styleUrls: ['./toolbar-dialog.component.scss'],
  imports: [SharedModule],
})
export class ToolbarDialogComponent {
  title = input<string>('');
  drag = input<boolean>(true);
  close = output<boolean>();

  closeDialog() {
    this.close.emit(true);
  }
}
