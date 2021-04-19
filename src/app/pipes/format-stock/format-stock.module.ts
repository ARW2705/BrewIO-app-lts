/* Module imports */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

/* Pipe imports */
import { FormatStockPipe } from './format-stock.pipe';


@NgModule({
  imports: [ CommonModule ],
  declarations: [ FormatStockPipe ],
  exports: [ FormatStockPipe ]
})
export class FormatStockPipeModule {}
