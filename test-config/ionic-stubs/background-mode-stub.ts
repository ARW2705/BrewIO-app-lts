import { of } from 'rxjs';

export class BackgroundModeStub {
  _active: boolean = false;
  _enabled: boolean = false;

  public configure(options: object) {
    console.log(options);
  }

  public enable() { }

  public on() {
    return of({});
  }

  public disable() { }

  public isActive() {
    return this._active;
  }

  public isEnabled() {
    return this._enabled;
  }

  public disableBatteryOptimizations() { }

  public disableWebViewOptimizations() { }

  public overrideBackButton() { }

  public setDefaults() { }
}
