/* Module imports */
import { Injectable } from '@angular/core';

/* Constants imports */
import { ABV_FACTORS, BIGNESS_BASE, BIGNESS_FACTOR, BOIL_TIME_EXP, BOIL_TIME_FACTOR, BRIX, ENGLISH_TEMPERATURE, FL_TO_ML, G_TO_OZ, GAL_TO_L, IBU_FACTOR, KG_TO_LB, L_TO_GAL, LARGE_ENGLISH_VOLUME, LARGE_ENGLISH_WEIGHT, LB_TO_KG, ML_TO_FL, OZ_TO_G, PLATO, PLATO_TO_SG, SG_TO_PLATO, SMALL_ENGLISH_VOLUME, SMALL_ENGLISH_WEIGHT, SPECIFIC_GRAVITY, SRM_EXP, SRM_FACTOR } from '../../shared/constants';

/* Interface imports */
import { GrainBill, Grains, Hops, HopsSchedule, RecipeVariant, SelectedUnits, YeastBatch } from '../../shared/interfaces';

/* Provider imports */
import { PreferencesService } from '../preferences/preferences.service';
import { UtilityService } from '../utility/utility.service';


@Injectable({
  providedIn: 'root'
})
export class CalculationsService {

  constructor(
    public preferenceService: PreferencesService,
    public utilService: UtilityService
  ) { }

  /***** Unit Conversions *****/

  /**
   * Convert density values between specific gravity, plato, and brix
   * Conversions use the following formulas:
   *   SG to Plato = 135.997sg^3 - 630.272sg^2 + 1111.14sg - 616.868
   *   Plato to SG = (plato / (258.6 - (227.1plato / 258.2))) + 1
   *   Plato <-> Brix considered 1:1
   *
   * @param: density - value to convert
   * @param: inputUnit - the original value unit
   * @param: outputUnit - the target value unit
   * @return: converted density value or -1 if units are not valid
   */
  convertDensity(density: number, inputUnit: string, outputUnit: string): number {
    const sg: string = SPECIFIC_GRAVITY.longName;
    const pl: string = PLATO.longName;
    const bx: string = BRIX.longName;
    if (inputUnit === sg && (outputUnit === pl || outputUnit === bx)) {
      return (Math.abs(
        (SG_TO_PLATO[0] * density ** 3)
        - (SG_TO_PLATO[1] * density ** 2)
        + (SG_TO_PLATO[2] * density)
        - SG_TO_PLATO[3]
      ));
    } else if ((inputUnit === pl || inputUnit === bx) && outputUnit === sg) {
      return ((density / (PLATO_TO_SG[0] - (density * PLATO_TO_SG[1] / PLATO_TO_SG[2]))) + 1);
    } else if (this.isValidDensityUnit(inputUnit) && this.isValidDensityUnit(outputUnit)) {
      return density;
    } else {
      return -1;
    }
  }

  /**
   * Convert temperature value between celsius and fahrenheit
   *
   * @param: temperature - value to convert
   * @param: toF - true if converting from celsius to fahrenheit, false for C -> F
   * @return: converted temperature value
   */
  convertTemperature(temperature: number, toF: boolean): number {
    return toF ? (temperature * 1.8 + 32) : ((temperature - 32) / 1.8);
  }

  /**
   * Convert volume values between metric and english standard
   *
   * @param: volume - volume value to convert
   * @param: isLarge - true if using large volume unit, false for small
   * @param: toEn - true to convert to english standard, false for metric
   * @return: converted volume value
   */
  convertVolume(volume: number, isLarge: boolean, toEn: boolean): number {
    if (isLarge) {
      return volume * (toEn ? L_TO_GAL : GAL_TO_L);
    } else {
      return volume * (toEn ? ML_TO_FL : FL_TO_ML);
    }
  }

  /**
   * Convert weight values between metric and english standard
   *
   * @param: weight - weight value to convert
   * @param: isLarge - true if using large weight unit, false for small
   * @param: toEn - true to convert to english standard, false for metric
   * @return: converted weight value
   */
  convertWeight(weight: number, isLarge: boolean, toEn: boolean): number {
    if (isLarge) {
      return weight * (toEn ? KG_TO_LB : LB_TO_KG);
    } else {
      return weight * (toEn ? G_TO_OZ : OZ_TO_G);
    }
  }

