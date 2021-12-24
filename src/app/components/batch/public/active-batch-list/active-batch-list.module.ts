/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';

/* Component imports */
import { ActiveBatchComponentModule } from '@components/batch/private/active-batch/active-batch.module';
import { ActiveBatchListComponent } from './active-batch-list.component';


@NgModule({
  imports: [
    ActiveBatchComponentModule,
    CommonModule,
    IonicModule,
  ],
  declarations: [
    ActiveBatchListComponent
  ],
  exports: [
    ActiveBatchListComponent
  ]
})
export class ActiveBatchListComponentModule {}
