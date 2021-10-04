/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

/* Component imports */
import { FormInputComponentModule } from '../../../form-elements/public/form-input/form-input.module';
import { FormTextAreaComponentModule } from '../../../form-elements/public/form-text-area/form-text-area.module';

/* Page imports */
import { ProcessManualFormComponent } from './process-manual-form.component';


@NgModule({
  imports: [
    CommonModule,
    FormInputComponentModule,
    FormTextAreaComponentModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule
  ],
  declarations: [ ProcessManualFormComponent ],
  exports: [ ProcessManualFormComponent ]
})
export class ProcessManualFormComponentModule {}