  /**
   * Check if a given density unit name is valid
   *
   * @param: unitName - density unit long name
   * @return: true if unitName matches SPECIFIC_GRAVITY, PLATO, or BRIX longName
   */
  isValidDensityUnit(unitName: string): boolean {
    return (
      unitName === SPECIFIC_GRAVITY.longName
      || unitName === PLATO.longName
      || unitName === BRIX.longName
    );
  }

  /**
   * Data is stored in english standard units and requires conversion otherwise
   *
   * @param: unitType - the unit type to check
   * @param: unit - the unit object to check
   * @return: true if the given unit requires conversion
   */
  requiresConversion(unitType: string, unit: SelectedUnits): boolean {
    switch (unitType) {
      case 'density':
        return unit.density.longName !== SPECIFIC_GRAVITY.longName;
      case 'temperature':
        return unit.temperature.longName !== ENGLISH_TEMPERATURE.longName;
      case 'volumeLarge':
        return unit.volumeLarge.longName !== LARGE_ENGLISH_VOLUME.longName;
      case 'volumeSmall':
        return unit.volumeSmall.longName !== SMALL_ENGLISH_VOLUME.longName;
      case 'weightLarge':
        return unit.weightLarge.longName !== LARGE_ENGLISH_WEIGHT.longName;
      case 'weightSmall':
        return unit.weightSmall.longName !== SMALL_ENGLISH_WEIGHT.longName;
      default:
        return false;
    }
  }

  /***** End Unit Conversions *****/


  /***** Recipe Calculations *****/

  /**
   * Calculate mash efficiency from grain bill, and measured
   * original gravity with measured batch volume
   *
   * @param: grainBill - array of grains instances
   * @param: measuredOriginalGravity - measured original gravity after mash out
   * @param: measuredBatchVolume - measured volume added to the fermenter
   * @return: updated mash efficiency
   */
  calculateMashEfficiency(
    grainBill: GrainBill[],
    measuredOriginalGravity: number,
    measuredBatchVolume: number
  ): number {
    const maxEfficiencyGravity: number = this.calculateTotalOriginalGravity(
      measuredBatchVolume,
      1,
      grainBill
    );

    return Math.round((measuredOriginalGravity - 1) / (maxEfficiencyGravity - 1) * 100);
  }

  /**
   * Calculate original gravity, final gravity, IBU, SRM, and ABV for a given recipe
   *
   * @param: variant - recipe variant values to calculate with
   * @return: none
   */
  calculateRecipeValues(variant: RecipeVariant): void {
    let og: number = 1;
    let fg: number = 1;
    let ibu: number = 0;
    let srm: number = 0;
    let abv: number = 0;

    if (variant.grains.length) {
      const defaultAttenutation: number = 75;
      const attenuationRate: number = variant.yeast.length
        ? this.getAverageAttenuation(variant.yeast)
        : defaultAttenutation;
      og = this.calculateTotalOriginalGravity(
        variant.batchVolume,
        (variant.efficiency / 100),
        variant.grains
      );
      fg = this.getFinalGravity(og, attenuationRate);
      srm = this.calculateTotalSRM(variant.grains, variant.batchVolume);
      abv = this.getABV(og, fg);
    }

    if (variant.hops.length) {
      ibu = this.calculateTotalIBU(variant.hops, og, variant.batchVolume, variant.boilVolume);
    }

    variant.originalGravity = og;
    variant.finalGravity = fg;
    variant.IBU = ibu;
    variant.SRM = srm;
    variant.ABV = abv;
  }

