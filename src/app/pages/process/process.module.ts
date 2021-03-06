/* Module imports */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';

/* Component imports */
import { HeaderComponentModule } from '../../components/header/header.module';
import { ProcessCalendarComponentModule } from '../../components/process-calendar/process-calendar.module';
import { ProcessManualComponentModule } from '../../components/process-manual/process-manual.module';
import { ProcessTimerComponentModule } from '../../components/process-timer/process-timer.module';
import { ProcessControlsComponentModule } from '../../components/process-controls/process-controls.module';

/* Page imports */
import { ProcessPage } from './process.page';
import { ProcessMeasurementsFormPageModule } from '../forms/process-measurements-form/process-measurements-form.module';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    HeaderComponentModule,
    ProcessCalendarComponentModule,
    ProcessManualComponentModule,
    ProcessTimerComponentModule,
    ProcessMeasurementsFormPageModule,
    ProcessControlsComponentModule,
    RouterModule.forChild([ { path: '', component: ProcessPage } ])
  ],
  declarations: [
    ProcessPage
  ]
})
export class ProcessPageModule {}
