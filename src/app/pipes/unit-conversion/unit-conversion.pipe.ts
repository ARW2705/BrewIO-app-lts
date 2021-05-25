/* Module imports */
import { Pipe, PipeTransform } from '@angular/core';

/* Constant imports */
import * as Units from '../../shared/constants/units';

/* Interface imports */
import { SelectedUnits } from '../../shared/interfaces/units';

/* Service imports */
import { CalculationsService } from '../../services/calculations/calculations.service';
import { PreferencesService } from '../../services/preferences/preferences.service';


@Pipe({
  name: 'unitConversion',
})
export class UnitConversionPipe implements PipeTransform {

  constructor(
    public calculator: CalculationsService,
    public preferenceService: PreferencesService
  ) { }

  /**
   * Convert values to the preferred units; All values are stored as english
   * standard, only convert if units are a different standard; truncate long
   * decimal values
   *
   * @params: value - value to convert
   * @params: unitType - measurement type for unit
   * @params: [showSymbol] - true to add relevant symbol at the end of result
   * @params: [refresh] - not used internally - changing this parameter allows
   *          manually refreshing the pipe from the component when needed
   * @params: [reformat] - true to replace units in a larger text string
   *
   * @return: formatted string of converted value
   */
  transform(
    value: number | string,
    unitType: string,
    showSymbol?: boolean,
    refresh?: boolean,
    reformat?: boolean
  ): string {
    if (value === -1) {
      return '--';
    }

    const units: SelectedUnits = this.preferenceService.getSelectedUnits();
    switch (unitType) {
      case 'density':
        return this.transformDensity(value, units, showSymbol);
      case 'temperature':
        return this.transformTemperature(value, units, showSymbol);
      case 'volumeLarge':
        return this.transformVolumeLarge(value, units, showSymbol);
      case 'volumeSmall':
        return this.transformVolumeSmall(value, units, showSymbol);
      case 'weightLarge':
        return this.transformWeightLarge(value, units, showSymbol);
      case 'weightSmall':
        return this.transformWeightSmall(value, units, showSymbol, reformat);
      default:
        return '--';
    }
  }

  /**
   * Convert density values to the preferred units; All values are stored as english
   * standard, only convert if units are a different standard; truncate long
   * decimal values
   *
   * @params: value - value to convert
   * @params: unitType - measurement type for unit
   * @params: [showSymbol] - true to add relevant symbol at the end of result
   *
   * @return: formatted string of converted value
   */
  transformDensity(value: number | string, units: SelectedUnits, showSymbol?: boolean): string {
    if (this.calculator.requiresConversion('density', units)) {
      return (
          this.calculator.convertDensity(
            <number>value,
            Units.SPECIFIC_GRAVITY.longName,
            units.density.longName
          )
          .toFixed(1)
        )
        + (showSymbol ? units.density.symbol : '');
    }
    return (<number>value).toFixed(3);
  }

  /**
   * Convert temperature values to the preferred units; All values are stored as english
   * standard, only convert if units are a different standard; truncate long
   * decimal values
   *
   * @params: value - value to convert
   * @params: unitType - measurement type for unit
   * @params: [showSymbol] - true to add relevant symbol at the end of result
   *
   * @return: formatted string of converted value
   */
  transformTemperature(value: number | string, units: SelectedUnits, showSymbol?: boolean): string {
    if (this.calculator.requiresConversion('temperature', units)) {
      return this.calculator.convertTemperature(<number>value, false).toFixed(1)
        + (showSymbol ? units.temperature.shortName : '');
    }
    return (<number>value).toFixed(1) + (showSymbol ? units.temperature.shortName : '');
  }

  /**
   * Convert large volume values to the preferred units; All values are stored as english
   * standard, only convert if units are a different standard; truncate long
   * decimal values
   *
   * @params: value - value to convert
   * @params: unitType - measurement type for unit
   * @params: [showSymbol] - true to add relevant symbol at the end of result
   *
   * @return: formatted string of converted value
   */
  transformVolumeLarge(value: number | string, units: SelectedUnits, showSymbol?: boolean): string {
    if (this.calculator.requiresConversion('volumeLarge', units)) {
      return this.calculator.convertVolume(<number>value, true, false).toFixed(2)
        + (showSymbol ? units.volumeLarge.shortName : '');
    }
    return (<number>value).toFixed(2) + (showSymbol ? units.volumeLarge.shortName : '');
  }

