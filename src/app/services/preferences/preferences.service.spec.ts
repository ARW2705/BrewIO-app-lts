/* Module imports */
import { TestBed, getTestBed, async } from '@angular/core/testing';

/* TestBed configuration imports */
import { configureTestBed } from '../../../../test-config/configure-test-bed';

/* Default imports */
import { defaultEnglish, defaultMetric } from '../../shared/defaults/default-units';

/* Interface imports */
import { SelectedUnits } from '../../shared/interfaces/units';

/* Service imports */
import { PreferencesService } from './preferences.service';


describe('PreferencesService', (): void => {
  let injector: TestBed;
  let preferenceService: PreferencesService;
  configureTestBed();

  beforeAll(async((): void => {
    TestBed.configureTestingModule({
      providers: [ PreferencesService ]
    });
  }));

  beforeEach((): void => {
    injector = getTestBed();
    preferenceService = injector.get(PreferencesService);
  });

  test('should create the service', (): void => {
    expect(preferenceService).toBeDefined();
  });

  test('should get the current preferred unit system', (): void => {
    expect(preferenceService.getPreferredUnitSystemName()).toStrictEqual('englishStandard');
  });

  test('should get the current selected units', (): void => {
    expect(preferenceService.getSelectedUnits()).toStrictEqual(defaultEnglish());
  });

  test('should check if a density unit is valid', (): void => {
    expect(preferenceService.isValidDensityUnit('specificgravity')).toBe(true);
    expect(preferenceService.isValidDensityUnit('plato')).toBe(true);
    expect(preferenceService.isValidDensityUnit('brix')).toBe(true);
    expect(preferenceService.isValidDensityUnit('invalid')).toBe(false);
  });

  test('should check if a temperature unit is valid', (): void => {
    expect(preferenceService.isValidTemperatureUnit('celsius')).toBe(true);
    expect(preferenceService.isValidTemperatureUnit('fahrenheit')).toBe(true);
    expect(preferenceService.isValidTemperatureUnit('invalid')).toBe(false);
  });

  test('should check if units are valid', (): void => {
    let testCount: number = 0;

    preferenceService.isValidSystem = jest
      .fn()
      .mockImplementation((): boolean => {
        return testCount !== 1;
      });

    preferenceService.isValidWeightUnit = jest
      .fn()
      .mockImplementation((): boolean => {
        return !(testCount === 2 || testCount === 3);
      });

    preferenceService.isValidVolumeUnit = jest
      .fn()
      .mockImplementation((): boolean => {
        return !(testCount === 4 || testCount === 5);
      });

    preferenceService.isValidTemperatureUnit = jest
      .fn()
      .mockImplementation((): boolean => {
        return testCount !== 6;
      });

    preferenceService.isValidDensityUnit = jest
      .fn()
      .mockImplementation((): boolean => {
        return testCount !== 7;
      });

    const _mockSelectedUnits: SelectedUnits = defaultEnglish();
    for (; testCount < 8; testCount++) {
      expect(preferenceService.isValidUnits(_mockSelectedUnits)).toBe(testCount === 0);
    }
  });

  test('should check if a volume unit is valid', (): void => {
    expect(preferenceService.isValidVolumeUnit('milliliter')).toBe(true);
    expect(preferenceService.isValidVolumeUnit('liter')).toBe(true);
    expect(preferenceService.isValidVolumeUnit('fluid ounce')).toBe(true);
    expect(preferenceService.isValidVolumeUnit('gallon')).toBe(true);
    expect(preferenceService.isValidVolumeUnit('invalid')).toBe(false);
  });

  test('should check if a volume unit is valid', (): void => {
    expect(preferenceService.isValidWeightUnit('gram')).toBe(true);
    expect(preferenceService.isValidWeightUnit('kilogram')).toBe(true);
    expect(preferenceService.isValidWeightUnit('pound')).toBe(true);
    expect(preferenceService.isValidWeightUnit('ounce')).toBe(true);
    expect(preferenceService.isValidWeightUnit('invalid')).toBe(false);
  });

  test('should check if a volume unit is valid', (): void => {
    expect(preferenceService.isValidSystem('metric')).toBe(true);
    expect(preferenceService.isValidSystem('englishStandard')).toBe(true);
    expect(preferenceService.isValidSystem('other')).toBe(true);
    expect(preferenceService.isValidSystem('invalid')).toBe(false);
  });

  test('should set the preferred unit system', (): void => {
    const _defaultEnglish: SelectedUnits = defaultEnglish();
    const _defaultMetric: SelectedUnits = defaultMetric();

    preferenceService.isValidSystem = jest
      .fn()
      .mockReturnValue(true);

    preferenceService.isValidUnits = jest
      .fn()
      .mockReturnValue(true);

    expect(preferenceService.preferredUnitSystem).toMatch('englishStandard');
    expect(preferenceService.units).toStrictEqual(_defaultEnglish);

    preferenceService.setUnits('metric', _defaultMetric);

    expect(preferenceService.preferredUnitSystem).toMatch('metric');
    expect(preferenceService.units).toStrictEqual(_defaultMetric);
  });

  test('should log an error if system or units are not valid', (): void => {
    const _defaultEnglish: SelectedUnits = defaultEnglish();
    const _defaultMetric: SelectedUnits = defaultMetric();
    const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'log');

    preferenceService.setUnits('invalid', _defaultMetric);

    expect(preferenceService.preferredUnitSystem).toMatch('englishStandard');
    expect(preferenceService.units).toStrictEqual(_defaultEnglish);
    expect(consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1][0]).toMatch('unit set error');
    expect(consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1][1]).toMatch('invalid');

    _defaultMetric.density.longName = 'invalid';
    preferenceService.setUnits('metric', _defaultMetric);

    expect(preferenceService.preferredUnitSystem).toMatch('englishStandard');
    expect(preferenceService.units).toStrictEqual(_defaultEnglish);
    expect(consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1][0]).toMatch('unit set error');
    expect(consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1][2].density.longName).toMatch('invalid');
  });

});
