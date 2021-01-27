import { NgModule } from '@angular/core';
import { SortPipe } from './sort/sort.pipe';
import { UnitConversionPipe } from './unit-conversion/unit-conversion.pipe';
import { RatioPipe } from './ratio/ratio.pipe';
import { CalculatePipe } from './calculate/calculate.pipe';
import { TruncatePipe } from './truncate/truncate.pipe';
import { RoundPipe } from './round/round.pipe';
import { FormatStockPipe } from './format-stock/format-stock.pipe';
import { MomentPipe } from './moment/moment.pipe';
import { FormatTimePipe } from './format-time/format-time.pipe';


@NgModule({
	declarations: [
		SortPipe,
    UnitConversionPipe,
    RatioPipe,
    CalculatePipe,
    TruncatePipe,
    RoundPipe,
    FormatStockPipe,
    MomentPipe,
    FormatTimePipe
  ],
	exports: [
		SortPipe,
    UnitConversionPipe,
    RatioPipe,
    CalculatePipe,
    TruncatePipe,
    RoundPipe,
    FormatStockPipe,
    MomentPipe,
    FormatTimePipe
	]
})
export class PipesModule {}
