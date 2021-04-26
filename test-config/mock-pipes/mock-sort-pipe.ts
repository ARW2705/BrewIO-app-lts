import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'sort'})
export class SortPipeMock implements PipeTransform {
  transform(arr: any[], sortBy: string): any[] {
    return arr;
  }
}
