/* Module imports */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

/* Page imports */
import { ConfirmationPage } from './confirmation.page';

/* Component imporst */
import { HeaderComponentModule } from '../../components/header/header.module';


@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    HeaderComponentModule
  ],
  declarations: [
    ConfirmationPage
  ],
  exports: [
    ConfirmationPage
  ]
})
export class ConfirmationPageModule {}
