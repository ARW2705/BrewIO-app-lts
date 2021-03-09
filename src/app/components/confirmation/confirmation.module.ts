/* Module imports */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { HeaderComponentModule } from '../header/header.module';

/* Page imports */
import { ConfirmationComponent } from './confirmation.component';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    HeaderComponentModule
  ],
  declarations: [
    ConfirmationComponent
  ],
  exports: [
    ConfirmationComponent
  ]
})
export class ConfirmationComponentModule {}
