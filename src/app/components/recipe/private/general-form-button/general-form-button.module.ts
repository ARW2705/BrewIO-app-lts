/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';

/* Pipe imports */
import { TruncatePipeModule } from '@pipes/public';

/* Component imports */
import { GeneralFormComponentModule } from '@components/recipe/private/general-form/general-form.module';
import { GeneralFormButtonComponent } from './general-form-button.component';


@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    GeneralFormComponentModule,
    TruncatePipeModule
  ],
  declarations: [
    GeneralFormButtonComponent
  ],
  exports: [
    GeneralFormButtonComponent
  ]
})
export class GeneralFormButtonComponentModule {}
