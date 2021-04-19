/* Module imports */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

/* Pipe imports */
import { SortPipe } from './sort.pipe';


@NgModule({
  imports: [ CommonModule ],
  declarations: [ SortPipe ],
  exports: [ SortPipe ]
})
export class SortPipeModule {}
