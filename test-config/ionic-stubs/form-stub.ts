export class FormStub {
  _ids: number = -1;
  public nextId(): number {
    return ++this._ids;
  }
}
