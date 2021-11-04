/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';

/* Component imports */
import { FormButtonsComponentModule } from '../../../form-elements/public';
import { DeleteButtonComponentModule, HeaderComponentModule } from '../../../shared/public';
import { ProcessCalendarFormComponentModule } from '../process-calendar-form/process-calendar-form.module';
import { ProcessManualFormComponentModule } from '../process-manual-form/process-manual-form.module';
import { ProcessTimerFormComponentModule } from '../process-timer-form/process-timer-form.module';

/* Page imports */
import { ProcessFormComponent } from './process-form.component';


@NgModule({
  imports: [
    CommonModule,
    DeleteButtonComponentModule,
    FormButtonsComponentModule,
    HeaderComponentModule,
    IonicModule,
    ProcessCalendarFormComponentModule,
    ProcessManualFormComponentModule,
    ProcessTimerFormComponentModule
  ],
  declarations: [ ProcessFormComponent ]
})
export class ProcessFormComponentModule {}
