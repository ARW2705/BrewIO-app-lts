/* Module imports */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

/* Page imports */
import { ImageFormPage } from './image-form.page';

/* Component imports */
import { HeaderComponentModule } from '../../../components/header/header.module';


@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    HeaderComponentModule
  ],
  declarations: [ImageFormPage]
})
export class ImageFormPageModule {}
