/* Module imports */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

/* Component imports */
import { QuantityHelperComponent } from './quantity-helper.component';
import { HeaderComponentModule } from '../header/header.module';

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
