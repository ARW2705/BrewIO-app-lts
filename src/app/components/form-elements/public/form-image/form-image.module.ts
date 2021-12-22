/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';

/* Component imports */
import { ImageSelectionComponentModule } from '../../private/image-selection/image-selection.module';
import { FormImageComponent } from './form-image.component';


@NgModule({
  imports: [
    CommonModule,
    ImageSelectionComponentModule,
    IonicModule
  ],
  declarations: [
    FormImageComponent
  ],
  exports: [
    FormImageComponent
  ]
})
export class FormImageComponentModule {}
