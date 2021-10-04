/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';

/* Pipe imports */
import { UnitConversionPipeModule } from '../../../../pipes/pipes';

/* Component imports */
import { ProcessDescriptionComponent } from './process-description.component';


@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    UnitConversionPipeModule
  ],
  declarations: [
    ProcessDescriptionComponent
  ],
  exports: [
    ProcessDescriptionComponent
  ]
})
export class ProcessDescriptionComponentModule {}
