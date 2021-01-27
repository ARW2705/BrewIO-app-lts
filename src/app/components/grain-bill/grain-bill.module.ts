/* Module imports */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { PipesModule } from '../../pipes/pipes.module';

/* Component imports */
import { GrainBillComponent } from './grain-bill.component';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    PipesModule
  ],
  declarations: [
    GrainBillComponent
  ],
  exports: [
    GrainBillComponent
  ]
})
export class GrainBillComponentModule {}
