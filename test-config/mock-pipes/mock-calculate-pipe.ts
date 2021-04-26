/* Module imports */
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'calculate'})
export class CalculatePipeMock implements PipeTransform {
  transform(inputSource: any, calculation: any, dataset: any): string {
    return 'ok';
  }
}
