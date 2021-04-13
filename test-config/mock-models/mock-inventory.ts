import { STOCK_TYPES } from '../../src/app/shared/constants/stock-types';

import { InventoryItem, OptionalItemData } from '../../src/app/shared/interfaces/inventory-item';
import { Style } from '../../src/app/shared/interfaces/library';

import { mockImage } from './mock-image';
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

export const mockOptionalItemData = () => {
  const mock: OptionalItemData = {
    batchId: '0123456789012',
    itemLabelImage: mockImage(),
    itemIBU: 30,
    itemSRM: 20,
    itemSubname: 'mock subname',
    packagingDate: 'mockdate',
    originalRecipe: 'originalid',
    remainingColor: '#fd4855',
    srmColor: '#963500',
    supplierLabelImage: mockImage()
  };
  return mock;
};
