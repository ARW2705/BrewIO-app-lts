import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'ratio'})
export class RatioPipeMock implements PipeTransform {
  transform(item: any, key: string, group: any[], refresh?: boolean): string {
    return 'ok';
  }
}
