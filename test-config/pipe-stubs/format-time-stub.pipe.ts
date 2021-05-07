/* Module imports */
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'formatTime'})
export class FormatTimePipeStub implements PipeTransform {
  static _returnValue: (...options) => string = (): string => '';

  /**
   * Transform Stub
   *
   * @accessor: _returnValue
   *
   * @params: value - pipe input
   * @params: formatType - property to transform
   *
   * @return: string
   */
  transform(value: any, formatType: any): string {
    return FormatTimePipeStub._returnValue(value, formatType);
  }
}
