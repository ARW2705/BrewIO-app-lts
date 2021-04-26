/* Module imports */
import { Pipe, PipeTransform } from '@angular/core';


@Pipe({name: 'truncate'})
export class TruncatePipeMock implements PipeTransform {
  transform(value: any, places: any): string {
    return '10';
  }
}
