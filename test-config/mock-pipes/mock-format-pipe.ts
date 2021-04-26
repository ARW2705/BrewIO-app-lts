/* Module imports */
import { Pipe, PipeTransform } from '@angular/core';

/* Interface imports */
import { InventoryItem } from '../../src/app/shared/interfaces/inventory-item';


@Pipe({name: 'formatStock'})
export class FormatStockPipeMock implements PipeTransform {
  transform(item: any, type: any): string {
    return 'ok';
  }
}

@Pipe({name: 'formatTime'})
export class FormatTimePipeMock implements PipeTransform {
  transform(value: any, formatType: any): string {
    return 'ok';
  }
}
