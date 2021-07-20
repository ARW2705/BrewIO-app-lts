/* Interface imports */
import { OptionalItemData } from '../../src/app/shared/interfaces';

/* Mock imports */
import { mockImage } from './mock-image';

export const mockOptionalItemData: () => OptionalItemData = (): OptionalItemData => {
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
    supplierLabelImage: mockImage(),
    supplierURL: 'url'
  };
  return mock;
};
