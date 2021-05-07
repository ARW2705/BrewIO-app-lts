import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'sort'})
export class SortPipeStub implements PipeTransform {
  static _returnValue: (...options) => any[] = (): any[] => [];

  /**
   * Transform Stub
   *
   * @accessor: _returnValue
   *
   * @params: arr - input array
   * @params: sortBy - sort on property
   *
   * @return: string
   */
  transform(arr: any[], sortBy: string): any[] {
    return SortPipeStub._returnValue(arr, sortBy);
  }
}
