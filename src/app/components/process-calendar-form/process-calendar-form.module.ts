/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

/* Component imports */
import { FormInputComponentModule } from '../form-input/form-input.module';
import { FormTextAreaComponentModule } from '../form-text-area/form-text-area.module';
import { HeaderComponentModule } from '../header/header.module';

/* Page imports */
import { ProcessCalendarFormComponent } from './process-calendar-form.component';


@NgModule({
  imports: [
    CommonModule,
    FormInputComponentModule,
    FormTextAreaComponentModule,
    FormsModule,
    HeaderComponentModule,
    IonicModule,
    ReactiveFormsModule
  ],
  declarations: [ ProcessCalendarFormComponent ],
  exports: [ ProcessCalendarFormComponent ]
})
export class ProcessCalendarFormComponentModule {}
