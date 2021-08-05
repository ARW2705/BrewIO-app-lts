/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';

/* Component imports */
import { GrainBillItemComponentModule } from '../grain-bill-item/grain-bill-item.module';
import { GrainBillComponent } from './grain-bill.component';


@NgModule({
  imports: [
    CommonModule,
    GrainBillItemComponentModule,
    IonicModule
  ],
  declarations: [
    GrainBillComponent
  ],
  exports: [
    GrainBillComponent
  ]
})
export class GrainBillComponentModule {}
