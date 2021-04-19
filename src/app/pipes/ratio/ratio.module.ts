/* Module imports */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

/* Pipe imports */
import { RatioPipe } from './ratio.pipe';


@NgModule({
  imports: [ CommonModule ],
  declarations: [ RatioPipe ],
  exports: [ RatioPipe ]
})
export class RatioPipeModule {}
