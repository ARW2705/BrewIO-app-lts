/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';

/* Component imporst */
import { FormButtonsComponentModule } from '../../form-elements/public';
import { ConfirmationComponent } from './confirmation.component';


@NgModule({
  imports: [
    CommonModule,
    FormButtonsComponentModule,
    IonicModule
  ],
  declarations: [
    ConfirmationComponent
  ],
  exports: [
    ConfirmationComponent
  ]
})
export class ConfirmationComponentModule {}
