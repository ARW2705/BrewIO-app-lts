/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';

/* Page imports */
import { ImageFormPage } from './image-form.page';

/* Component imports */
import { HeaderComponentModule } from '../../../components/shared/public';


@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    HeaderComponentModule
  ],
  declarations: [ImageFormPage]
})
export class ImageFormPageModule {}
