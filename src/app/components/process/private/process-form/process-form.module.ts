/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';

/* Component imports */
import { FormButtonsComponentModule } from '@components/form-elements/public';
import { ProcessCalendarFormComponentModule } from '@components/process/private/process-calendar-form/process-calendar-form.module';
import { ProcessManualFormComponentModule } from '@components/process/private/process-manual-form/process-manual-form.module';
import { ProcessTimerFormComponentModule } from '@components/process/private/process-timer-form/process-timer-form.module';
import { DeleteButtonComponentModule, HeaderComponentModule } from '@components/shared/public';

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
