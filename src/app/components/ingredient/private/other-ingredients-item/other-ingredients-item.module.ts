/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';

/* Component imports */
import { OtherIngredientsItemComponent } from './other-ingredients-item.component';


@NgModule({
  imports: [
    CommonModule,
    IonicModule
  ],
  declarations: [
    OtherIngredientsItemComponent
  ],
  exports: [
    OtherIngredientsItemComponent
  ]
})
export class OtherIngredientsItemComponentModule {}
