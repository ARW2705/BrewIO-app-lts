/* Module imports */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

/* Pipe imports */
import { FormatTimePipe } from './format-time.pipe';


@NgModule({
  imports: [ CommonModule ],
  declarations: [ FormatTimePipe ],
  exports: [ FormatTimePipe ]
})
export class FormatTimePipeModule {}
