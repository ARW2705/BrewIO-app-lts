/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';

/* Component imports */
import { OtherIngredientsItemComponentModule } from '../other-ingredients-item/other-ingredients-item.module';
import { OtherIngredientsComponent } from './other-ingredients.component';


@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    OtherIngredientsItemComponentModule
  ],
  declarations: [
    OtherIngredientsComponent
  ],
  exports: [
    OtherIngredientsComponent
  ]
})
export class OtherIngredientsComponentModule {}
