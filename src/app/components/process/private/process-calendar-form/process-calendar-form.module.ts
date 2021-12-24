/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

/* Component imports */
import { FormInputComponentModule } from '@components/form-elements/public/form-input/form-input.module';
import { FormTextAreaComponentModule } from '@components/form-elements/public/form-text-area/form-text-area.module';

/* Page imports */
import { ProcessCalendarFormComponent } from './process-calendar-form.component';


@NgModule({
  imports: [
    CommonModule,
    FormInputComponentModule,
    FormTextAreaComponentModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule
  ],
  declarations: [ ProcessCalendarFormComponent ],
  exports: [ ProcessCalendarFormComponent ]
})
export class ProcessCalendarFormComponentModule {}
