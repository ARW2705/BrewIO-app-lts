export class ModalStub {
  _callbackData: any = undefined;

  _getCallBackData(): any {
    return this._callbackData;
  }

  _setCallBackData(data: any) {
    this._callbackData = data;
  }

  present(options?: any) { }
  dismiss() { }
  dismissAll() { }
  onDidDismiss(cb?) {
    if (cb) {
      cb(this._callbackData);
    }
  }
}
