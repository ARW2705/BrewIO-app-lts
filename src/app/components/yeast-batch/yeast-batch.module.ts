/* Module imports */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

/* Component imports */
import { YeastBatchComponent } from './yeast-batch.component';


@NgModule({
  imports: [
    CommonModule,
    IonicModule
  ],
  declarations: [
    YeastBatchComponent
  ],
  exports: [
    YeastBatchComponent
  ]
})
export class YeastBatchComponentModule {}
