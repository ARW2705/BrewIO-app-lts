/* Module imports */
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'unitConversion'})
export class UnitConversionPipeMock implements PipeTransform {
  transform(
    value: any,
    unitType: any,
    showSymbol?: boolean,
    refresh?: boolean,
    reformat?: boolean
  ): string {
    return 'ok';
  }
}
