/* Module imports */
import { Injectable } from '@angular/core';

/* Interface imports */
import { SelectedUnits } from '@shared/interfaces';

/* Default imports */
import { defaultEnglishUnits } from '@shared/defaults';


@Injectable({
  providedIn: 'root'
})
export class PreferencesService {
  preferredUnitSystem: string = 'englishStandard';
  units: SelectedUnits = defaultEnglishUnits();

  constructor() { }

  /**
   * Get the preferred units system name
   *
   * @param: none
   * @return: none
   */
  getPreferredUnitSystemName(): string {
    return this.preferredUnitSystem;
  }

  /**
   * Get selected units
   *
   * @param: none
   * @return: none
   */
  getSelectedUnits(): SelectedUnits {
    return this.units;
  }

  /**
   * Check if density unit is either 'specific gravity', 'brix', or 'plato'
   *
   * @param: unit - unit string to test
   * @return: true if a valid unit
   */
  isValidDensityUnit(unit: string): boolean {
    return unit === 'specificgravity' || unit === 'brix' || unit === 'plato';
  }

  /**
   * Check if temperature unit is either 'celsius' or 'fahrenheit'
   *
   * @param: unit - unit string to test
   * @return: true if a valid unit
   */
  isValidTemperatureUnit(unit: string): boolean {
    return unit === 'celsius' || unit === 'fahrenheit';
  }

  /**
   * Check if unit types are valid
   *
   * @param: units - various unit strings to test
   * @return: true if all units are valid
   */
  isValidUnits(units: SelectedUnits): boolean {
    return (
      this.isValidSystem(units.system)
      && this.isValidWeightUnit(units.weightSmall.longName.toLowerCase())
      && this.isValidWeightUnit(units.weightLarge.longName.toLowerCase())
      && this.isValidVolumeUnit(units.volumeSmall.longName.toLowerCase())
      && this.isValidVolumeUnit(units.volumeLarge.longName.toLowerCase())
      && this.isValidTemperatureUnit(units.temperature.longName.toLowerCase())
      && this.isValidDensityUnit(units.density.longName.toLowerCase())
    );
  }

  /**
   * Check if volume unit is either 'milliliter', 'liter', 'fluid ounce', or 'gallon'
   *
   * @param: unit - unit string to test
   * @return: true if a valid unit
   */
  isValidVolumeUnit(unit: string): boolean {
    return unit === 'milliliter' || unit === 'liter' || unit === 'fluid ounce' || unit === 'gallon';
  }

  /**
   * Check if weight unit is either 'gram', 'kilogram', 'ounce', or 'pound'
   *
   * @param: unit - unit string to test
   * @return: true if a valid unit
   */
  isValidWeightUnit(unit: string): boolean {
    return unit === 'gram' || unit === 'kilogram' || unit === 'pound' || unit === 'ounce';
  }

  /**
   * Check if unit system is either 'metric', 'english standard', or 'other'
   *
   * @param: system - system string to test
   * @return: true if a valid unit
   */
  isValidSystem(system: string): boolean {
    return system === 'metric' || system === 'englishStandard' || system === 'other';
  }

  /**
   * Set unit system
   *
   * @param: preferredUnitSystem - unit system can be 'metric',
   *          'english standard', or 'other'
   * @param: units - the selected units
   * @return: none
   */
  setUnits(preferredUnitSystem: string, units: SelectedUnits): void {
    if (this.isValidSystem(preferredUnitSystem) && this.isValidUnits(units)) {
      this.preferredUnitSystem = preferredUnitSystem;
      this.units = units;
    } else {
      // TODO handle unit error
      console.log('unit set error', preferredUnitSystem, units);
    }
  }

}
