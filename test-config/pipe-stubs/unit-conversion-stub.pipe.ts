/* Module imports */
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'unitConversion'})
export class UnitConversionPipeStub implements PipeTransform {
  static _returnValue: (...options) => string = (): string => '';

  /**
   * Transform Stub
   *
   * @accessor: _returnValue
   *
   * @params: value - pipe input
   * @params: unitType - unit name e.g. 'weightSmall'
   * @params: [showSymbol] - true to show unit symbol
   * @params: [refresh] - value not used, only for pipe value refresh
   * @params: [reformat] - true to replace units in a larger text string
   *
   * @return: string
   */
  transform(
    value: any,
    unitType: any,
    showSymbol?: boolean,
    refresh?: boolean,
    reformat?: boolean
  ): string {
    return UnitConversionPipeStub._returnValue(value, unitType, showSymbol, refresh, reformat);
  }
}
