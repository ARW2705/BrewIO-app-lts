/* Module imports */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

/* Component imports */
import { ProcessManualComponent } from './process-manual.component';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
  ],
  declarations: [
    ProcessManualComponent
  ],
  exports: [
    ProcessManualComponent
  ]
})
export class ProcessManualComponentModule {}
