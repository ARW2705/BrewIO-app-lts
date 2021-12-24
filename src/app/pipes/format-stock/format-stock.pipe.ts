/* Module imports */
import { Pipe, PipeTransform } from '@angular/core';

/* Constant imports */
import { STOCK_TYPES } from '@shared/constants';

/* Interface imports */
import { InventoryItem, StockType } from '@shared/interfaces';


@Pipe({
  name: 'formatStock',
})
export class FormatStockPipe implements PipeTransform {

  /**
   * Format stock output based on type
   *
   * @params: item - parent item
   * @params: type - transform either the stock value or name
   * @params: [refresh] - used as flag for pipe to recalculate only
   *
   * @return: formatted stock value or name
   */
  transform(item: InventoryItem, type: string, refresh?: boolean): string {
    switch (type) {
      case 'quantity':
        return this.formatItemQuantityText(item);
      case 'type':
        return this.formatItemTypeText(item);
      default:
        return '';
    }
  }

  /**
   * Format the item quantity message depending on whether the stock type uses
   * discrete units or is capacity based
   *
   * @params: item - the parent item
   *
   * @return: formatted quantity message as current units if in discrete units
   * or as a percentage remaining if capacity based
   */
  formatItemQuantityText(item: InventoryItem): string {
    const stockType: StockType = STOCK_TYPES
      .find((type: StockType): boolean => type.name === item.stockType);

    if (stockType.isDiscreteUnit) {
      return item.currentQuantity.toString();
    } else {
      const remaining: number = Math.floor(item.currentQuantity / item.initialQuantity * 100);
      return`${remaining}%`;
    }
  }

  /**
   * Format the stock type name with prefix name removed (e.g. 'Standard Can' becomes 'Can')
   *
   * @params: item - the parent item
   *
   * @return: the formatted stock type name
   */
  formatItemTypeText(item: InventoryItem): string {
    const stockType: StockType = STOCK_TYPES
      .find((type: StockType) => type.name === item.stockType);

    let stockName: string = stockType.name.split(' ').slice(-1)[0];

    if (stockType.isDiscreteUnit) {
      if (item.currentQuantity > 1) {
        stockName += 's';
      }
    }

    return stockName;
  }

}
