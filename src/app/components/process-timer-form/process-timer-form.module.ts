/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

/* Component imports */
import { FormInputComponentModule } from '../form-input/form-input.module';
import { FormTextAreaComponentModule } from '../form-text-area/form-text-area.module';
import { FormToggleComponentModule } from '../form-toggle/form-toggle.module';
import { HeaderComponentModule } from '../header/header.module';

/* Page imports */
import { ProcessTimerFormComponent } from './process-timer-form.component';


@NgModule({
  imports: [
    CommonModule,
    FormInputComponentModule,
    FormTextAreaComponentModule,
    FormToggleComponentModule,
    FormsModule,
    HeaderComponentModule,
    IonicModule,
    ReactiveFormsModule
  ],
  declarations: [ ProcessTimerFormComponent ],
  exports: [ ProcessTimerFormComponent ]
})
export class ProcessTimerFormComponentModule {}
