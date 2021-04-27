/* Module imports */
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'formatStock'})
export class FormatStockPipeMock implements PipeTransform {
  static _returnValue: string = '';
  transform(item: any, type: any): string {
    return FormatStockPipeMock._returnValue;
  }
}

@Pipe({name: 'formatTime'})
export class FormatTimePipeMock implements PipeTransform {
  static _returnValue: string = '';
  transform(value: any, formatType: any): string {
    return FormatStockPipeMock._returnValue;
  }
}
