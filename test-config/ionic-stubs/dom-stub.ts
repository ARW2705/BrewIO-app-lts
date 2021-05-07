import { ElementStub } from './element-stub';

export class DomStub {
  public debouncer(): any { }

  public querySelector(value: any) {
    return new ElementStub();
  }
}
