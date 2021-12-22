/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';

/* Component imports */
import { GrainBillComponentModule } from '../../private/grain-bill/grain-bill.module';
import { HopsScheduleComponentModule } from '../../private/hops-schedule/hops-schedule.module';
import { OtherIngredientsComponentModule } from '../../private/other-ingredients/other-ingredients.module';
import { YeastBatchComponentModule } from '../../private/yeast-batch/yeast-batch.module';
import { IngredientFormComponentModule } from '../ingredient-form/ingredient-form.module';
import { IngredientContainerComponent } from './ingredient-container.component';

@NgModule({
  imports: [
    CommonModule,
    GrainBillComponentModule,
    HopsScheduleComponentModule,
    IngredientFormComponentModule,
    IonicModule,
    OtherIngredientsComponentModule,
    YeastBatchComponentModule
  ],
  declarations: [ IngredientContainerComponent ],
  exports: [ IngredientContainerComponent ]
})
export class IngredientContainerComponentModule {}
