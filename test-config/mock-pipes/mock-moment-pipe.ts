import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'moment'})
export class MomentPipeMock implements PipeTransform {
  transform(moment: any, fName: string, ...options: any[]): string {
    if (moment) {
      return moment.toISOString();
    }
    return moment;
  }
}
