/* Module imports */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

/* Pipe imports */
import { RoundPipe } from './round.pipe';


@NgModule({
  imports: [ CommonModule ],
  declarations: [ RoundPipe ],
  exports: [ RoundPipe ]
})
export class RoundPipeModule {}
