/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';

/* Page imports */
import { FormButtonsComponentModule } from '@components/form-elements/public/form-buttons/form-buttons.module';
import { ImageSelectionComponent } from './image-selection.component';


@NgModule({
  imports: [
    CommonModule,
    FormButtonsComponentModule,
    IonicModule
  ],
  declarations: [ImageSelectionComponent]
})
export class ImageSelectionComponentModule {}
