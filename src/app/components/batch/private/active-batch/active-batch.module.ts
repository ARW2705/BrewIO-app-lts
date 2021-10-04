/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';

/* Component imports */
import { ActiveBatchComponent } from './active-batch.component';


@NgModule({
  imports: [
    CommonModule,
    IonicModule,
  ],
  declarations: [
    ActiveBatchComponent
  ],
  exports: [
    ActiveBatchComponent
  ]
})
export class ActiveBatchComponentModule {}
