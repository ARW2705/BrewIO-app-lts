/* Module imports */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { TruncatePipeModule } from '../../pipes/truncate/truncate.module';
import { UnitConversionPipeModule } from '../../pipes/unit-conversion/unit-conversion.module';

/* Component imports */
import { RecipeQuickDataComponent } from './recipe-quick-data.component';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    TruncatePipeModule,
    UnitConversionPipeModule
  ],
  declarations: [
    RecipeQuickDataComponent
  ],
  exports: [
    RecipeQuickDataComponent
  ]
})
export class RecipeQuickDataComponentModule {}
