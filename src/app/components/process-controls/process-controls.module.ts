/* Module imports */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

/* Component imports */
import { ProcessControlsComponent } from './process-controls.component';

@NgModule({
  imports: [
    CommonModule,
    IonicModule
  ],
  declarations: [
    ProcessControlsComponent
  ],
  exports: [
    ProcessControlsComponent
  ]
})
export class ProcessControlsComponentModule {}
