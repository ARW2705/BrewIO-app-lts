/* Module imports */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { HeaderComponentModule } from '../../components/header/header.module';

/* Page imports */
import { ConfirmationPage } from './confirmation.page';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    HeaderComponentModule
  ],
  declarations: [
    ConfirmationPage
  ]
})
export class ConfirmationPageModule {}