  /**
   * Convert small volume values to the preferred units; All values are stored as english
   * standard, only convert if units are a different standard; truncate long
   * decimal values
   *
   * @params: value - value to convert
   * @params: unitType - measurement type for unit
   * @params: [showSymbol] - true to add relevant symbol at the end of result
   *
   * @return: formatted string of converted value
   */
  transformVolumeSmall(value: number | string, units: SelectedUnits, showSymbol?: boolean): string {
    if (this.calculator.requiresConversion('volumeSmall', units)) {
      return this.calculator.convertVolume(<number>value, false, false).toFixed(0)
        + (showSymbol ? units.volumeSmall.shortName : '');
    }
    return (<number>value).toFixed(0) + (showSymbol ? units.volumeSmall.shortName : '');
  }

  /**
   * Convert large weight values to the preferred units; All values are stored as english
   * standard, only convert if units are a different standard; truncate long
   * decimal values
   *
   * @params: value - value to convert
   * @params: unitType - measurement type for unit
   * @params: [showSymbol] - true to add relevant symbol at the end of result
   *
   * @return: formatted string of converted value
   */
  transformWeightLarge(value: number | string, units: SelectedUnits, showSymbol?: boolean): string {
    if (this.calculator.requiresConversion('weightLarge', units)) {
      return this.calculator.convertWeight(<number>value, true, false).toFixed(2)
        + (showSymbol ? units.weightLarge.shortName : '');
    }
    return (<number>value).toFixed(2) + (showSymbol ? units.weightLarge.shortName : '');
  }

  /**
   * Convert small weight values to the preferred units; All values are stored as english
   * standard, only convert if units are a different standard; truncate long
   * decimal values
   *
   * @params: value - value to convert
   * @params: unitType - measurement type for unit
   * @params: [showSymbol] - true to add relevant symbol at the end of result
   *
   * @return: formatted string of converted value
   */
  transformWeightSmall(
    value: number | string,
    units: SelectedUnits,
    showSymbol?: boolean,
    reformat?: boolean
  ): string {
    if (reformat) {
      return this.reformatWeightSmallDescription(<string>value, units, showSymbol);
    } else if (this.calculator.requiresConversion('weightSmall', units)) {
      return this.calculator.convertWeight(<number>value, false, false).toFixed(2)
        + (showSymbol ? units.weightSmall.shortName : '');
    }
    return (<number>value).toFixed(2) + (showSymbol ? units.weightSmall.shortName : '');
  }

  /**
   * Take an input hops addition description and convert it to metric
   * (e.g. 'Hops addition: 1oz' -> 'Hops addition: 28.35g')
   *
   * @params: value - description text to alter
   * @params: units - currently selected units
   * @params: showSymbol - true to show unit symbol, false to leave it blank
   *
   * @return: updated text
   */
  reformatWeightSmallDescription(
    value: string,
    units: SelectedUnits,
    showSymbol: boolean
  ): string {
    const foundQuantity: string[] = value.match(/(\d+.)?\d+(?=oz)/g);

    if (this.canReformatDescription(units, !!foundQuantity)) {
      return `${value.split(':')[0]}: ${this.calculator.convertWeight(parseFloat(foundQuantity[0]), false, false).toFixed(2)}${showSymbol ? units.weightSmall.shortName : ''}`;
    }

    return value;
  }

  /**
   * Check if small weight description can be reformatted
   *
   * @params: units - currently selected units
   * @params: foundQuantity - true if regex for quantity was matched
   *
   * @return true if conversion is required and regex matches an oz symbol
   */
  canReformatDescription(units: SelectedUnits, foundQuantity: boolean): boolean {
    return this.calculator.requiresConversion('weightSmall', units) && foundQuantity;
  }

}
