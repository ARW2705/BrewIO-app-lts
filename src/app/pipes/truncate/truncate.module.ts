/* Module imports */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

/* Pipe imports */
import { TruncatePipe } from './truncate.pipe';


@NgModule({
  imports: [ CommonModule ],
  declarations: [ TruncatePipe ],
  exports: [ TruncatePipe ]
})
export class TruncatePipeModule {}
