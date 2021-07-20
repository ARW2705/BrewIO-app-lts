/* Pipe imports */
import { RatioPipe } from './ratio.pipe';

/* Mock imports */
import { mockGrainBill } from '../../../../test-config/mock-models';

/* Interface imports */
import { GrainBill } from '../../shared/interfaces';


describe('RatioPipe', (): void => {
  let ratioPipe: RatioPipe;

  beforeEach((): void => {
    ratioPipe = new RatioPipe();
  });

  test('should create the pipe', (): void => {
    expect(ratioPipe).toBeTruthy();
  });

  test('should transform contributing percentage of value to the whole', (): void => {
    const _mockGrainBill: GrainBill[] = mockGrainBill();
    _mockGrainBill[1].grainType.gravity = 0;

    ratioPipe.contributesFermentable = jest
      .fn()
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true);

    ratioPipe.getTotal = jest
      .fn()
      .mockReturnValue(10.5);

    expect(ratioPipe.transform(_mockGrainBill[0], 'missing', _mockGrainBill).length).toEqual(0);
    expect(ratioPipe.transform(_mockGrainBill[1], 'quantity', _mockGrainBill)).toMatch('0%');
    expect(ratioPipe.transform(_mockGrainBill[0], 'quantity', _mockGrainBill)).toMatch('95.2%');
  });

  test('should check if grains instance contributes to fermentation', (): void => {
    const _mockGrainBill: GrainBill[] = mockGrainBill();
    _mockGrainBill[1].grainType.gravity = 0;

    expect(ratioPipe.contributesFermentable(_mockGrainBill[0])).toBe(true);
    expect(ratioPipe.contributesFermentable(_mockGrainBill[1])).toBe(false);
  });

  test('should get total quantity of group', (): void => {
    const _mockGrainBill: GrainBill[] = mockGrainBill();
    _mockGrainBill[1].grainType.gravity = 0;

    expect(ratioPipe.getTotal('quantity', _mockGrainBill)).toEqual(10.5);
  });

  test('should handle error from getTotal function', (): void => {
    const mockError: Error = new Error('test-error');
    const _mockGrainBill: GrainBill[] = mockGrainBill();

    ratioPipe.contributesFermentable = jest
      .fn()
      .mockImplementation((): void => { throw mockError; });

    const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');

    expect(ratioPipe.getTotal('quantity', _mockGrainBill)).toEqual(0);
    const consoleCalls: any[] = consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1];
    expect(consoleCalls[0]).toMatch('Ratio pipe error');
    expect(consoleCalls[1]).toStrictEqual(mockError);
  });

});
