/* Module imports */
import { Pipe, PipeTransform } from '@angular/core';


@Pipe({name: 'round'})
export class RoundPipeStub implements PipeTransform {
  static _returnValue: (...options) => number = (): number => 1;

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
  transform(value: any): number {
    return RoundPipeStub._returnValue(value);
  }
}
