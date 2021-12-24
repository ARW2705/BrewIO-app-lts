/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';

/* Component imports */
import { YeastBatchItemComponentModule } from '@components/ingredient/private/yeast-batch-item/yeast-batch-item.module';
import { YeastBatchComponent } from './yeast-batch.component';


@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    YeastBatchItemComponentModule
  ],
  declarations: [
    YeastBatchComponent
  ],
  exports: [
    YeastBatchComponent
  ]
})
export class YeastBatchComponentModule {}
