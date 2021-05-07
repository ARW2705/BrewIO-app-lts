import { ModalStub } from './modal-stub';

export class ModalControllerStub {
  public _getPortal(): any {
    return {};
  }

  public create(options?: any) {
    return new ModalStub();
  }
}
