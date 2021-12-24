/* Module imports */
import { async, getTestBed, TestBed } from '@angular/core/testing';

/* Test configuration imports */
import { configureTestBed } from '@test/configure-test-bed';

/* Mock imports */
import { mockEnglishUnits, mockMetricUnits } from '@test/mock-models';
import { CalculationsServiceStub, PreferencesServiceStub } from '@test/service-stubs';

/* Constant imports */
import { SPECIFIC_GRAVITY } from '@shared/constants';

/* Interface imports */
import { SelectedUnits } from '@shared/interfaces';

/* Service imports */
import { CalculationsService, PreferencesService } from '@services/public';

/* Pipe imports */
import { UnitConversionPipe } from './unit-conversion.pipe';


describe('UnitConversionPipe', (): void => {
  let unitPipe: UnitConversionPipe;
  let injector: TestBed;
  let calculator: CalculationsService;
  let preferenceService: PreferencesService;
  configureTestBed();

  beforeAll(async((): void => {
    TestBed.configureTestingModule({
      providers: [
        { provide: CalculationsService, useClass: CalculationsServiceStub },
        { provide: PreferencesService, useClass: PreferencesServiceStub }
      ]
    });
    injector = getTestBed();
  }));

  beforeEach((): void => {
    calculator = injector.get(CalculationsService);
    preferenceService = injector.get(PreferencesService);
    preferenceService.getSelectedUnits = jest
      .fn()
      .mockReturnValue(mockEnglishUnits());

    unitPipe = new UnitConversionPipe(calculator, preferenceService);
  });

  test('should create the pipe', (): void => {
    expect(unitPipe).toBeTruthy();
  });

  test('should call appropriate transform helper', (): void => {
    const _mockEnglishUnits: SelectedUnits = mockEnglishUnits();

    preferenceService.getSelectedUnits = jest
      .fn()
      .mockReturnValue(_mockEnglishUnits);

    unitPipe.transformDensity = jest
      .fn()
      .mockReturnValue('1');
    unitPipe.transformTemperature = jest
      .fn()
      .mockReturnValue('1');
    unitPipe.transformVolumeLarge = jest
      .fn()
      .mockReturnValue('1');
    unitPipe.transformVolumeSmall = jest
      .fn()
      .mockReturnValue('1');
    unitPipe.transformWeightLarge = jest
      .fn()
      .mockReturnValue('1');
    unitPipe.transformWeightSmall = jest
      .fn()
      .mockReturnValue('1');

    const densitySpy: jest.SpyInstance = jest.spyOn(unitPipe, 'transformDensity');
    const temperatureSpy: jest.SpyInstance = jest.spyOn(unitPipe, 'transformTemperature');
    const volumeLargeSpy: jest.SpyInstance = jest.spyOn(unitPipe, 'transformVolumeLarge');
    const volumeSmallSpy: jest.SpyInstance = jest.spyOn(unitPipe, 'transformVolumeSmall');
    const weightLargeSpy: jest.SpyInstance = jest.spyOn(unitPipe, 'transformWeightLarge');
    const weightSmallSpy: jest.SpyInstance = jest.spyOn(unitPipe, 'transformWeightSmall');

    expect(unitPipe.transform('1', 'density', false)).toMatch('1');
    expect(densitySpy).toHaveBeenCalledWith('1', _mockEnglishUnits, false);

    expect(unitPipe.transform('1', 'temperature', false)).toMatch('1');
    expect(temperatureSpy).toHaveBeenCalledWith('1', _mockEnglishUnits, false);

    expect(unitPipe.transform('1', 'volumeLarge', false)).toMatch('1');
    expect(volumeLargeSpy).toHaveBeenCalledWith('1', _mockEnglishUnits, false);

    expect(unitPipe.transform('1', 'volumeSmall', false)).toMatch('1');
    expect(volumeSmallSpy).toHaveBeenCalledWith('1', _mockEnglishUnits, false);

    expect(unitPipe.transform('1', 'weightLarge', false)).toMatch('1');
    expect(weightLargeSpy).toHaveBeenCalledWith('1', _mockEnglishUnits, false);

    expect(unitPipe.transform('1', 'weightSmall', false, false, true)).toMatch('1');
    expect(weightSmallSpy).toHaveBeenCalledWith('1', _mockEnglishUnits, false, true);

    expect(unitPipe.transform(-1, 'density')).toMatch('--');
    expect(unitPipe.transform('1', 'other')).toMatch('--');

    expect(densitySpy).toHaveBeenCalledTimes(1);
    expect(temperatureSpy).toHaveBeenCalledTimes(1);
    expect(volumeLargeSpy).toHaveBeenCalledTimes(1);
    expect(volumeSmallSpy).toHaveBeenCalledTimes(1);
    expect(weightLargeSpy).toHaveBeenCalledTimes(1);
    expect(weightSmallSpy).toHaveBeenCalledTimes(1);
  });

  test('should transform density value', (): void => {
    const _mockEnglishUnits: SelectedUnits = mockEnglishUnits();
    const _mockMetricUnits: SelectedUnits = mockMetricUnits();

    calculator.requiresConversion = jest
      .fn()
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);

    calculator.convertDensity = jest
      .fn()
      .mockImplementation((value: number, ...options: any[]): number => value);

    const convertSpy: jest.SpyInstance = jest.spyOn(calculator, 'convertDensity');

    expect(unitPipe.transformDensity(1.05, _mockMetricUnits, true))
      .toMatch(`1.1${_mockMetricUnits.density.symbol}`);
    expect(unitPipe.transformDensity(1.05, _mockMetricUnits, false)).toMatch('1.1');
    expect(unitPipe.transformDensity(1.05, _mockEnglishUnits)).toMatch('1.050');
    expect(convertSpy).toHaveBeenNthCalledWith(
      1,
      1.05,
      SPECIFIC_GRAVITY.longName,
      _mockMetricUnits.density.longName
    );
    expect(convertSpy).toHaveBeenCalledTimes(2);
  });

  test('should transform temperature value', (): void => {
    const _mockEnglishUnits: SelectedUnits = mockEnglishUnits();
    const _mockMetricUnits: SelectedUnits = mockMetricUnits();

    calculator.requiresConversion = jest
      .fn()
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(false);

    calculator.convertTemperature = jest
      .fn()
      .mockImplementation((value: number, ...options: any[]): number => value);

    const convertSpy: jest.SpyInstance = jest.spyOn(calculator, 'convertTemperature');

    expect(unitPipe.transformTemperature(10, _mockMetricUnits, true))
      .toMatch(`10.0${_mockMetricUnits.temperature.shortName}`);
    expect(unitPipe.transformTemperature(10, _mockMetricUnits, false)).toMatch('10.0');
    expect(unitPipe.transformTemperature(10, _mockEnglishUnits)).toMatch('10.0');
    expect(unitPipe.transformTemperature(10, _mockEnglishUnits, true)).toMatch(`10.0${_mockEnglishUnits.temperature.shortName}`);
    expect(convertSpy).toHaveBeenNthCalledWith(1, 10, false);
    expect(convertSpy).toHaveBeenCalledTimes(2);
  });

  test('should transform large volume value', (): void => {
    const _mockEnglishUnits: SelectedUnits = mockEnglishUnits();
    const _mockMetricUnits: SelectedUnits = mockMetricUnits();

    calculator.requiresConversion = jest
      .fn()
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(false);

    calculator.convertVolume = jest
      .fn()
      .mockImplementation((value: number, ...options: any[]): number => value);

    const convertSpy: jest.SpyInstance = jest.spyOn(calculator, 'convertVolume');

    expect(unitPipe.transformVolumeLarge(10, _mockMetricUnits, true))
      .toMatch(`10.00${_mockMetricUnits.volumeLarge.shortName}`);
    expect(unitPipe.transformVolumeLarge(10, _mockMetricUnits, false)).toMatch('10.00');
    expect(unitPipe.transformVolumeLarge(10, _mockEnglishUnits)).toMatch('10.00');
    expect(unitPipe.transformVolumeLarge(10, _mockEnglishUnits, true)).toMatch(`10.00${_mockEnglishUnits.volumeLarge.shortName}`);
    expect(convertSpy).toHaveBeenNthCalledWith(1, 10, true, false);
    expect(convertSpy).toHaveBeenCalledTimes(2);
  });

  test('should transform small volume value', (): void => {
    const _mockEnglishUnits: SelectedUnits = mockEnglishUnits();
    const _mockMetricUnits: SelectedUnits = mockMetricUnits();

    calculator.requiresConversion = jest
      .fn()
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(false);

    calculator.convertVolume = jest
      .fn()
      .mockImplementation((value: number, ...options: any[]): number => value);

    const convertSpy: jest.SpyInstance = jest.spyOn(calculator, 'convertVolume');

    expect(unitPipe.transformVolumeSmall(10, _mockMetricUnits, true))
      .toMatch(`10${_mockMetricUnits.volumeSmall.shortName}`);
    expect(unitPipe.transformVolumeSmall(10, _mockMetricUnits, false)).toMatch('10');
    expect(unitPipe.transformVolumeSmall(10, _mockEnglishUnits)).toMatch('10');
    expect(unitPipe.transformVolumeSmall(10, _mockEnglishUnits, true)).toMatch(`10${_mockEnglishUnits.volumeSmall.shortName}`);
    expect(convertSpy).toHaveBeenNthCalledWith(1, 10, false, false);
    expect(convertSpy).toHaveBeenCalledTimes(2);
  });

  test('should transform large weight value', (): void => {
    const _mockEnglishUnits: SelectedUnits = mockEnglishUnits();
    const _mockMetricUnits: SelectedUnits = mockMetricUnits();

    calculator.requiresConversion = jest
      .fn()
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(false);

    calculator.convertWeight = jest
      .fn()
      .mockImplementation((value: number, ...options: any[]): number => value);

    const convertSpy: jest.SpyInstance = jest.spyOn(calculator, 'convertWeight');

    expect(unitPipe.transformWeightLarge(10, _mockMetricUnits, true))
      .toMatch(`10.00${_mockMetricUnits.weightLarge.shortName}`);
    expect(unitPipe.transformWeightLarge(10, _mockMetricUnits, false)).toMatch('10.00');
    expect(unitPipe.transformWeightLarge(10, _mockEnglishUnits)).toMatch('10.00');
    expect(unitPipe.transformWeightLarge(10, _mockEnglishUnits, true)).toMatch(`10.00${_mockEnglishUnits.weightLarge.shortName}`);
    expect(convertSpy).toHaveBeenNthCalledWith(1, 10, true, false);
    expect(convertSpy).toHaveBeenCalledTimes(2);
  });

  test('should transform small weight value', (): void => {
    const _mockEnglishUnits: SelectedUnits = mockEnglishUnits();
    const _mockMetricUnits: SelectedUnits = mockMetricUnits();

    unitPipe.reformatWeightSmallDescription = jest
      .fn()
      .mockReturnValue('test value');

    calculator.requiresConversion = jest
      .fn()
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(false);

    calculator.convertWeight = jest
      .fn()
      .mockImplementation((value: number, ...options: any[]): number => value);

    const convertSpy: jest.SpyInstance = jest.spyOn(calculator, 'convertWeight');
    const reformatSpy: jest.SpyInstance = jest.spyOn(unitPipe, 'reformatWeightSmallDescription');

    expect(unitPipe.transformWeightSmall(10, _mockMetricUnits, true, true)).toMatch('test value');
    expect(reformatSpy).toHaveBeenCalledWith(10, _mockMetricUnits, true);
    expect(unitPipe.transformWeightSmall(10, _mockMetricUnits, true))
      .toMatch(`10.00${_mockMetricUnits.weightSmall.shortName}`);
    expect(unitPipe.transformWeightSmall(10, _mockMetricUnits, false)).toMatch('10.00');
    expect(unitPipe.transformWeightSmall(10, _mockEnglishUnits)).toMatch('10.00');
    expect(unitPipe.transformWeightSmall(10, _mockEnglishUnits, true)).toMatch(`10.00${_mockEnglishUnits.weightSmall.shortName}`);
    expect(convertSpy).toHaveBeenNthCalledWith(1, 10, false, false);
    expect(convertSpy).toHaveBeenCalledTimes(2);
  });

  test('should reformat a small weight description', (): void => {
    const _mockMetricUnits: SelectedUnits = mockMetricUnits();

    unitPipe.canReformatDescription = jest
      .fn()
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);

    calculator.convertWeight = jest
      .fn()
      .mockImplementation((value: number, ...options: any[]): number => value);

    expect(unitPipe.reformatWeightSmallDescription('Hops addition: 1.5oz', _mockMetricUnits, true))
      .toMatch('Hops addition: 1.50g');
    expect(unitPipe.reformatWeightSmallDescription('Hops addition: 1.5oz', _mockMetricUnits, false))
      .toMatch('Hops addition: 1.5oz');
  });

  test('should check if description can be reformatted', (): void => {
    const _mockEnglishUnits: SelectedUnits = mockEnglishUnits();

    calculator.requiresConversion = jest
      .fn()
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);

    expect(unitPipe.canReformatDescription(_mockEnglishUnits, true)).toBe(true);
    expect(unitPipe.canReformatDescription(_mockEnglishUnits, false)).toBe(false);
    expect(unitPipe.canReformatDescription(_mockEnglishUnits, true)).toBe(false);
  });

});
