/* Module imports */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

/* Component imports */
import { ProcessListComponent } from './process-list.component';


@NgModule({
  imports: [
    CommonModule,
    IonicModule
  ],
  declarations: [
    ProcessListComponent
  ],
  exports: [
    ProcessListComponent
  ]
})
export class ProcessListComponentModule {}
