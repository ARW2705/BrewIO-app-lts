/* Module imports */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

/* Page imports */
import { QuantityHelperPage } from './quantity-helper.page';

/* Component imports */
import { HeaderComponentModule } from '../../components/header/header.module';


@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    HeaderComponentModule
  ],
  declarations: [
    QuantityHelperPage
  ],
  exports: [
    QuantityHelperPage
  ]
})
export class QuantityHelperPageModule {}
