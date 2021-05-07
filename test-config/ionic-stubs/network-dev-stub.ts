import { NetworkStub } from './network-stub';

export class NetworkDevStub extends NetworkStub {
  constructor() {
    super();
  }

  public get type(): string {
    return 'none';
  }
}