  /**
   * Get original gravity for all grains instances
   *
   * @param: batchVolume - volume to add to fermenter
   * @param: efficiency - expected mash efficiency as decimal between 0 - 1
   * @param: grainBill - array of grains instances
   * @return: total original gravity
   */
  calculateTotalOriginalGravity(batchVolume: number, efficiency: number, grainBill: GrainBill[]): number {
    if (!grainBill.length) {
      return 0;
    }

    return this.utilService.roundToDecimalPlace(
      grainBill.map((grainsItem: GrainBill): number => {
        return this.getOriginalGravity(
          grainsItem.grainType.gravity,
          grainsItem.quantity,
          batchVolume,
          efficiency
        );
      })
      .reduce((arr: number, curr: number): number => arr + curr - 1),
      3
    );
  }

  /**
   * Get IBU for all hops instances
   *
   * @param: hopsSchedule - array of hops instances
   * @param: og - original gravity
   * @param: batchVolume - volume in gallons to add to fermenter
   * @param: boilVolume - volume in gallons at boil start
   * @return: total IBUs
   */
  calculateTotalIBU(
    hopsSchedule: HopsSchedule[],
    og: number,
    batchVolume: number,
    boilVolume: number
  ): number {
    if (!hopsSchedule.length) {
      return 0;
    }

    return this.utilService.roundToDecimalPlace(
      hopsSchedule.map((hops: HopsSchedule): number => {
        return hops.dryHop ? 0 : this.getIBU(hops.hopsType, hops, og, batchVolume, boilVolume);
      })
      .reduce((arr: number, curr: number): number => arr + curr),
      1
    );
  }

  /**
   * Get total Standard Reference Method for all grains instances
   *
   * @param: grainBill - array of grains instances
   * @param: batchVolume - volume in gallons to add to fermenter
   * @return: total SRM value for batch
   */
  calculateTotalSRM(grainBill: GrainBill[], batchVolume: number): number {
    if (!grainBill.length) {
      return 0;
    }

    return this.utilService.roundToDecimalPlace(
      this.getSRM(
        grainBill.map((grains: GrainBill): number => {
          return this.getMCU(grains.grainType, grains, batchVolume);
        })
        .reduce((arr: number, curr: number): number => arr + curr)
      ),
      1
    );
  }

  /**
   * Get average attenuation of yeast instances
   *
   * @param: yeast - array of yeast instances
   * @return: average attenuation of yeast types in whole numbers
   */
  getAverageAttenuation(yeast: YeastBatch[]): number {
    let total: number = 0;
    let count: number = 0;
    yeast.forEach((yeastInstance: YeastBatch): void => {
      yeastInstance.yeastType.attenuation.forEach((attenuation: number): void => {
        total += attenuation;
        count++;
      });
    });

    return this.utilService.roundToDecimalPlace(total / count, 1);
  }

  /**
   * Get ABV value from original and final gravities
   * Conversion uses the following formula:
   * - original and final gravities are in specific gravity
   * ( (76.08 * (original - final)) / (1.775 - original) ) * (final / 0.794)
   *
   * @param: og - original gravity
   * @param: fg - final gravity
   * @return: ABV percentage
   * @example: (1.050, 1.010) => 5.339
   */
  getABV(og: number, fg: number): number {
    return this.utilService.roundToDecimalPlace(
      ((ABV_FACTORS[0] * (og - fg) / (ABV_FACTORS[1] - og)) * (fg / ABV_FACTORS[2])),
      3
    );
  }

  /**
   * Get original gravity by grains' gravity points
   *
   * @param: pps - gravity points from grains instance
   * @param: quantity - amount of grains in pounds
   * @param: volume - batch volume in gallons to add to fermenter
   * @param: efficiency - expected mash efficiency in decimal between 0 - 1
   * @return: original gravity value
   * @example: (1.037, 10, 5, 0.7) => 1.052
   */
  getOriginalGravity(pps: number, quantity: number, volume: number, efficiency: number): number {
    if (pps === 0) {
      return 1;
    }

    const og: number = 1 + ((pps - 1) * quantity * efficiency / volume);
    return this.utilService.roundToDecimalPlace(og, 3);
  }

  /**
   * Get final gravity by original gravity value and expected yeast attenuation
   *
   * @param: og - original gravity
   * @param: attenuation - expected yeast attenuation as whole number
   * @return: final gravity
   * @example: (1.050, 70) => 1.015
   */
  getFinalGravity(og: number, attenuation: number): number {
    const fg: number = 1 + ((og - 1) * (1 - (attenuation / 100)));
    return this.utilService.roundToDecimalPlace(fg, 3);
  }

