/* Module imports */
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'unitConversion'})
export class UnitConversionPipeMock implements PipeTransform {
  static _returnValue: string = '';
  transform(
    value: any,
    unitType: any,
    showSymbol?: boolean,
    refresh?: boolean,
    reformat?: boolean
  ): string {
    return UnitConversionPipeMock._returnValue;
  }
}
