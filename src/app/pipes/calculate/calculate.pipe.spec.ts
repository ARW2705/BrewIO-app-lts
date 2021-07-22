/* Module imports */
import { async, getTestBed, TestBed } from '@angular/core/testing';

/* Test configuration imports */
import { configureTestBed } from '../../../../test-config/configure-test-bed';

/* Mock imports */
import { mockHopsSchedule, mockRecipeVariantComplete } from '../../../../test-config/mock-models';
import { CalculationsServiceStub } from '../../../../test-config/service-stubs';

/* Interface imports */
import { HopsSchedule, RecipeVariant } from '../../shared/interfaces';

/* Service imports */
import { CalculationsService } from '../../services/services';

/* Pipe imports */
import { CalculatePipe } from './calculate.pipe';


describe('CalculatePipe', (): void => {
  let calcPipe: CalculatePipe;
  let injector: TestBed;
  let calculator: CalculationsService;
  configureTestBed();

  beforeAll(async((): void => {
    TestBed.configureTestingModule({
      providers: [
        { provide: CalculationsService, useClass: CalculationsServiceStub }
      ]
    });
  }));

  beforeEach((): void => {
    injector = getTestBed();
    calculator = injector.get(CalculationsService);
    calcPipe = new CalculatePipe(calculator);
  });

  test('should create the pipe', (): void => {
    expect(calcPipe).toBeTruthy();
  });

  test('should transform an ibu value', (): void => {
    const _mockHopsSchedule: HopsSchedule = mockHopsSchedule()[0];
    const _mockRecipeVariantComplete: RecipeVariant = mockRecipeVariantComplete();

    calcPipe.getIBU = jest
      .fn()
      .mockImplementation((hopsValue: HopsSchedule, ...options: any[]): number => {
        return hopsValue.quantity * 2;
      });

    expect(calcPipe.transform(_mockHopsSchedule, 'ibu', _mockRecipeVariantComplete)).toMatch(`${_mockHopsSchedule.quantity * 2}.0 IBU`);
  });

  test('should get empty string on transform with unhandled calculation type input', (): void => {
    expect(calcPipe.transform({}, 'other', {}).length).toEqual(0);
  });

  test('should get IBU of hops schedule component', (): void => {
    const _mockHopsSchedule: HopsSchedule = mockHopsSchedule()[0];
    const _mockRecipeVariantComplete: RecipeVariant = mockRecipeVariantComplete();

    calculator.getIBU = jest
      .fn()
      .mockReturnValue(10);

    const calcSpy: jest.SpyInstance = jest.spyOn(calculator, 'getIBU');

    expect(calcPipe.getIBU(_mockHopsSchedule, _mockRecipeVariantComplete)).toEqual(10);
    expect(calcSpy).toHaveBeenCalledWith(
      _mockHopsSchedule.hopsType,
      _mockHopsSchedule,
      _mockRecipeVariantComplete.originalGravity,
      _mockRecipeVariantComplete.batchVolume,
      _mockRecipeVariantComplete.boilVolume
    );
  });

  test('should handle error getting IBU from calculator', (): void => {
    const mockError: Error = new Error('test-error');
    const _mockHopsSchedule: HopsSchedule = mockHopsSchedule()[0];
    const _mockRecipeVariantComplete: RecipeVariant = mockRecipeVariantComplete();

    calculator.getIBU = jest
      .fn()
      .mockImplementation((): void => { throw mockError; });

    const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');

    expect(calcPipe.getIBU(_mockHopsSchedule, _mockRecipeVariantComplete)).toEqual(0);
    const consoleCalls: any[] = consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1];
    expect(consoleCalls[0]).toMatch('Calculate pipe error');
    expect(consoleCalls[1]).toStrictEqual(mockError);
  });

});
