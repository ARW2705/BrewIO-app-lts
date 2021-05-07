import { Injectable } from '@angular/core';

@Injectable()
export class PreferencesServiceStub {
  public getPreferredUnitSystemName() {}
  public getSelectedUnits() {}
  public isValidDensityUnit(...options) {}
  public isValidTemperatureUnit(...options) {}
  public isValidUnits(...options) {}
  public isValidVolumeUnit(...options) {}
  public isValidWeightUnit(...options) {}
  public isValidSystem(...options) {}
  public setUnits(...options) {}
}
