/* Module imports */
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'truncate'})
export class TruncatePipeStub implements PipeTransform {
  static _returnValue: (...options) => string = (): string => '';

  /**
   * Transform Stub
   *
   * @accessor: _returnValue
   *
   * @params: value - pipe input
   * @params: places - number of decimal places to have
   *
   * @return: string
   */
  transform(value: number, places: number): string {
    return TruncatePipeStub._returnValue(value, places);
  }
}
