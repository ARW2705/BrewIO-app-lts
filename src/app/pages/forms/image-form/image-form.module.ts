import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IonicModule } from '@ionic/angular';

import { ImageFormPage } from './image-form.page';

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
