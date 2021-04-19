/* Module imports */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

/* Pipe imports */
import { UnitConversionPipe } from './unit-conversion.pipe';


@NgModule({
  imports: [ CommonModule ],
  declarations: [ UnitConversionPipe ],
  exports: [ UnitConversionPipe ]
})
export class UnitConversionPipeModule {}
