/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

/* Component imports */
import { FormInputComponentModule } from '@components/form-elements/public/form-input/form-input.module';
import { FormTextAreaComponentModule } from '@components/form-elements/public/form-text-area/form-text-area.module';
import { FormToggleComponentModule } from '@components/form-elements/public/form-toggle/form-toggle.module';

/* Page imports */
import { ProcessTimerFormComponent } from './process-timer-form.component';


@NgModule({
  imports: [
    CommonModule,
    FormInputComponentModule,
    FormTextAreaComponentModule,
    FormToggleComponentModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule
  ],
  declarations: [ ProcessTimerFormComponent ],
  exports: [ ProcessTimerFormComponent ]
})
export class ProcessTimerFormComponentModule {}
