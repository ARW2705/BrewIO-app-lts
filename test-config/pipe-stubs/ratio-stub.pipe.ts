import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'ratio'})
export class RatioPipeStub implements PipeTransform {
  static _returnValue: (...options) => string = (): string => '';

  /**
   * Transform Stub
   *
   * @accessor: _returnValue
   *
   * @params: item - pipe input
   * @params: key - item key to transform
   * @params: group - the group of items to get a total from
   * @params: [refresh] - not used internally - changing this parameter allows
   *          manually refreshing the pipe when needed
   *
   * @return: string
   */
  transform(item: any, key: string, group: any[], refresh?: boolean): string {
    return RatioPipeStub._returnValue(item, key, group, refresh);
  }
}
