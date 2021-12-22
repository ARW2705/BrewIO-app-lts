/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

/* Component imports */
import { HeaderComponentModule } from '../../../shared/public';
import { QuantityHelperComponent } from './quantity-helper.component';


@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    HeaderComponentModule
  ],
  declarations: [
    QuantityHelperComponent
  ],
  exports: [
    QuantityHelperComponent
  ]
})
export class QuantityHelperComponentModule {}
