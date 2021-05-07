/* Module imports */
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'calculate'})
export class CalculatePipeStub implements PipeTransform {
  static _returnValue: (...options) => string = (): string => '';

  /**
   * Transform Stub
   *
   * @accessor: _returnValue
   *
   * @params: inputSource - object to base calculation on
   * @params: calculation - the type of value to calculate
   * @params: dataset - relevant data to perform calculation
   * @params: [refresh] - used as flag for pipe to recalculate only
   *
   * @return: string
   */
  transform(inputSource: any, calculation: any, dataset: any, refresh?: boolean): string {
    return CalculatePipeStub._returnValue(inputSource, calculation, dataset);
  }
}
