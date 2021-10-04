/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';

/* Component imports */
import { YeastBatchItemComponent } from './yeast-batch-item.component';


@NgModule({
  imports: [
    CommonModule,
    IonicModule
  ],
  declarations: [
    YeastBatchItemComponent
  ],
  exports: [
    YeastBatchItemComponent
  ]
})
export class YeastBatchItemComponentModule {}
