export class ToastStub {
  present() { }
  dismiss() { }
  dismissAll() { }
  onDidDismiss(): Promise<any> { return Promise.resolve(); }
}
