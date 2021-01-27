/* Module imports */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { PipesModule } from '../../pipes/pipes.module';

/* Component imports */
import { RecipeQuickDataComponent } from './recipe-quick-data.component';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    PipesModule
  ],
  declarations: [
    RecipeQuickDataComponent
  ],
  exports: [
    RecipeQuickDataComponent
  ]
})
export class RecipeQuickDataComponentModule {}
