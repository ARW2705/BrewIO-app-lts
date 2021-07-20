/* Interface imports */
import { DeviceInfo } from '../../src/app/shared/interfaces';

export const mockDeviceInfo: () => DeviceInfo = (): DeviceInfo => {
  const mock: DeviceInfo = {
    model: 'test model',
    os: 'test os',
    version: '12345',
    manufacturer: 'test factory',
    isVirtual: false,
    cordova: '12345',
    uuid: 'uuid'
  };
  return mock;
};