  /**
   * Get original gravity at start of boil
   * Part of Tinseth formula for IBU
   *
   * @param: og - original gravity
   * @param: batchVolume - volume in gallons to add to fermenter
   * @param: boilVolume - volume in gallons at start of boil
   * @return: original gravity at start of boil
   * @example: (1.050, 5, 6) => 0.041666667
   */
  getBoilGravity(og: number, batchVolume: number, boilVolume: number): number {
    return this.utilService.roundToDecimalPlace((batchVolume / boilVolume) * (og - 1), 9);
  }

  /**
   * Get factor for reduced utilization from wort gravity
   * Part of Tinseth formula for IBU
   *
   * @param: boilGravity - original gravity at start of boil
   * @return: "bigness" factor
   * @example: (0.041666667) => 1.134632433
   */
  getBignessFactor(boilGravity: number) {
    return this.utilService.roundToDecimalPlace(BIGNESS_FACTOR * Math.pow(BIGNESS_BASE, boilGravity), 9);
  }

  /**
   * Get factor for change in utilization from boil time
   * Part of Tinseth formula for IBU
   *
   * @param: boilTime - the boil time in minutes
   * @return: boil time factor
   * @example: (60) => 0.219104108
   */
  getBoilTimeFactor(boilTime: number): number {
    return this.utilService.roundToDecimalPlace(
      ((1 - Math.pow(Math.E, (BOIL_TIME_EXP * boilTime))) / BOIL_TIME_FACTOR),
      9
    );
  }

  /**
   * Get utilization of hops for given bigness and boil time factors
   * Part of Tinseth formula for IBU
   *
   * @param: bignessFactor - calculated bigness factor
   * @param: boilTimeFactor - calculated boil time factor
   * @return: utilization factor
   * @example: (1.134632433, 0.219104108) => 0.248602627
   */
  getUtilization(bignessFactor: number, boilTimeFactor: number): number {
    return this.utilService.roundToDecimalPlace(bignessFactor * boilTimeFactor, 9);
  }

  /**
   * Get IBU for hops instance
   * Use Tinseth IBU formula
   *
   * @param: hops - hops-type information
   * @param: hopsInstance - a hops instance
   * @param: og - original gravity
   * @param: batchVolume - volume in gallons to add to fermenter
   * @param: boilVolume - volume in gallons at start of boil
   * @return: IBUs for hops instance
   */
  getIBU(
    hops: Hops,
    hopsInstance: HopsSchedule,
    og: number,
    batchVolume: number,
    boilVolume: number
  ): number {
    const boilGravity: number = this.getBoilGravity(og, batchVolume, boilVolume);
    const bignessFactor: number = this.getBignessFactor(boilGravity);
    const boilTimeFactor: number = this.getBoilTimeFactor(hopsInstance.duration);
    return this.utilService.roundToDecimalPlace(
      (
        hops.alphaAcid
        * hopsInstance.quantity
        * this.getUtilization(bignessFactor, boilTimeFactor)
        * IBU_FACTOR
        / batchVolume
      ),
      1
    );
  }

  /**
   * Get Malt Color Units value of given grains instance
   *
   * @param: grains - grains-type information
   * @param: grainsInstance - grains instance
   * @param: batchVolume - volume in gallons to add to fermenter
   * @return: MCU value for grains instance
   */
  getMCU(grains: Grains, grainsInstance: GrainBill, batchVolume: number): number {
    return this.utilService.roundToDecimalPlace(
      grains.lovibond * grainsInstance.quantity / batchVolume, 2
    );
  }

  /**
   * Calculate Standard Reference Method value from MCU
   *
   * @param: mcu - batch mcu value
   * @return: SRM value rounded to whole number
   */
  getSRM(mcu: number): number {
    return this.utilService.roundToDecimalPlace(SRM_FACTOR * (Math.pow(mcu, SRM_EXP)), 1);
  }

  /***** End Recipe Calculations *****/

}
