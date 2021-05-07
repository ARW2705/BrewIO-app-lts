import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'moment'})
export class MomentPipeStub implements PipeTransform {
  static _returnValue: (...options) => string = (): string => '';

  /**
   * Transform Stub
   *
   * @accessor: _returnValue
   *
   * @params: _moment - the Moment instance
   * @params: fName - the Moment method to call
   * @params: options - any optional inputs
   *
   * @return: string
   */
  transform(moment: any, fName: string, ...options: any[]): string {
    return MomentPipeStub._returnValue(moment, fName, options);
  }
}
