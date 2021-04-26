/* Module imports */
import { Pipe, PipeTransform } from '@angular/core';


@Pipe({name: 'round'})
export class RoundPipeMock implements PipeTransform {
  transform(value: any): number {
    return 1;
  }
}
