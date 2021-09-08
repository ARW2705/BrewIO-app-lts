import { Injectable } from '@angular/core';

@Injectable()
export class IdServiceStub {
  cid: number;
  defaultIdRegex: RegExp;

  public getId(...options): any {}
  public getIndexById(...options): any {}
  public getNewId(): any { }
  public hasDefaultIdType(...options: any): any {}
  public hasId(...options: any): any {}
  public isMissingServerId(...options: any): any {}
}
