/* Constant imports */
import { STOCK_TYPES } from '../../src/app/shared/constants';

/* Interface imports */
import { InventoryItem, Style } from '../../src/app/shared/interfaces';

/* Mock imports */
import { mockOptionalItemData } from './mock-optional-item-data';
import { mockStyles } from './mock-styles';

export const mockInventoryItem: () => InventoryItem = (): InventoryItem => {
  const style: Style = mockStyles()[0];
  const mock: InventoryItem = {
    _id: 'serverid',
    cid: '0123456789012',
    supplierName: 'Mock Supplier',
    stockType: STOCK_TYPES[0].name,
    initialQuantity: 5,
    currentQuantity: 1,
    description: 'Mock description',
    itemName: 'Mock Item',
    itemStyleId: style._id,
    itemStyleName: style.name,
    itemABV: 5.5,
    sourceType: 'self',
    optionalItemData: mockOptionalItemData()
  };
  return mock;
};
