/* Module imports */
import { TestBed, getTestBed, async } from '@angular/core/testing';

/* Test configuration imports */
import { configureTestBed } from '@test/configure-test-bed';

/* Mock imports */
import { mockEnglishUnits, mockMetricUnits, mockGrainBill, mockHopsSchedule, mockYeastBatch, mockRecipeVariantComplete } from '@test/mock-models';
import { PreferencesServiceStub, UtilityServiceStub } from '@test/service-stubs';

/* Constant imports */
import { BRIX, PLATO, SPECIFIC_GRAVITY } from '@shared/constants';

/* Interace Imports */
import { GrainBill, HopsSchedule, YeastBatch, RecipeVariant, SelectedUnits} from '@shared/interfaces';

/* Provider imports */
import { PreferencesService, UtilityService } from '@services/public';
import { CalculationsService } from './calculations.service';


describe('CalculationsService', (): void => {
  configureTestBed();
  let injector: TestBed;
  let service: CalculationsService;
  let preferenceService: PreferencesService;

  beforeAll(async((): void => {
    TestBed.configureTestingModule({
      providers: [
        CalculationsService,
        { provide: PreferencesService, useClass: PreferencesServiceStub },
        { provide: UtilityService, useClass: UtilityServiceStub }
      ]
    });
    injector = getTestBed();
    service = injector.get(CalculationsService);
    preferenceService = injector.get(PreferencesService);
    preferenceService.getSelectedUnits = jest.fn()
      .mockReturnValue(mockEnglishUnits());
    service.utilService.roundToDecimalPlace = jest.fn()
      .mockImplementation((value: number, places: number): number => {
        if (places < 0) {
          return -1;
        }
        return Math.round(value * Math.pow(10, places)) / Math.pow(10, places);
      });
  }));

  test('should create the service', (): void => {
    expect(service).toBeTruthy();
  });

  describe('Handle unit conversions', (): void => {

    test('should convert density: Brix -> SG', (): void => {
      expect(
        service.utilService.roundToDecimalPlace(
          service.convertDensity(12, BRIX.longName, SPECIFIC_GRAVITY.longName),
          3
        )
      ).toEqual(1.048);
    });

    test('should convert density: SG -> Plato', (): void => {
      expect(
        service.utilService.roundToDecimalPlace(
          service.convertDensity(1.06, SPECIFIC_GRAVITY.longName, PLATO.longName),
          1
        )
      )
      .toEqual(14.7);
    });

    test('should convert density: Plato -> Brix', (): void => {
      expect(
        service.utilService.roundToDecimalPlace(
          service.convertDensity(13.5, PLATO.longName, BRIX.longName),
          1
        )
      )
      .toEqual(13.5);
    });

    test('should return -1 if unknown source or target unit', (): void => {
      expect(service.convertDensity(10, 'unknown', 'unknown')).toEqual(-1);
    });

    test('should convert temperature', (): void => {
      expect(service.convertTemperature(20, true)).toEqual(68);
      expect(service.convertTemperature(68, false)).toEqual(20);
      expect(service.convertTemperature(-40, true)).toEqual(-40);
    });

    test('should convert volume to metric', (): void => {
      // Gallon -> Liter
      expect(service.utilService.roundToDecimalPlace(service.convertVolume(3, true, false), 2)).toEqual(11.36);
      // Fluid ounce -> Milliliter
      expect(service.utilService.roundToDecimalPlace(service.convertVolume(24, false, false), 0)).toEqual(710);
    });

    test('should convert volume to english standard', (): void => {
      // Liter -> Gallon
      expect(service.utilService.roundToDecimalPlace(service.convertVolume(12, true, true), 2)).toEqual(3.17);
      // Milliliter -> Fluid ounce
      expect(service.utilService.roundToDecimalPlace(service.convertVolume(500, false, true), 2)).toEqual(16.91);
    });

    test('should convert weight to metric', (): void => {
      // Pound -> Kilogram
      expect(service.utilService.roundToDecimalPlace(service.convertWeight(3, true, false), 2)).toEqual(1.36);
      // Ounce -> Gram
      expect(service.utilService.roundToDecimalPlace(service.convertWeight(8, false, false), 0)).toEqual(227);
    });

    test('should convert weight to english standard', (): void => {
      // Kilogram -> Pound
      expect(service.utilService.roundToDecimalPlace(service.convertWeight(3, true, true), 1)).toEqual(6.6);
      // Gram -> Ounce
      expect(service.utilService.roundToDecimalPlace(service.convertWeight(100, false, true), 1)).toEqual(3.5);
    });

    test('should check if a density unit long name is valid', (): void => {
      expect(service.isValidDensityUnit(SPECIFIC_GRAVITY.longName)).toBe(true);
      expect(service.isValidDensityUnit(PLATO.longName)).toBe(true);
      expect(service.isValidDensityUnit(BRIX.longName)).toBe(true);
      expect(service.isValidDensityUnit('unknown')).toBe(false);
    });

    test('should check if a unit requires conversion', (): void => {
      const _mockEnglishUnits: SelectedUnits = mockEnglishUnits();
      _mockEnglishUnits.density = BRIX;
      const _mockMetricUnits: SelectedUnits = mockMetricUnits();

      expect(service.requiresConversion('density', _mockEnglishUnits)).toBe(true);
      expect(service.requiresConversion('density', _mockMetricUnits)).toBe(false);
      expect(service.requiresConversion('temperature', _mockEnglishUnits)).toBe(false);
      expect(service.requiresConversion('temperature', _mockMetricUnits)).toBe(true);
      expect(service.requiresConversion('volumeLarge', _mockEnglishUnits)).toBe(false);
      expect(service.requiresConversion('volumeLarge', _mockMetricUnits)).toBe(true);
      expect(service.requiresConversion('volumeSmall', _mockEnglishUnits)).toBe(false);
      expect(service.requiresConversion('volumeSmall', _mockMetricUnits)).toBe(true);
      expect(service.requiresConversion('weightLarge', _mockEnglishUnits)).toBe(false);
      expect(service.requiresConversion('weightLarge', _mockMetricUnits)).toBe(true);
      expect(service.requiresConversion('weightSmall', _mockEnglishUnits)).toBe(false);
      expect(service.requiresConversion('weightSmall', _mockMetricUnits)).toBe(true);
      expect(service.requiresConversion('unknown', _mockMetricUnits)).toBe(false);
    });

  });

  describe('Calculates with provided values', (): void => {

    test('should calculate ABV from og: 1.050 and fg: 1.010', (): void => {
      expect(service.getABV(1.050, 1.010)).toEqual(5.339);
    });

    test('should calculate SRM from MCU: 64.3', (): void => {
      expect(service.getSRM(64.3)).toEqual(25.9);
    });

    test('should calculate Boil Time Factor from boil time: 60 minutes', (): void => {
      expect(service.getBoilTimeFactor(60)).toEqual(0.219104108);
    });

    test('should calculate Boil Gravity from og: 1.050, batch volume: 5 gal, boil volue: 6 gal', (): void => {
      expect(service.getBoilGravity(1.050, 5, 6)).toEqual(0.041666667);
    });

    test('should calculate Bigness Factor from boil gravity: 0.041666667', (): void => {
      expect(service.getBignessFactor(0.041666667)).toEqual(1.134632433);
    });

    test('should calculate Utilization from bigness factor: 1.134632433 and boil time factor: 0.219104108', (): void => {
      expect(service.getUtilization(1.134632433, 0.219104108)).toEqual(0.248602627);
    });

    test('should calculate Original Gravity from gravity: 37 pps, quantity: 10 lbs, volume: 5 gal, efficiency: 70%', (): void => {
      expect(service.getOriginalGravity(1.037, 10, 5, 0.7)).toEqual(1.052);
    });

    test('should calculate Original Gravity to 1 if a pps of 0 is given', (): void => {
      expect(service.getOriginalGravity(0, 10, 5, 0.7)).toEqual(1.000);
    });

    test('should calculate Final Gravity from og: 1.050 and attenuation: 70%', (): void => {
      expect(service.getFinalGravity(1.050, 70)).toEqual(1.015);
    });

  });


  describe('\nCalculates with provided ingredients', (): void => {
    const _mockGrainBill: GrainBill[] = mockGrainBill();
    const _mockHopsSchedule: HopsSchedule[] = mockHopsSchedule();
    const _mockYeastBatch: YeastBatch[] = mockYeastBatch();

    test('should calculate mash efficiency: 10 gal and provided GrainBill and Measured Efficiency', (): void => {
      expect(service.calculateMashEfficiency(_mockGrainBill, 1.035, 10)).toEqual(74);
    });

    test('should calculate MCU from volume: 5 gal and provided GrainBill item', (): void => {
      expect(service.getMCU(_mockGrainBill[0].grainType, _mockGrainBill[0], 5)).toEqual(3.6);
    });

    test('should calculate Original Gravity from batch volume: 5 gal, efficiency: 70, and provided Grain Bill', (): void => {
      expect(service.calculateTotalOriginalGravity(5, 0.7, _mockGrainBill)).toEqual(1.065);
    });

    test('should calculate 0 gravity with empty grain bill', (): void => {
      expect(service.calculateTotalOriginalGravity(5, 0.7, [])).toEqual(0);
    });

    test('should calculate Total SRM from volume: 5 gal and provided Grain Bill', (): void => {
      expect(service.calculateTotalSRM(_mockGrainBill, 5)).toEqual(19.6);
    });

    test('should calculate 0 SRM with empty grain bill', (): void => {
      expect(service.calculateTotalSRM([], 5)).toEqual(0);
    });

    test('should calculate IBU from provided Hops Type, provided Hops Schedule item, og: 1.050, batch volume: 5 gal, boil volume: 6 gal', (): void => {
      expect(service.getIBU(_mockHopsSchedule[0].hopsType, _mockHopsSchedule[0], 1.050, 5, 6)).toEqual(35.4);
    });

    test('should calculate Total IBU from provided Hops Schedule, og: 1.050, batch volume: 5 gal, boil volume: 6 gal', (): void => {
      expect(service.calculateTotalIBU(_mockHopsSchedule, 1.050, 5, 6)).toEqual(43.4);
    });

    test('should calculate 0 IBU with empty hops schedule', (): void => {
      expect(service.calculateTotalIBU([], 1.040, 5, 5)).toEqual(0);
    });

    test('should calculate Avg Attenutation from provided yeast group', (): void => {
      expect(service.getAverageAttenuation(_mockYeastBatch)).toEqual(74);
    });

  });


  describe('\nCalculates with complete recipe', (): void => {
    const _mockRecipeVariantComplete: RecipeVariant = mockRecipeVariantComplete();

    beforeAll((): void => {
      service.calculateRecipeValues(_mockRecipeVariantComplete);
    });

    test('should calculate Original Gravity from complete recipe', (): void => {
      expect(_mockRecipeVariantComplete.originalGravity).toEqual(1.065);
    });

    test('should calculate Final Gravity from complete recipe', (): void => {
      expect(_mockRecipeVariantComplete.finalGravity).toEqual(1.017);
    });

    test('should calculate Total IBU from complete recipe', (): void => {
      expect(_mockRecipeVariantComplete.IBU).toEqual(38.8);
    });

    test('should calculate Total SRM from complete recipe', (): void => {
      expect(_mockRecipeVariantComplete.SRM).toEqual(19.6);
    });

    test('should calculate ABV from complete recipe', (): void => {
      expect(_mockRecipeVariantComplete.ABV).toEqual(6.588);
    });

  });


  describe('\nCalculates with incomplete recipe: no grains', (): void => {
    const _mockRecipeWithoutGrains: RecipeVariant = mockRecipeVariantComplete();

    beforeAll((): void => {
      _mockRecipeWithoutGrains.grains = [];
      service.calculateRecipeValues(_mockRecipeWithoutGrains);
    });

    test('should calculate ABV from recipe without grains', (): void => {
      expect(_mockRecipeWithoutGrains.ABV).toEqual(0);
    });

    test('should calculate Original Gravity from recipe without grains', (): void => {
      expect(_mockRecipeWithoutGrains.originalGravity).toEqual(1.000);
    });

    test('should calculate Final Gravity from recipe without grains', (): void => {
      expect(_mockRecipeWithoutGrains.originalGravity).toEqual(1.000);
    });

    test('should calculate Total IBU from recipe without grains', (): void => {
      expect(_mockRecipeWithoutGrains.IBU).toEqual(63.1);
    });

    test('should calculate Total SRM from recipe without grains', (): void => {
      expect(_mockRecipeWithoutGrains.SRM).toEqual(0);
    });

  });


  describe('\nCalculates with incomplete recipe: no hops', (): void => {
    const _mockRecipeWithoutHops: RecipeVariant = mockRecipeVariantComplete();

    beforeAll((): void => {
      _mockRecipeWithoutHops.hops = [];
      service.calculateRecipeValues(_mockRecipeWithoutHops);
    });

    test('should calculate Total IBU from recipe without hops', (): void => {
      expect(_mockRecipeWithoutHops.IBU).toEqual(0);
    });

  });

  describe('\nCalculates with incomplete recipe: no yeast', (): void => {
    const _mockRecipeWithoutYeast: RecipeVariant = mockRecipeVariantComplete();

    beforeAll((): void => {
      _mockRecipeWithoutYeast.yeast = [];
      service.calculateRecipeValues(_mockRecipeWithoutYeast);
    });

    test('should calculate ABV from recipe without yeast - default attenuation 75', (): void => {
      expect(_mockRecipeWithoutYeast.ABV).toEqual(6.719);
    });

  });

});
