/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

/* Page imports */
import { QuantityHelperPage } from './quantity-helper.page';

/* Component imports */
import { HeaderComponentModule } from '../../components/shared/public';


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
