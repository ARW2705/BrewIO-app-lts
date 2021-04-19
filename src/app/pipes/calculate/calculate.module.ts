/* Module imports */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

/* Pipe imports */
import { CalculatePipe } from './calculate.pipe';


@NgModule({
  imports: [ CommonModule ],
  declarations: [ CalculatePipe ],
  exports: [ CalculatePipe ]
})
export class CalculatePipeModule {}
