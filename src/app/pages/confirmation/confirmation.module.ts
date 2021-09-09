/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';

/* Page imports */
import { ConfirmationPage } from './confirmation.page';

/* Component imporst */
import { FormButtonsComponentModule } from '../../components/form-buttons/form-buttons.module';
import { HeaderComponentModule } from '../../components/header/header.module';


@NgModule({
  imports: [
    CommonModule,
    FormButtonsComponentModule,
    HeaderComponentModule,
    IonicModule
  ],
  declarations: [
    ConfirmationPage
  ],
  exports: [
    ConfirmationPage
  ]
})
export class ConfirmationPageModule {}
