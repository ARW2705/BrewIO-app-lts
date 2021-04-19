/* Module imports */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

/* Pipe imports */
import { MomentPipe } from './moment.pipe';


@NgModule({
  imports: [ CommonModule ],
  declarations: [ MomentPipe ],
  exports: [ MomentPipe ]
})
export class MomentPipeModule {}
