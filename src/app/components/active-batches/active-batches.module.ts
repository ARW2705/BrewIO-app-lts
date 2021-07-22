/* Module imports */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

/* Component imports */
import { ActiveBatchesComponent } from './active-batches.component';


@NgModule({
  imports: [
    CommonModule,
    IonicModule,
  ],
  declarations: [
    ActiveBatchesComponent
  ],
  exports: [
    ActiveBatchesComponent
  ]
})
export class ActiveBatchesComponentModule {}
