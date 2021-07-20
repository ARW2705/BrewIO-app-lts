/* Mock imports */
import { mockInventoryItem } from '../../../../test-config/mock-models';

/* Constant imports */
import { STOCK_TYPES } from '../../shared/constants';

/* Interface imports */
import { InventoryItem, StockType } from '../../shared/interfaces';

/* Pipe imports */
import { FormatStockPipe } from './format-stock.pipe';


describe('FormatStockPipe', (): void => {
  let formatPipe: FormatStockPipe;

  beforeEach((): void => {
    formatPipe = new FormatStockPipe();
  });

  test('should create the pipe', (): void => {
    expect(formatPipe).toBeTruthy();
  });

  test('should call appropriate formatting helper on transform', (): void => {
    const _mockInventoryItem: InventoryItem = mockInventoryItem();

    formatPipe.formatItemQuantityText = jest
      .fn()
      .mockReturnValue('quantity');

    formatPipe.formatItemTypeText = jest
      .fn()
      .mockReturnValue('type');

    const quantitySpy: jest.SpyInstance = jest.spyOn(formatPipe, 'formatItemQuantityText');
    const typeSpy: jest.SpyInstance = jest.spyOn(formatPipe, 'formatItemTypeText');

    expect(formatPipe.transform(_mockInventoryItem, 'quantity')).toMatch('quantity');
    expect(quantitySpy).toHaveBeenCalledWith(_mockInventoryItem);

    expect(formatPipe.transform(_mockInventoryItem, 'type')).toMatch('type');
    expect(typeSpy).toHaveBeenCalledWith(_mockInventoryItem);

    expect(formatPipe.transform(_mockInventoryItem, 'other').length).toEqual(0);
    expect(quantitySpy).toHaveBeenCalledTimes(1);
    expect(typeSpy).toHaveBeenCalledTimes(1);
  });

  test('should format the quantity text', (): void => {
    const _mockInventoryItem: InventoryItem = mockInventoryItem();
    const _mockDiscreteType: StockType = STOCK_TYPES.find((type: StockType): boolean => type.isDiscreteUnit);
    const _mockCapacityType: StockType = STOCK_TYPES.find((type: StockType): boolean => !type.isDiscreteUnit);

    _mockInventoryItem.currentQuantity = 5;
    _mockInventoryItem.initialQuantity = 10;
    _mockInventoryItem.stockType = _mockDiscreteType.name;

    expect(formatPipe.formatItemQuantityText(_mockInventoryItem)).toMatch('5');

    _mockInventoryItem.stockType = _mockCapacityType.name;

    expect(formatPipe.formatItemQuantityText(_mockInventoryItem)).toMatch('50%');
  });

  test('should format the type name text', (): void => {
    const _mockInventoryItem: InventoryItem = mockInventoryItem();
    const _mockDiscreteType: StockType = STOCK_TYPES.find((type: StockType): boolean => type.isDiscreteUnit);
    const _mockCapacityType: StockType = STOCK_TYPES.find((type: StockType): boolean => !type.isDiscreteUnit);

    _mockInventoryItem.currentQuantity = 5;
    _mockInventoryItem.stockType = _mockDiscreteType.name;

    expect(formatPipe.formatItemTypeText(_mockInventoryItem)).toMatch('Bottles');

    _mockInventoryItem.currentQuantity = 1;

    expect(formatPipe.formatItemTypeText(_mockInventoryItem)).toMatch('Bottle');

    _mockInventoryItem.stockType = _mockCapacityType.name;

    expect(formatPipe.formatItemTypeText(_mockInventoryItem)).toMatch('Growler');
  });

});
