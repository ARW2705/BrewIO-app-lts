import { PlatformStub } from './platform-stub';

export class PlatformDevStub extends PlatformStub {
  _platformMock: string = '';

  constructor() {
    super();
  }

  public is(platform: string): boolean {
    return this._platformMock === platform;
  }
}
