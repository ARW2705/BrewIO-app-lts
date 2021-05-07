import { ToastStub } from './toast-stub';

export class ToastControllerStub {
  public _getPortal(): any {
    return {};
  }

  public create(options?: any) {
    return new ToastStub();
  }
}
