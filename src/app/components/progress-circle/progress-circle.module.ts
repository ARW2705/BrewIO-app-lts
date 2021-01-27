import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { ProgressCircleComponent } from './progress-circle.component';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
  ],
  declarations: [
    ProgressCircleComponent
  ],
  exports: [
    ProgressCircleComponent
  ]
})
export class ProgressCircleComponentModule {}
