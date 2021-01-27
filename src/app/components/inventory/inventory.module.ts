/* Module imports */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { PipesModule } from '../../pipes/pipes.module';
import { AccordionComponentModule } from '../accordion/accordion.module';
import { ImageFormPageModule } from '../../pages/forms/image-form/image-form.module';

/* Component imports */
import { InventoryComponent } from './inventory.component';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    PipesModule,
    AccordionComponentModule,
    ImageFormPageModule
  ],
  declarations: [
    InventoryComponent
  ],
  exports: [
    InventoryComponent
  ]
})
export class InventoryComponentModule {}
