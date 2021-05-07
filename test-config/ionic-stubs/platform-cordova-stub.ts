import { PlatformStub } from './platform-stub';

export class PlatformCordovaStub extends PlatformStub {
  _platformMock: string = 'cordova';

  constructor() {
    super();
  }

  public is(platform: string): boolean {
    return this._platformMock === platform;
  }
}
