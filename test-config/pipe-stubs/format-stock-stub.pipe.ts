/* Module imports */
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'formatStock'})
export class FormatStockPipeStub implements PipeTransform {
  static _returnValue: (...options) => string = (): string => '';

  /**
   * Transform Stub
   *
   * @accessor: _returnValue
   *
   * @params: item - pipe input
   * @params: type - stock type name
   * @params: [refresh] - not used internally - changing this parameter allows
   *          manually refreshing the pipe when needed
   *
   * @return: string
   */
  transform(item: any, type: any, refresh?: boolean): string {
    return FormatStockPipeStub._returnValue(item, type, refresh);
  }
}
