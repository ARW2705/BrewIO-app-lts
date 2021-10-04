/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';

/* Component imports */
import { ProcessHeaderComponent } from './process-header.component';


@NgModule({
  imports: [
    CommonModule,
    IonicModule
  ],
  declarations: [
    ProcessHeaderComponent
  ],
  exports: [
    ProcessHeaderComponent
  ]
})
export class ProcessHeaderComponentModule {}
