/* Mock imports */
import { ActionSheetStub } from './action-sheet-stub';

export class ActionSheetControllerStub {
  public _getPortal(): any {
    return {};
  }

  public create(options?: any) {
    return new ActionSheetStub();
  }
}
