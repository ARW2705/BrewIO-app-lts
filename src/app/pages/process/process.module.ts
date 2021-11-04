/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';

/* Component imports */
import { ProcessCalendarComponentModule, ProcessControlsComponentModule, ProcessManualComponentModule, ProcessTimerComponentModule } from '../../components/process/public';
import { HeaderComponentModule } from '../../components/shared/public';

/* Page imports */
import { ProcessMeasurementsFormPageModule } from '../forms/process-measurements-form/process-measurements-form.module';
import { ProcessPage } from './process.page';


@NgModule({
  imports: [
    CommonModule,
    HeaderComponentModule,
    IonicModule,
    ProcessCalendarComponentModule,
    ProcessControlsComponentModule,
    ProcessManualComponentModule,
    ProcessMeasurementsFormPageModule,
    ProcessTimerComponentModule,
    RouterModule.forChild([ { path: '', component: ProcessPage } ])
  ],
  declarations: [
    ProcessPage
  ]
})
export class ProcessPageModule {}
