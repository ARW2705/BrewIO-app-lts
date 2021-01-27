/* Module imports */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

/* Component imports */
import { OtherIngredientsComponent } from './other-ingredients.component';

@NgModule({
  imports: [
    CommonModule,
    IonicModule
  ],
  declarations: [
    OtherIngredientsComponent
  ],
  exports: [
    OtherIngredientsComponent
  ]
})
export class OtherIngredientsComponentModule {}
